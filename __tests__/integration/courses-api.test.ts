describe('Courses API Integration', () => {
  const baseUrl = 'http://localhost:3001';

  test('GET /api/courses should return courses data', async () => {
    const response = await fetch(`${baseUrl}/api/courses?page=1&limit=9`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(9);

    // Check first course structure
    const firstCourse = data.data[0];
    expect(firstCourse).toHaveProperty('id');
    expect(firstCourse).toHaveProperty('title');
    expect(firstCourse).toHaveProperty('description');
    expect(firstCourse).toHaveProperty('price');
    expect(firstCourse).toHaveProperty('category');
    expect(firstCourse).toHaveProperty('creator');
    expect(firstCourse).toHaveProperty('enrollmentCount');
    expect(firstCourse).toHaveProperty('publishedChapters');
  });

  test('GET /api/courses should support search functionality', async () => {
    const response = await fetch(`${baseUrl}/api/courses?search=Web&page=1&limit=9`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    
    // At least one course should contain "Web" in title or description
    const hasWebCourse = data.data.some((course: any) => 
      course.title.includes('Web') || course.description.includes('Web')
    );
    expect(hasWebCourse).toBe(true);
  });

  test('GET /api/courses should support category filtering', async () => {
    const response = await fetch(`${baseUrl}/api/courses?categoryId=cat1&page=1&limit=9`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    
    // All courses should be in the Programming category (cat1)
    if (data.data.length > 0) {
      const allProgramming = data.data.every((course: any) => 
        course.category && course.category.id === 'cat1'
      );
      expect(allProgramming).toBe(true);
    }
  });

  test('GET /api/courses should support pagination', async () => {
    const response = await fetch(`${baseUrl}/api/courses?page=2&limit=2`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(2);
    expect(data.pagination.total).toBeGreaterThan(0);
    expect(data.pagination.pages).toBeGreaterThan(0);
  });

  test('Courses page should render correctly', async () => {
    const response = await fetch(`${baseUrl}/courses`);
    expect(response.status).toBe(200);

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
  });
});