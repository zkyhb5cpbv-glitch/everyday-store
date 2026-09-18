import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FORM — Everyday essentials",
  description: "A considered collection. Your own customizable practice store.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
