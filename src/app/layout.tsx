import type { Metadata } from "next";
import "./globals.css"

export const metadata: Metadata = {
  title: "Real-Time Chat App",
  description: "Real-time one-to-one chat application",
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