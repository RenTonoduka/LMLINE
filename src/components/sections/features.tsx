import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Brain, BookOpen, Users, BarChart3, Shield } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'LINE連携',
    description: 'LINEから直接学習コンテンツにアクセス。普段使っているアプリで学習を続けられます。',
  },
  {
    icon: Brain,
    title: 'AI学習サポート',
    description: '24時間いつでもAIが学習をサポート。わからないことはすぐに質問できます。',
  },
  {
    icon: BookOpen,
    title: '豊富なコンテンツ',
    description: 'プログラミング、デザイン、ビジネススキルなど、幅広い分野の学習コンテンツを提供。',
  },
  {
    icon: Users,
    title: 'コミュニティ機能',
    description: '他の学習者や講師とのやり取りで、モチベーションを維持しながら学習できます。',
  },
  {
    icon: BarChart3,
    title: '学習進捗管理',
    description: '詳細な進捗管理で学習状況を可視化。効率的な学習計画を立てられます。',
  },
  {
    icon: Shield,
    title: 'セキュアな環境',
    description: 'エンタープライズグレードのセキュリティで、安心して学習に集中できます。',
  },
];

export function Features() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-24">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">
          学習を変革する
          <span className="text-primary">6つの特徴</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          LMS×LINE AI Supportが提供する革新的な学習体験で、あなたの成長を加速させます。
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}