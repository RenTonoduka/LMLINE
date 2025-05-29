import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, MessageSquare, BookOpen, Brain } from 'lucide-react';

export function Hero() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="text-primary">LMS×LINE</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                AI Support
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              LINEと連携したAI搭載の学習管理システムで、いつでもどこでも効率的な学習体験を実現します。
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/register">
                無料で始める
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/demo">
                <Play className="mr-2 h-4 w-4" />
                デモを見る
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>LINE連携</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>AI学習サポート</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>豊富なコース</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl p-1">
            <div className="bg-background rounded-xl p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 flex-1">
                    <p className="text-sm">数学の微分について教えて</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 flex-1">
                    <p className="text-sm">微分は関数の変化率を求める計算方法です。基本的な公式から始めましょう...</p>
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">学習進捗</span>
                    <span className="text-sm text-muted-foreground">75%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}