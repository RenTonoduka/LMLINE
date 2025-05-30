'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Lock, Play } from 'lucide-react';

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
  chapters: Chapter[];
}

interface ChapterDetail {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl: string | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  isCompleted?: boolean;
  course: Course;
  nextChapter?: Chapter;
  prevChapter?: Chapter;
}

interface ApiResponse {
  success: boolean;
  data: ChapterDetail;
}

export default function ChapterPage() {
  const params = useParams();
  const id = params?.id as string;
  const chapterId = params?.chapterId as string;
  const router = useRouter();
  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const fetchChapter = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chapters/${chapterId}?courseId=${id}`);
      const data: ApiResponse = await response.json();

      if (data.success) {
        setChapter(data.data);
        setIsCompleted(data.data.isCompleted || false);
      } else {
        console.error('Failed to fetch chapter:', data);
        router.push(`/courses/${id}`);
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);
      router.push(`/courses/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async () => {
    if (!chapter || isCompleted) return;

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId: chapter.id,
          courseId: id,
          userId: 'test-user',
          isCompleted: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsCompleted(true);
        setChapter(prev => prev ? { ...prev, isCompleted: true } : null);
      }
    } catch (error) {
      console.error('Error marking chapter as completed:', error);
    }
  };

  const navigateToChapter = (targetChapterId: string) => {
    router.push(`/courses/${id}/chapters/${targetChapterId}`);
  };

  useEffect(() => {
    if (id && chapterId) {
      fetchChapter();
    }
  }, [id, chapterId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="h-96 bg-muted rounded-lg mb-6"></div>
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">チャプターが見つかりません</h1>
          <Link href={`/courses/${id}`}>
            <Button>コースに戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Link href="/courses" className="hover:text-foreground">
          コース一覧
        </Link>
        <span>/</span>
        <Link href={`/courses/${id}`} className="hover:text-foreground">
          {chapter.course.title}
        </Link>
        <span>/</span>
        <span className="text-foreground">{chapter.title}</span>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Chapter Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">
                チャプター {chapter.position}
              </span>
              {chapter.isFree && (
                <Badge variant="secondary">無料</Badge>
              )}
              {isCompleted && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  完了
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{chapter.title}</h1>
            <p className="text-lg text-muted-foreground">{chapter.description}</p>
          </div>

          {/* Video Section */}
          {chapter.videoUrl && (
            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {videoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                  <video
                    className="w-full h-full"
                    controls
                    onLoadStart={() => setVideoLoading(true)}
                    onLoadedData={() => setVideoLoading(false)}
                    poster="/placeholder-video.jpg"
                  >
                    <source src={chapter.videoUrl} type="video/mp4" />
                    お使いのブラウザは動画再生に対応していません。
                  </video>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chapter Content */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>レッスン内容</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{chapter.content || 'このチャプターの詳細な説明やリソースがここに表示されます。'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Progress Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isCompleted && (
                <Button onClick={markAsCompleted}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  完了としてマーク
                </Button>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              {chapter.prevChapter && (
                <Button
                  variant="outline"
                  onClick={() => navigateToChapter(chapter.prevChapter!.id)}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  前のチャプター
                </Button>
              )}
              {chapter.nextChapter && (
                <Button
                  onClick={() => navigateToChapter(chapter.nextChapter!.id)}
                >
                  次のチャプター
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link href={`/courses/${id}`} className="hover:text-muted-foreground">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                コース内容
              </CardTitle>
              <CardDescription>{chapter.course.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chapter.course.chapters.map((ch, index) => (
                  <div
                    key={ch.id}
                    className={`flex items-center justify-between p-2 rounded-md border cursor-pointer transition-colors ${
                      ch.id === chapter.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => navigateToChapter(ch.id)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ch.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {ch.isFree && (
                        <Badge variant="outline" className="text-xs">
                          無料
                        </Badge>
                      )}
                      {ch.isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : ch.isPublished ? (
                        <Play className="h-4 w-4" />
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
      </div>
    </div>
  );
}