import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "canvas-node-03m0",
  description: "make me a todo-app using nextjs",
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
