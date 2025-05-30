describe('Course Detail Page Integration', () => {
  const baseUrl = 'http://localhost:3001';

  test('GET /api/courses/[id] should return course details', async () => {
    const response = await fetch(`${baseUrl}/api/courses/course1`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.id).toBe('course1');
    expect(data.data.title).toBeDefined();
    expect(data.data.description).toBeDefined();
    expect(data.data.chapters).toBeDefined();
    expect(Array.isArray(data.data.chapters)).toBe(true);

    // Check course structure
    const course = data.data;
    expect(course).toHaveProperty('id');
    expect(course).toHaveProperty('title');
    expect(course).toHaveProperty('description');
    expect(course).toHaveProperty('price');
    expect(course).toHaveProperty('category');
    expect(course).toHaveProperty('creator');
    expect(course).toHaveProperty('enrollmentCount');
    expect(course).toHaveProperty('chapters');
  });

  test('Course detail page should render correctly', async () => {
    const response = await fetch(`${baseUrl}/courses/course1`);
    expect(response.status).toBe(200);

    const html = await response.text();
    
    // Check basic page structure
    expect(html).toContain('コース一覧に戻る');
    expect(html).toContain('コンテンツ');
    expect(html).toContain('このコースに含まれるもの');
    expect(html).toContain('コースに登録する');
    expect(html).toContain('買い切り型コース');
  });

  test('API should handle non-existent course', async () => {
    const response = await fetch(`${baseUrl}/api/courses/nonexistent`);
    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Course not found');
  });

  test('Course chapters should have correct structure', async () => {
    const response = await fetch(`${baseUrl}/api/courses/course1`);
    const data = await response.json();
    
    expect(data.success).toBe(true);
    const chapters = data.data.chapters;
    
    if (chapters.length > 0) {
      const firstChapter = chapters[0];
      expect(firstChapter).toHaveProperty('id');
      expect(firstChapter).toHaveProperty('title');
      expect(firstChapter).toHaveProperty('description');
      expect(firstChapter).toHaveProperty('position');
      expect(firstChapter).toHaveProperty('isPublished');
      expect(firstChapter).toHaveProperty('isFree');
    }
  });

  test('Enrollment API should work', async () => {
    const response = await fetch(`${baseUrl}/api/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: 'course1',
        userId: 'test-user-123',
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});