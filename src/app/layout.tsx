import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a9a7a",
};

export const metadata: Metadata = {
  title: "EarthNode Command | Community Relief Portal",
  description: "Smart Report Verification & Real-Time Volunteer Routing.",
  metadataBase: new URL("https://community-relief-portal.vercel.app"),
  openGraph: {
    title: "EarthNode Command | Community Relief Portal",
    description: "Smart Report Verification & Real-Time Volunteer Routing.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect to critical third-party origins to eliminate DNS/TLS latency */}
        <link rel="preconnect" href="https://cartodb-basemaps-a.global.ssl.fastly.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cartodb-basemaps-b.global.ssl.fastly.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
