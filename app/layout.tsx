import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import Footer from '@/components/footer';


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '韓国語学習 | フラッシュカード',
  description: '韓国語単語を楽しく学べる無料のフラッシュカードアプリです。TOPIK対策にも最適！',
  keywords: ['韓国語', 'フラッシュカード', '単語帳', 'TOPIK', '韓国語学習', '韓国語アプリ'],
  authors: [{ name: 'Your Name', url: 'https://your-site.com' }],
  openGraph: {
    title: '韓国語学習 | フラッシュカード',
    description: 'TOPIK初級〜上級まで対応！韓国語単語を楽しく学ぼう📚',
    url: 'https://your-site.com', // ←デプロイ後に変更
    siteName: '韓国語フラッシュカードアプリ',
    images: [
      {
        url: 'https://your-site.com/og-image.png', // SNSで表示される画像（用意できたら）
        width: 1200,
        height: 630,
        alt: '韓国語学習アプリのイメージ画像',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '韓国語学習 | フラッシュカード',
    description: 'TOPIK初級〜上級までの単語が学べる！',
    images: ['https://your-site.com/og-image.png'], // Twitter用の画像
  },
  themeColor: '#ffffff',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

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
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}