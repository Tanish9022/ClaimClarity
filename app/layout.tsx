import type { Metadata } from "next";
import { Inter, Outfit, Newsreader } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], style: ["italic"], variable: "--font-newsreader", display: "swap" });

export const metadata: Metadata = { title: "ClaimClarity", description: "Clear, safe claim-status guidance from the evidence provided." };

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { 
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  ); 
}
