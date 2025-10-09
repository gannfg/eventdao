import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";

// Optimize font loading with display swap
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only preload the primary font
});

// Dynamic import for wallet provider to reduce initial bundle size
const WalletContextProvider = dynamic(
  () => import("../components/WalletProvider"),
  { 
    ssr: false,
    loading: () => <div style={{ minHeight: "100vh" }} /> 
  }
);

export const metadata: Metadata = {
  title: "EventDAO - Proof of Event on Solana",
  description: "EventDAO lets you prove that real-world events truly happened — verified on Solana, rewarded with NFTs.",
  keywords: ["EventDAO", "Solana", "NFT", "Web3", "Blockchain", "Events", "Proof of Event"],
  authors: [{ name: "EventDAO Team" }],
  icons: {
    icon: "/eventdao_favicon.png",
    apple: "/eventdao_favicon.png",
  },
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "EventDAO - Proof of Event on Solana",
    description: "EventDAO lets you prove that real-world events truly happened — verified on Solana, rewarded with NFTs.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventDAO - Proof of Event on Solana",
    description: "EventDAO lets you prove that real-world events truly happened — verified on Solana, rewarded with NFTs.",
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
        <link rel="icon" href="/eventdao_favicon.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
