'use client';

import { useDraft } from '@/context/DraftContext';
import TeamSelection from '@/components/TeamSelection';

export default function Home() {
  const { state } = useDraft();

  return (
    <main className="app">
      {state.phase === 'team-select' && <TeamSelection />}
    </main>
  );
}
