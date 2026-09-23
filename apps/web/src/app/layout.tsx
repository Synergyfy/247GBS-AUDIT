import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
        className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground overflow-x-hidden`}
      >
        <Providers>
          <PublicNavbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
