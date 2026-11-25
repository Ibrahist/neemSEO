import type { Metadata } from "next";
import { Providers } from "@/components/layout/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "neemSEO | Pay-as-you-go open-source SEO platform",
  description:
    "A simple, focused, self-hostable alternative to Semrush and Ahrefs. Bring your own DataForSEO key and pay only for what you use.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
