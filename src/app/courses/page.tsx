'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Search, Users, Clock, Star } from 'lucide-react';

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
}

interface ApiResponse {
  success: boolean;
  data: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<ApiResponse['pagination'] | null>(null);

  const categories = [
    { id: 'cat1', name: 'Programming' },
    { id: 'cat2', name: 'Design' },
    { id: 'cat3', name: 'Business' },
    { id: 'cat4', name: 'Language' },
  ];

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '9',
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (selectedCategory) {
        params.append('categoryId', selectedCategory);
      }

      const response = await fetch(`/api/courses?${params}`);
      const data: ApiResponse = await response.json();

      if (data.success) {
        setCourses(data.data);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch courses:', data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchQuery, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCourses();
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
    setCurrentPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">コース一覧</h1>
        <p className="text-muted-foreground">
          豊富なコースから、あなたに最適な学習を見つけてください
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="コースを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">検索</Button>
        </form>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryFilter('')}
          >
            すべて
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="w-full h-48 bg-muted rounded-md mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow" data-testid="course-card">
                <CardHeader className="p-0">
                  <div className="relative">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {course.category && (
                      <Badge className="absolute top-2 left-2">
                        {course.category.name}
                      </Badge>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 text-sm font-semibold">
                      {formatPrice(course.price)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="mb-2 line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="mb-4 line-clamp-3">
                    {course.description}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.enrollmentCount}</span>
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

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      講師: {course.creator.name}
                    </p>
                  </div>

                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full">コースを見る</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                disabled={!pagination.hasPrev}
                onClick={() => setCurrentPage(pagination.page - 1)}
              >
                前へ
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                disabled={!pagination.hasNext}
                onClick={() => setCurrentPage(pagination.page + 1)}
              >
                次へ
              </Button>
            </div>
          )}

          {/* No Results */}
          {courses.length === 0 && !loading && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">コースが見つかりません</h3>
              <p className="text-muted-foreground mb-4">
                検索条件を変更してもう一度お試しください
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setCurrentPage(1);
              }}>
                フィルターをリセット
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}