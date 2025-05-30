import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';
import { SimpleAuthProvider } from '@/contexts/simple-auth-context';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LMS×LINE AI Support',
  description: 'LINEと連携したAI搭載の学習管理システム',
  keywords: ['LMS', 'LINE', 'AI', '学習管理システム', 'オンライン学習'],
};

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
          <AuthProvider>
            <SimpleAuthProvider>
              {children}
              <Toaster position="top-right" />
            </SimpleAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}