import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Snowfall from "@/components/Snowfall";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Coupe Québec AOE2 - New Year Tournament 2025",
  description: "Medieval Age of Empires 2 Tournament - 20 Warriors Compete for Glory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Snowfall />
        <Navigation />
        {children}
      </body>
    </html>
  );
}
