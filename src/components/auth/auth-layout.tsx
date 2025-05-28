import Link from 'next/link';
import { BookOpen } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold">LMS×LINE AI Support</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <div className="relative h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-violet-600 opacity-90" />
          <div className="relative h-full flex items-center justify-center p-12">
            <div className="text-white text-center space-y-6">
              <h2 className="text-3xl font-bold">
                LINEと連携した
                <br />
                AI学習サポート
              </h2>
              <p className="text-xl opacity-90">
                いつでもどこでも、あなたのペースで学習できる革新的なプラットフォーム
              </p>
              <div className="grid grid-cols-1 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-left">
                  <h3 className="font-semibold mb-2">🤖 AI学習アシスタント</h3>
                  <p className="text-sm opacity-90">
                    24時間いつでも質問に答える賢いAIがあなたの学習をサポート
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-left">
                  <h3 className="font-semibold mb-2">📱 LINE連携</h3>
                  <p className="text-sm opacity-90">
                    普段使っているLINEから直接学習コンテンツにアクセス可能
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-left">
                  <h3 className="font-semibold mb-2">📊 進捗管理</h3>
                  <p className="text-sm opacity-90">
                    詳細な学習分析で効率的な学習計画を立案
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}