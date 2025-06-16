import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatGPT Clone",
  description: "A ChatGPT clone with memory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#2f2f2f",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
