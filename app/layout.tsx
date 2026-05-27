import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter_Tight } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";

// Display font — used for the wordmark, headings, large numbers
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Body font — used for everything else
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NaviLag — Find your way around UNILAG",
  description:
    "Interactive campus navigation for the University of Lagos. Search any building, get walking directions, and never get lost again.",
  applicationName: "NaviLag",
  keywords: [
    "UNILAG",
    "University of Lagos",
    "campus map",
    "navigation",
    "freshers",
    "NaviLag",
  ],
  authors: [{ name: "NaviLag" }],
  openGraph: {
    title: "NaviLag — UNILAG Campus Navigation",
    description:
      "Find any lecture hall, hostel, or faculty on campus. Real walking directions, built for students.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${interTight.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg-base text-text-primary">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
