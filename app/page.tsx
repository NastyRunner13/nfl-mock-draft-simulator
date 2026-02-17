'use client';

import { useDraft } from '@/context/DraftContext';
import TeamSelection from '@/components/TeamSelection';
import DraftBoard from '@/components/DraftBoard';
import DraftSummary from '@/components/DraftSummary';

export default function Home() {
  const { state } = useDraft();

  return (
    <main className="app">
      {state.phase === 'team-select' && <TeamSelection />}
      {state.phase === 'drafting' && <DraftBoard />}
      {state.phase === 'complete' && <DraftSummary />}
    </main>
  );
}

