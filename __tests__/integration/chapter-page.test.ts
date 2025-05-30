describe('Chapter Page Integration', () => {
  const baseUrl = 'http://localhost:3001';

  test('GET /api/chapters/[id] should return chapter details', async () => {
    const response = await fetch(`${baseUrl}/api/chapters/chapter1?courseId=course1`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.id).toBe('chapter1');
    expect(data.data.title).toBeDefined();
    expect(data.data.description).toBeDefined();
    expect(data.data.course).toBeDefined();

    // Check chapter structure
    const chapter = data.data;
    expect(chapter).toHaveProperty('id');
    expect(chapter).toHaveProperty('title');
    expect(chapter).toHaveProperty('description');
    expect(chapter).toHaveProperty('position');
    expect(chapter).toHaveProperty('isPublished');
    expect(chapter).toHaveProperty('isFree');
    expect(chapter).toHaveProperty('course');
    expect(chapter.course).toHaveProperty('chapters');
  });

  test('Chapter page should render correctly', async () => {
    const response = await fetch(`${baseUrl}/courses/course1/chapters/chapter1`);
    expect(response.status).toBe(200);

    const html = await response.text();
    
    // Check basic page structure
    expect(html).toContain('コース一覧');
    expect(html).toContain('チャプター');
    expect(html).toContain('レッスン内容');
    expect(html).toContain('完了としてマーク');
    expect(html).toContain('コース内容');
  });

  test('Progress API should work', async () => {
    const response = await fetch(`${baseUrl}/api/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chapterId: 'chapter1',
        courseId: 'course1',
        userId: 'test-user',
        isCompleted: true,
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('Chapter navigation should work', async () => {
    const response = await fetch(`${baseUrl}/api/chapters/chapter1?courseId=course1`);
    const data = await response.json();
    
    expect(data.success).toBe(true);
    const chapter = data.data;
    
    // Should have navigation info
    expect(chapter.course.chapters).toBeDefined();
    expect(Array.isArray(chapter.course.chapters)).toBe(true);
    expect(chapter.course.chapters.length).toBeGreaterThan(0);
  });

  test('API should handle non-existent chapter', async () => {
    const response = await fetch(`${baseUrl}/api/chapters/nonexistent?courseId=course1`);
    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Chapter not found');
  });
});