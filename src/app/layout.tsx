import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ThemeProvider } from '@/src/components/common/theme-provider';
import Header from '@/src/components/layouts/header';
import Footer from '@/src/components/layouts/footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '韓国語学習 | フラッシュカード',
  description: '韓国語単語を楽しく学べる無料のフラッシュカードアプリです。TOPIK対策にも最適！',
  keywords: ['韓国語', 'フラッシュカード', '単語帳', 'TOPIK', '韓国語学習', '韓国語アプリ'],
  authors: [{ name: 'Your Name', url: 'https://your-site.com' }],
  openGraph: {
    title: '韓国語学習 | フラッシュカード',
    description: 'TOPIK初級〜上級まで対応!韓国語単語を楽しく学ぼう',
    url: 'https://your-site.com',
    siteName: '韓国語フラッシュカードアプリ',
    images: [
      {
        url: 'https://your-site.com/og-image.png',
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
    images: ['https://your-site.com/og-image.png'],
  },
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
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
              <div className="flex justify-end items-center p-4 gap-4">
                <SignedOut>
                  <SignInButton />
                  <SignUpButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
              {children}
              <Footer />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
