import type { Metadata } from 'next';
import { Inter, Mukta, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const mukta = Mukta({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['devanagari', 'latin'],
  variable: '--font-mukta',
  display: 'swap',
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari', 'latin'],
  variable: '--font-noto-devanagari',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Alphanex AI (अल्फानेक्स AI) — The ElevenLabs for Nepal',
  description: 'Ultra-modern Indic & Nepali speech synthesis studio, voice cloning lab, and developer API platform.',
  openGraph: {
    title: 'Alphanex AI (अल्फानेक्स AI) — The ElevenLabs for Nepal',
    description: 'Ultra-modern Indic & Nepali speech synthesis studio, voice cloning lab, and developer API platform.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alphanex AI (अल्फानेक्स AI) — The ElevenLabs for Nepal',
    description: 'Ultra-modern Indic & Nepali speech synthesis studio, voice cloning lab, and developer API platform.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ne" className={`${inter.variable} ${mukta.variable} ${notoSansDevanagari.variable}`}>
      <body className="bg-[#0a0d14] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
