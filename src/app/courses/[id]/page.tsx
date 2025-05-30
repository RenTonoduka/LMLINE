'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Clock, Star, Play, Check, Lock } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  description: string;
  videoUrl: string | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  isCompleted?: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  category: {
    id: string;
    name: string;
  } | null;
  creator: {
    id: string;
    name: string;
    image: string;
  };
  enrollmentCount: number;
  totalChapters: number;
  publishedChapters: number;
  chapters: Chapter[];
  isEnrolled?: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Course;
}

export default function CourseDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${id}`);
      const data: ApiResponse = await response.json();

      if (data.success) {
        setCourse(data.data);
      } else {
        console.error('Failed to fetch course:', data);
        router.push('/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      router.push('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: id,
          userId: 'test-user',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCourse(prev => prev ? { ...prev, isEnrolled: true } : null);
      } else {
        console.error('Failed to enroll:', data);
      }
    } catch (error) {
      console.error('Error enrolling:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-32 mb-6"></div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-64 bg-muted rounded-lg mb-6"></div>
              <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-20 bg-muted rounded mb-6"></div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">コースが見つかりません</h1>
          <Link href="/courses">
            <Button>コース一覧に戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/courses" className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        コース一覧に戻る
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Hero */}
          <div className="relative mb-6">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            {course.category && (
              <Badge className="absolute top-4 left-4">
                {course.category.name}
              </Badge>
            )}
          </div>

          {/* Course Info */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.enrollmentCount}人が受講中</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.publishedChapters}章</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>4.5</span>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={course.creator.image} />
                <AvatarFallback>{course.creator.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{course.creator.name}</p>
                <p className="text-sm text-muted-foreground">講師</p>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle>コンテンツ</CardTitle>
              <CardDescription>
                {course.publishedChapters}章のレッスンで構成されています
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {course.chapters.map((chapter, index) => (
                  <div
                    key={chapter.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      chapter.isPublished
                        ? 'hover:bg-muted/50 cursor-pointer'
                        : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{chapter.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {chapter.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {chapter.isFree && (
                        <Badge variant="secondary">無料</Badge>
                      )}
                      {chapter.isCompleted ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : chapter.isPublished ? (
                        course.isEnrolled || chapter.isFree ? (
                          <Play className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardContent className="p-6">
              {/* Price */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold mb-2">
                  {formatPrice(course.price)}
                </div>
                <p className="text-sm text-muted-foreground">
                  買い切り型コース
                </p>
              </div>

              {/* Enroll Button */}
              {course.isEnrolled ? (
                <div className="space-y-3">
                  <Button className="w-full" disabled>
                    <Check className="h-4 w-4 mr-2" />
                    受講済み
                  </Button>
                  <Link href={`/courses/${course.id}/chapters/${course.chapters[0]?.id}`}>
                    <Button variant="outline" className="w-full">
                      学習を続ける
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  className="w-full mb-4"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? '処理中...' : 'コースに登録する'}
                </Button>
              )}

              {/* Course Details */}
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <h4 className="font-medium mb-2">このコースに含まれるもの:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {course.publishedChapters}章のビデオレッスン
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      無制限アクセス
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      コミュニティサポート
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}