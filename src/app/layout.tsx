import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "247GBS Audit | Transform Waste into Growth",
  description: "The official audit tool for 247GBS. Turn unused products, time, and services into customer growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${outfit.variable} font-sans antialiased min-h-screen bg-background text-foreground overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
