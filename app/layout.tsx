"use client"
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Footer from '@/components/footer';
import FlashcardArea from '@/components/flashcardArea';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [level, setLevel] = useState<"初心者" | "中級" | "上級" | null>(null)

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 flex">
              <Sidebar onSelectLevel={setLevel}/>
              <main className="flex-1 p-6">
                <FlashcardArea level={level} />
              </main>
            </div>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}