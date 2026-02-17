import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AiPickRequest, AiPickResponse, Player, Position } from '@/types';

// ─── Groq Client (OpenAI-compatible) ────────────────────────────────────────

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

// ─── Fallback Logic ─────────────────────────────────────────────────────────

/**
 * Deterministic fallback when LLM is unavailable.
 * Priority: first available player matching a team need, else best available.
 */
function fallbackPick(
    availablePlayers: Player[],
    needs: Position[]
): { playerId: number; reasoning: string } {
    // Try each need in priority order
    for (const need of needs) {
        const match = availablePlayers.find((p) => {
            if (need === 'OL') return p.position === 'OT' || p.position === 'OG';
            return p.position === need;
        });
        if (match) {
            return {
                playerId: match.id,
                reasoning: `Selected via fallback logic — best available player at a position of need (${need}).`,
            };
        }
    }

    // BPA: take the highest-ranked available player
    const bpa = availablePlayers[0];
    return {
        playerId: bpa.id,
        reasoning: `Selected via fallback logic — best player available regardless of position.`,
    };
}

// ─── Retry Helper ───────────────────────────────────────────────────────────

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── POST Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        const body: AiPickRequest = await request.json();
        const { team, availablePlayers, round, pickNumber, draftHistory } = body;

        // Validate input
        if (!team || !availablePlayers?.length) {
            return NextResponse.json(
                { error: 'Invalid request: missing team or available players' },
                { status: 400 }
            );
        }

        // Build the prompt
        const playerList = availablePlayers
            .map(
                (p) => `  #${p.id} ${p.name} — ${p.position} — ${p.school} — ${p.summary}`
            )
            .join('\n');

        const recentHistory =
            draftHistory.length > 0
                ? `\nRecent picks:\n${draftHistory
                    .slice(-7)
                    .map((h) => `  ${h.teamName} → ${h.playerName} (${h.position})`)
                    .join('\n')}`
                : '';

        const systemPrompt = `You are an expert NFL General Manager making draft selections for the ${team.name}.
You analyze player talent, team needs, and draft value to make optimal picks.
You MUST respond with ONLY valid JSON in this exact format: {"playerId": <number>, "reasoning": "<1-2 sentence explanation>"}
No other text, no markdown, no code fences. Just the JSON object.`;

        const userPrompt = `You are the GM of the ${team.name}.

Team needs (priority order): ${team.needs.join(', ')}
Team context: ${team.context}

This is Round ${round}, Pick #${pickNumber} overall.
${recentHistory}

Available players (ranked by talent):
${playerList}

Consider:
1. Positional need priority — higher-priority needs should be weighted more
2. Player talent/ranking — lower rank numbers = better players
3. Draft value — in early rounds, lean toward elite talent; in later rounds, fill needs
4. What positions other teams have already drafted

Select the best player for your team. Respond with JSON only: {"playerId": <number>, "reasoning": "<explanation>"}`;

        // Retry loop with exponential backoff
        const MAX_RETRIES = 3;
        const RETRY_DELAYS = [1000, 2000, 4000];

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const completion = await groq.chat.completions.create({
                    model: 'moonshotai/kimi-k2-instruct',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: 0.7,
                    max_tokens: 150,
                });

                const content = completion.choices[0]?.message?.content?.trim();
                if (!content) throw new Error('Empty response from LLM');

                // Parse response — handle potential markdown code fences
                const cleaned = content
                    .replace(/```json\s*/g, '')
                    .replace(/```\s*/g, '')
                    .trim();

                const parsed = JSON.parse(cleaned);

                // Validate the pick
                const selectedPlayer = availablePlayers.find(
                    (p) => p.id === parsed.playerId
                );
                if (!selectedPlayer) {
                    throw new Error(
                        `LLM returned invalid playerId: ${parsed.playerId}`
                    );
                }

                const response: AiPickResponse = {
                    playerId: parsed.playerId,
                    reasoning:
                        parsed.reasoning || 'Selected based on team needs and talent.',
                    isFallback: false,
                };

                return NextResponse.json(response);
            } catch (err) {
                console.error(
                    `AI pick attempt ${attempt + 1}/${MAX_RETRIES} failed:`,
                    err
                );

                if (attempt < MAX_RETRIES - 1) {
                    await sleep(RETRY_DELAYS[attempt]);
                }
            }
        }

        // All retries failed — use deterministic fallback
        console.warn('All LLM retries failed. Using fallback pick logic.');
        const fb = fallbackPick(availablePlayers, team.needs);

        const response: AiPickResponse = {
            ...fb,
            isFallback: true,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('AI pick endpoint error:', error);

        return NextResponse.json(
            { error: 'Internal server error processing AI pick' },
            { status: 500 }
        );
    }
}