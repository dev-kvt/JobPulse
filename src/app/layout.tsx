import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'JobPulse — Global Software Engineering Job Discovery',
  description: 'Discover thousands of software engineering internships, new graduate roles, and remote opportunities across 20+ countries. AI-powered job matching and career analytics.',
  keywords: ['software engineering jobs', 'internship', 'new grad', 'remote jobs', 'backend engineer', 'global hiring'],
  openGraph: {
    title: 'JobPulse — Global Job Discovery Engine',
    description: 'Discover software engineering opportunities worldwide. Real-time crawling from Greenhouse, Lever, Ashby, and more.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className={inter.className}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
