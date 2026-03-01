import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DNS over Next.js",
  description: "This is a Next.js implementation of DNS-over-HTTPS",
  authors: {
    name: "Ali Almasi",
    url: "https://alialmasi.ir",
  },
  creator: "Ali Almasi",
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
