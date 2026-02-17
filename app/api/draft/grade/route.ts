import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

interface TeamDraftSummary {
    teamName: string;
    needs: string[];
    context: string;
    picks: Array<{
        round: number;
        playerName: string;
        position: string;
        rankOnBoard: number;
    }>;
}

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
    try {
        const body: { teams: TeamDraftSummary[] } = await request.json();
        const { teams } = body;

        if (!teams?.length) {
            return NextResponse.json(
                { error: 'Invalid request: missing teams data' },
                { status: 400 }
            );
        }

        const teamsBreakdown = teams
            .map(
                (t) =>
                    `${t.teamName} (needs: ${t.needs.join(', ')}; context: ${t.context}):\n${t.picks
                        .map((p) => `  R${p.round}: ${p.playerName} (${p.position}, ranked #${p.rankOnBoard})`)
                        .join('\n')}`
            )
            .join('\n\n');

        const systemPrompt = `You are an expert NFL Draft analyst. Grade each team's draft class.
You MUST respond with ONLY valid JSON — an array of objects with this exact format:
[{"teamName": "<name>", "grade": "<A+ to F>", "analysis": "<2-3 sentence analysis>"}]
No other text. No markdown. Just the JSON array.`;

        const userPrompt = `Grade each team's draft performance. Consider:
- Did they address priority needs?
- Did they get good value (low-ranked picks = better talent)?
- Overall draft strategy and roster building

${teamsBreakdown}

Respond with JSON only.`;

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
                    temperature: 0.6,
                    max_tokens: 600,
                });

                const content = completion.choices[0]?.message?.content?.trim();
                if (!content) throw new Error('Empty response from LLM');

                const cleaned = content
                    .replace(/```json\s*/g, '')
                    .replace(/```\s*/g, '')
                    .trim();

                const grades = JSON.parse(cleaned);

                if (!Array.isArray(grades)) {
                    throw new Error('Response is not an array');
                }

                return NextResponse.json({ grades, isFallback: false });
            } catch (err) {
                console.error(`Draft grade attempt ${attempt + 1}/${MAX_RETRIES} failed:`, err);
                if (attempt < MAX_RETRIES - 1) {
                    await sleep(RETRY_DELAYS[attempt]);
                }
            }
        }

        // Fallback grades
        const fallbackGrades = teams.map((t) => {
            const needsAddressed = t.picks.filter((p) =>
                t.needs.some((need) => {
                    if (need === 'OL') return p.position === 'OT' || p.position === 'OG';
                    return need === p.position;
                })
            ).length;

            const avgRank = t.picks.reduce((sum, p) => sum + p.rankOnBoard, 0) / t.picks.length;

            let grade = 'B';
            if (needsAddressed >= 2 && avgRank <= 15) grade = 'A';
            else if (needsAddressed >= 2) grade = 'A-';
            else if (needsAddressed >= 1 && avgRank <= 15) grade = 'B+';
            else if (needsAddressed >= 1) grade = 'B';
            else grade = 'C+';

            return {
                teamName: t.teamName,
                grade,
                analysis: `Addressed ${needsAddressed} of ${t.needs.length} primary needs. Average player ranking: #${avgRank.toFixed(0)}.`,
            };
        });

        return NextResponse.json({ grades: fallbackGrades, isFallback: true });
    } catch (error) {
        console.error('Draft grade endpoint error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}