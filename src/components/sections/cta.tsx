import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare } from 'lucide-react';

export function CTA() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-violet-600 py-12 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            今すぐ始めて、
            <br />
            新しい学習体験を
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            LINEと連携したAI学習サポートで、あなたの学習スタイルに合わせた最適な体験を提供します。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register">
                無料で始める
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/contact">
                <MessageSquare className="mr-2 h-4 w-4" />
                お問い合わせ
              </Link>
            </Button>
          </div>
          
          <div className="text-blue-100 text-sm">
            ✓ 30日間無料トライアル　✓ クレジットカード不要　✓ いつでもキャンセル可能
          </div>
        </div>
      </div>
    </section>
  );
}