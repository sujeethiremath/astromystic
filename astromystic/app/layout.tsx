import type { Metadata } from "next";
import "./globals.css"; 
import { ThemeProvider } from "../context/ThemeContext"; 

// --- CONFIGURATION ---
// Updated to your live Vercel URL
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://practicalloveastrology.com"; 

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Practical Spirituality | Explore Your Cosmic Potential",
    template: "%s | Practical Spirituality"
  },
  description: "Evolutionary astrology readings. Discover your natal chart, solar return, and synastry insights with a professional guide.",
  keywords: ["Astrology", "Natal Chart", "Horoscope", "Zodiac", "Spirituality", "Readings"],
  authors: [{ name: "Gulnara Ilyasova" }],
  creator: "Practical Spirituality",
  
  // Open Graph (Facebook, LinkedIn, iMessage, WhatsApp)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Practical Spirituality | Unlock Your Star Chart",
    description: "Evolutionary astrology readings to guide your life's journey.",
    siteName: "Practical Spirituality",
    images: [
      {
        url: "/og-card.jpg", // Ensure you have a file named og-card.jpg in your public/ folder
        width: 1200,
        height: 630,
        alt: "Practical Spirituality - Cosmic Readings",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Practical Spirituality | Explore Your Cosmic Potential",
    description: "Evolutionary astrology readings to guide your life's journey.",
    images: ["/og-card.jpg"],
    creator: "@yourtwitterhandle", 
  },

  // Icons
  icons: {
    icon: "/favicon.ico", 
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}