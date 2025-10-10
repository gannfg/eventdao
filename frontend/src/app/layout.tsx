import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientWalletProvider from "../components/ClientWalletProvider";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
        <ClientWalletProvider>
          {children}
        </ClientWalletProvider>
      </body>
    </html>
  );
}
