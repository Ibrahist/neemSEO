import type { Metadata } from "next";
import { Providers } from "@/components/layout/providers";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-neutral-50 text-neutral-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
