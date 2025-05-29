const stats = [
  {
    value: '10,000+',
    label: '学習者数',
    description: 'アクティブな学習者',
  },
  {
    value: '500+',
    label: 'コース数',
    description: '豊富な学習コンテンツ',
  },
  {
    value: '95%',
    label: '満足度',
    description: 'ユーザー満足度',
  },
  {
    value: '24/7',
    label: 'AIサポート',
    description: '年中無休のサポート',
  },
];

export function Stats() {
  return (
    <section className="bg-muted/50 py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            数字で見る
            <span className="text-primary">成果</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            多くの方に選ばれ、高い評価をいただいている学習プラットフォームです。
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}