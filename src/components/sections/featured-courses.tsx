import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Web開発入門',
    description: 'HTML、CSS、JavaScriptの基礎から学べる初心者向けコース',
    image: '/images/course-web.jpg',
    price: '¥9,800',
    rating: 4.8,
    students: 1250,
    duration: '8時間',
    level: '初級',
    category: 'プログラミング',
  },
  {
    id: 2,
    title: 'React完全マスター',
    description: 'モダンなReactアプリケーション開発のすべてを学習',
    image: '/images/course-react.jpg',
    price: '¥14,800',
    rating: 4.9,
    students: 890,
    duration: '12時間',
    level: '中級',
    category: 'プログラミング',
  },
  {
    id: 3,
    title: 'UI/UXデザイン基礎',
    description: 'ユーザビリティを重視したデザインの基本原則を習得',
    image: '/images/course-design.jpg',
    price: '¥11,800',
    rating: 4.7,
    students: 760,
    duration: '10時間',
    level: '初級',
    category: 'デザイン',
  },
];

export function FeaturedCourses() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-24">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">
          人気の
          <span className="text-primary">コース</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          実践的なスキルが身につく、厳選されたコースをご紹介します。
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-muted relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-violet-500 opacity-20" />
              <div className="absolute top-4 left-4">
                <Badge variant="secondary">{course.category}</Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant="outline">{course.level}</Badge>
              </div>
            </div>
            
            <CardHeader>
              <CardTitle className="line-clamp-1">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{course.students}人</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-primary">
                  {course.price}
                </div>
                <Button asChild>
                  <Link href={`/courses/${course.id}`}>
                    詳細を見る
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center">
        <Button variant="outline" size="lg" asChild>
          <Link href="/courses">
            すべてのコースを見る
          </Link>
        </Button>
      </div>
    </section>
  );
}