import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

/* ── Inter Font — optimized via next/font (no layout shift) ── */
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

/* ── SEO & Open Graph Metadata ────────────────────────────── */
export const metadata: Metadata = {
  title: 'JobCanvas - AI-Powered Job Application Tracker',
  description:
    'Track, organize, and accelerate your job search with JobCanvas — the AI-powered Kanban board built for developers. Manage applications, prep for interviews, and land your dream role.',
  keywords: [
    'job tracker',
    'application tracker',
    'kanban board',
    'developer tools',
    'job search',
    'AI job tracker',
  ],
};

/* ── Root Layout ──────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className={`${inter.className} dark`}>
        <div className="landing-bg-effects">
          <div className="landing-orb landing-orb-1" style={{ width: '60vw', height: '60vw', top: '-10%', left: '-10%' }} />
          <div className="landing-orb landing-orb-2" style={{ width: '50vw', height: '50vw', top: '20%', right: '-10%' }} />
        </div>
        {children}
      </body>
    </html>
  );
}
