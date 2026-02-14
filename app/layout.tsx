import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DraftProvider } from '@/context/DraftContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'NFL Mock Draft Simulator | 2026',
  description:
    'Draft for your favorite team against 6 AI-controlled GMs. Simulate the first 4 rounds of the 2026 NFL Draft with the top 30 prospects.',
  keywords: ['NFL', 'Mock Draft', 'NFL Draft 2026', 'Draft Simulator'],
  openGraph: {
    title: 'NFL Mock Draft Simulator | 2026',
    description:
      'Draft for your favorite team against 6 AI-controlled GMs. Simulate the first 4 rounds of the 2026 NFL Draft.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <DraftProvider>{children}</DraftProvider>
      </body>
    </html>
  );
}
