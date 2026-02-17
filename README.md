# 🏈 NFL Mock Draft Simulator

An interactive single-page NFL Mock Draft Simulator where you draft for your chosen team while AI controls the remaining opponents. Built as a full-stack application with LLM-powered decision-making for AI-controlled teams.

> **Loom Walkthrough:** [Watch the 5 minute demo →](https://www.loom.com/share/bc2c2f7bdcfe4cc88c8908256eecbeac) 

---

## ✨ Features

- **Team Selection** — Choose from the top 7 picking teams in the 2026 NFL Draft
- **4-Round Draft** — 28 total picks (7 teams × 4 rounds) from a pool of 30 prospects
- **AI-Powered Opponents** — 6 AI-controlled teams make contextually intelligent picks using OpenAI GPT, considering team needs, player talent, and draft strategy
- **Live Big Board** — Real-time view of available prospects ranked by talent (curated by NFL Draft analyst Tony Pauline)
- **Draft History & Progress** — Round-by-round pick tracker with team-specific views
- **Pick Animations** — Animated pick cards with AI reasoning for every selection
- **Positional Needs Tracking** — Visual indicators of each team's remaining needs throughout the draft
- **Fast-Forward Mode** — Skip ahead through AI picks when it's not your turn
- **Post-Draft Grades** — AI-generated draft grades and analysis for every team after the final pick
- **Deterministic Fallbacks** — Graceful degradation if the LLM is unavailable; the draft always completes

---

## 🏗️ Architecture

### Tech Stack

| Layer     | Technology                                  |
| --------- | ------------------------------------------- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI        | [React 19](https://react.dev/) + TypeScript |
| Styling   | [Tailwind CSS 4](https://tailwindcss.com/)  |
| AI / LLM  | [OpenAI GPT](https://platform.openai.com/)  (via OpenAI SDK) |
| Language  | TypeScript (strict)                         |

### Project Structure

```
├── app/
│   ├── api/draft/
│   │   ├── ai-pick/route.ts     # AI pick endpoint — LLM call + retry + fallback
│   │   └── grade/route.ts       # Post-draft grading endpoint
│   ├── globals.css              # Global styles & design tokens
│   ├── layout.tsx               # Root layout with DraftProvider
│   └── page.tsx                 # Entry point — phase-based rendering
│
├── src/
│   ├── components/
│   │   ├── TeamSelection.tsx    # Pre-draft team picker
│   │   ├── DraftBoard.tsx       # Main draft orchestrator
│   │   ├── BigBoard.tsx         # Available prospects list
│   │   ├── CurrentPick.tsx      # Active pick indicator
│   │   ├── DraftHistory.tsx     # Round-by-round pick log
│   │   ├── DraftSummary.tsx     # Post-draft results & grades
│   │   ├── PickAnimation.tsx    # Animated pick card with reasoning
│   │   ├── ProgressTracker.tsx  # Draft progress bar
│   │   ├── RoundTransition.tsx  # Round change animation
│   │   ├── SuggestedPicks.tsx   # Recommended picks for user's turn
│   │   ├── TeamNeeds.tsx        # Team positional needs display
│   │   ├── TeamLogo.tsx         # Team logo/shield component
│   │   ├── DraftShield.tsx      # Draft shield animation
│   │   └── PositionIcon.tsx     # Position badge component
│   │
│   ├── context/
│   │   └── DraftContext.tsx     # React Context + useReducer state management
│   │
│   ├── data/
│   │   ├── players.ts          # Top 30 prospects (EssentiallySports Big Board)
│   │   └── teams.ts            # 7 teams with needs & context
│   │
│   └── types/
│       └── index.ts            # TypeScript types, constants, & position mappings
```

### State Management

All draft state is managed via **React Context + `useReducer`**, providing a single source of truth:

```
Phase Flow:  team-select  →  drafting  →  complete
```

- **`team-select`** — User picks which team to control
- **`drafting`** — Turn-by-turn picks; detects user vs AI turns automatically
- **`complete`** — Draft is over; triggers grade API call and displays summary

State shape includes: current pick index, drafted players, available players, AI picking status, and error state. Helper functions derive the active team, round number, and user turn status from the pick index.

### AI Integration

The backend exposes two API routes under `/api/draft/`:

#### `POST /api/draft/ai-pick`
Handles AI team selections. For each pick:
1. Builds a structured prompt with team needs, draft context, available players, and recent pick history
2. Calls the OpenAI GPT API with JSON-only response formatting
3. Validates the response (ensures the selected player ID exists in the available pool)
4. **Retry logic**: Up to 3 attempts with exponential backoff (1s → 2s → 4s)
5. **Fallback**: If all LLM calls fail, uses a deterministic algorithm (priority-need match → best player available)

#### `POST /api/draft/grade`
Generates post-draft analysis for all 7 teams:
1. Sends each team's picks, needs, and context to the LLM
2. Returns letter grades (A+ through F) with 2–3 sentence analysis per team
3. Same retry + fallback pattern as the pick endpoint

> **Key design choice:** All LLM calls happen server-side via Next.js API routes — no API keys are ever exposed to the client.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** (comes with Node.js)
- An **OpenAI-compatible API key** (e.g., OpenAI, Groq, or any OpenAI-compatible provider)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your-username>/nfl-mock-draft-simulator.git
   cd nfl-mock-draft-simulator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the project root:

   ```env
   GROQ_API_KEY=your_api_key_here
   ```

   > The app uses the OpenAI SDK pointed at an OpenAI-compatible endpoint. Replace the key with your own.

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 🎮 How to Use

1. **Select Your Team** — Choose one of the 7 teams to control for the draft
2. **Draft When It's Your Turn** — When highlighted, pick from the Big Board or suggested picks
3. **Watch AI Teams Pick** — AI opponents make selections with reasoning displayed on each pick card
4. **Use Fast-Forward** — Skip through AI picks to get to your next turn faster
5. **Review Results** — After all 28 picks, view draft grades and analysis for every team

---

## 🧠 AI Decision-Making

The AI GM considers four factors when making each pick:

| Factor               | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| **Positional Need**  | Team needs are provided in priority order                  |
| **Player Talent**    | Big Board ranking — lower rank = better player             |
| **Draft Round**      | Early rounds favor elite talent; later rounds fill needs   |
| **Draft Context**    | What other teams have already picked affects availability  |

When the LLM is unavailable, the deterministic fallback algorithm:
1. Iterates through team needs in priority order
2. Selects the first available player matching a need
3. Falls back to best player available (BPA) if no needs match

---

## 📋 Teams & Pick Order

| Pick | Team                    | Primary Needs   |
| ---- | ----------------------- | --------------- |
| 1    | Las Vegas Raiders       | QB, CB, OL      |
| 2    | New York Jets           | OL, WR, QB      |
| 3    | Arizona Cardinals       | QB, OL, WR      |
| 4    | Tennessee Titans        | OL, WR, EDGE    |
| 5    | New York Giants         | WR, EDGE, OL    |
| 6    | Cleveland Browns        | EDGE, WR, CB    |
| 7    | Washington Commanders   | EDGE, CB, LB    |

Same pick order repeats across all 4 rounds.


## 📄 License

This project was built as a take-home assignment.
