import { query } from '@/lib/db';

// Mock the database query function
jest.mock('@/lib/db');

const mockQuery = query as jest.MockedFunction<typeof query>;

describe('Courses Page Functionality', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('API should return courses data', async () => {
    // Mock database response
    const mockCourses = [
      {
        id: 'course1',
        title: 'Introduction to Web Development',
        description: 'Learn the basics of HTML, CSS, and JavaScript',
        image: 'https://example.com/image1.jpg',
        price: '99.99',
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryId: 'cat1',
        creatorId: 'instructor1',
        category_name: 'Programming',
        creator_name: 'John Instructor',
        creator_image: 'https://example.com/avatar1.jpg',
        enrollment_count: '15',
        total_chapters: '4',
        published_chapters: '4',
      },
    ];

    const mockCountResult = [{ total: '1' }];

    mockQuery
      .mockResolvedValueOnce({ rows: mockCourses })
      .mockResolvedValueOnce({ rows: mockCountResult });

    // Simulate API call
    const response = await fetch('http://localhost:3001/api/courses?page=1&limit=9');
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.pagination).toBeDefined();
  });

  test('Page should render with correct structure', async () => {
    const response = await fetch('http://localhost:3001/courses');
    const html = await response.text();

    // Check basic page structure
    expect(html).toContain('コース一覧');
    expect(html).toContain('豊富なコースから、あなたに最適な学習を見つけてください');
    expect(html).toContain('コースを検索...');
    expect(html).toContain('すべて');
    expect(html).toContain('Programming');
    expect(html).toContain('Design');
    expect(html).toContain('Business');
    expect(html).toContain('Language');

    expect(response.status).toBe(200);
  });

  test('API should support search functionality', async () => {
    const response = await fetch('http://localhost:3001/api/courses?search=Web&page=1&limit=9');
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(response.status).toBe(200);
  });

  test('API should support category filtering', async () => {
    const response = await fetch('http://localhost:3001/api/courses?categoryId=cat1&page=1&limit=9');
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(response.status).toBe(200);
  });

  test('API should support pagination', async () => {
    const response = await fetch('http://localhost:3001/api/courses?page=2&limit=3');
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(3);
    expect(response.status).toBe(200);
  });
});