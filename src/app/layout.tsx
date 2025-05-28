import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'LMLINE - LMS × LINE AI個別サポートシステム',
  description: 'オンライン学習プラットフォームとLINE公式アカウントを連携し、AIによる個別学習サポートを提供するシステム',
  keywords: ['LMS', 'LINE', 'AI', '学習', 'オンライン教育', 'サポート'],
  authors: [{ name: 'LMLINE Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}