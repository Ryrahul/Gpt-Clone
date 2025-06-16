import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "@/contexts/chat-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatGPT Clone",
  description: "A ChatGPT clone built with Next.js and AI SDK",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}
