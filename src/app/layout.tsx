import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Bananay Courier — Платформа для курьеров",
  description: "Доставка для курьеров. Bananay — соединяем распределительные центры и получателей.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} ${inter.className} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
