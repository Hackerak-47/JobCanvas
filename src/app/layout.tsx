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
  title: 'DevBoard - AI-Powered Job Application Tracker',
  description:
    'Track, organize, and accelerate your job search with DevBoard — the AI-powered Kanban board built for developers. Manage applications, prep for interviews, and land your dream role.',
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
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} dark`}>
        {children}
      </body>
    </html>
  );
}
