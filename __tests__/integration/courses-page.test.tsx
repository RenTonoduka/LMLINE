import { render, screen, waitFor } from '@testing-library/react';
import CoursesPage from '@/app/courses/page';

const mockCourses = {
  success: true,
  data: [
    {
      id: 'course1',
      title: 'Introduction to Web Development',
      description: 'Learn the basics of HTML, CSS, and JavaScript',
      image: 'https://example.com/image1.jpg',
      price: 99.99,
      category: {
        id: 'cat1',
        name: 'Programming',
      },
      creator: {
        id: 'instructor1',
        name: 'John Instructor',
        image: 'https://example.com/avatar1.jpg',
      },
      enrollmentCount: 15,
      totalChapters: 4,
      publishedChapters: 4,
    },
  ],
  pagination: {
    page: 1,
    limit: 9,
    total: 1,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => mockCourses,
  });
});

describe('Courses Page', () => {
  test('renders courses page with title', async () => {
    render(<CoursesPage />);
    
    expect(screen.getByText('コース一覧')).toBeInTheDocument();
    expect(screen.getByText('豊富なコースから、あなたに最適な学習を見つけてください')).toBeInTheDocument();
  });

  test('displays search input and category filters', () => {
    render(<CoursesPage />);
    
    expect(screen.getByPlaceholderText('コースを検索...')).toBeInTheDocument();
    expect(screen.getByText('すべて')).toBeInTheDocument();
    expect(screen.getByText('Programming')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
  });

  test('loads and displays courses from API', async () => {
    render(<CoursesPage />);
    
    // Wait for API call to complete
    await waitFor(() => {
      expect(screen.getByText('Introduction to Web Development')).toBeInTheDocument();
    });

    expect(screen.getByText('Learn the basics of HTML, CSS, and JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Programming')).toBeInTheDocument();
    expect(screen.getByText('講師: John Instructor')).toBeInTheDocument();
    expect(screen.getByText('¥100')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    render(<CoursesPage />);
    
    // Should show loading skeleton cards (using animate-pulse class as indicator)
    const skeletonCards = document.querySelectorAll('.animate-pulse');
    expect(skeletonCards.length).toBeGreaterThan(0);
  });
});