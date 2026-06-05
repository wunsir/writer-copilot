import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Writer Copilot",
  description: "AI Adaptation Studio for source-grounded screenplay YAML."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

