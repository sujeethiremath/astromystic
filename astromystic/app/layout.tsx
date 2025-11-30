import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';

// --- CONFIGURATION ---
// Updated to your live Vercel URL
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://practicalloveastrology.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:
      'Practical Love Astrology | Transform Your Life With Insightful, Practical Astrology!',
    template: '%s | Practical Love Astrology',
  },
  description:
    'A blend of astrology and tarot to help you understand yourself, the people in your life, and your relationship dynamics so that youclaim your power back!',
  keywords: [
    'Astrology',
    'Natal Chart',
    'Horoscope',
    'Zodiac',
    'Love Astrology',
    'Relationships',
    'Gulnara',
    'Ilyasova',
    'Robertovna',
    'Gulnara Robertovna',
    'Gulnara Ilyasova',
    'Spirituality',
    'Tarot',
    'Synastry Chart',
    'Readings',
  ],
  authors: [{ name: 'Gulnara Ilyasova' }],
  creator: 'Practical Love Astrology',

  // Open Graph (Facebook, LinkedIn, iMessage, WhatsApp)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title:
      'Practical Love Astrology | Transform Your Life With Insightful, Practical Astrology!',
    description:
      'A blend of astrology and tarot to help you understand yourself, the people in your life, and your relationship dynamics so that youclaim your power back!',
    siteName: 'Practical Love Astrology',
    images: [
      {
        url: '/og-card.jpg', // Ensure you have a file named og-card.jpg in your public/ folder
        width: 1200,
        height: 630,
        alt: 'Practical Love Astrology',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title:
      'Practical Love Astrology | Transform Your Life With Insightful, Practical Astrology!',
    description:
      'A blend of astrology and tarot to help you understand yourself, the people in your life, and your relationship dynamics so that youclaim your power back!',
    images: ['/og-card.jpg'],
    creator: '@yourtwitterhandle',
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Standard Google Fonts Loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
