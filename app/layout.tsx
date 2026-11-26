import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/layout/providers";
import "./globals.css";

const ibmPlexSans = localFont({
  src: [
    {
      path: "./fonts/ibm-plex-sans-latin-300-normal.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-sans-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-sans-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-sans-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-sans-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://neemseo.com"),
  title: "neemSEO | Professional SEO intelligence. Completely free, forever.",
  description:
    "A simple, focused, self-hostable SEO platform. Completely free, open-source, and private.",
  icons: {
    icon: "/neemseo-mark.svg",
    shortcut: "/neemseo-mark.svg",
    apple: "/neemseo-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ibmPlexSans.variable} suppressHydrationWarning>
      <body className={`${ibmPlexSans.className} bg-neutral-50 text-neutral-900 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
