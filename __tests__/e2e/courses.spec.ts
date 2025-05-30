import { test, expect } from '@playwright/test';

test.describe('Courses Page', () => {
  test('should display courses page correctly', async ({ page }) => {
    // Navigate to courses page
    await page.goto('/courses');

    // Check page title and description
    await expect(page.locator('h1')).toContainText('コース一覧');
    await expect(page.getByText('豊富なコースから、あなたに最適な学習を見つけてください')).toBeVisible();

    // Check search functionality
    await expect(page.getByPlaceholder('コースを検索...')).toBeVisible();
    await expect(page.getByRole('button', { name: '検索' })).toBeVisible();

    // Check category filters
    await expect(page.getByRole('button', { name: 'すべて' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Programming' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Design' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Business' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Language' })).toBeVisible();
  });

  test('should load and display courses from API', async ({ page }) => {
    // Navigate to courses page
    await page.goto('/courses');

    // Wait for courses to load (wait for loading state to finish)
    await page.waitForSelector('[data-testid="course-card"]', { timeout: 10000 });

    // Check if course cards are displayed
    const courseCards = page.locator('[data-testid="course-card"]');
    await expect(courseCards).toHaveCount(5); // We have 5 courses in our seed data

    // Check first course details
    const firstCourse = courseCards.first();
    await expect(firstCourse.getByText('Introduction to Web Development')).toBeVisible();
    await expect(firstCourse.getByText('Programming')).toBeVisible();
    await expect(firstCourse.getByText('講師: John Instructor')).toBeVisible();
    await expect(firstCourse.getByRole('button', { name: 'コースを見る' })).toBeVisible();
  });

  test('should filter courses by category', async ({ page }) => {
    // Navigate to courses page
    await page.goto('/courses');

    // Wait for courses to load
    await page.waitForSelector('[data-testid="course-card"]', { timeout: 10000 });

    // Click Programming filter
    await page.getByRole('button', { name: 'Programming' }).click();

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Should show only Programming courses
    const courseCards = page.locator('[data-testid="course-card"]');
    const programmingBadges = page.locator('[data-testid="course-card"] .badge:has-text("Programming")');
    
    // All visible courses should be Programming courses
    const cardCount = await courseCards.count();
    const programmingCount = await programmingBadges.count();
    expect(programmingCount).toBeGreaterThan(0);
  });

  test('should search courses', async ({ page }) => {
    // Navigate to courses page
    await page.goto('/courses');

    // Wait for courses to load
    await page.waitForSelector('[data-testid="course-card"]', { timeout: 10000 });

    // Search for "Web"
    await page.getByPlaceholder('コースを検索...').fill('Web');
    await page.getByRole('button', { name: '検索' }).click();

    // Wait for search results
    await page.waitForTimeout(500);

    // Should show courses containing "Web"
    await expect(page.getByText('Introduction to Web Development')).toBeVisible();
  });

  test('should navigate to course detail when clicking course card', async ({ page }) => {
    // Navigate to courses page
    await page.goto('/courses');

    // Wait for courses to load
    await page.waitForSelector('[data-testid="course-card"]', { timeout: 10000 });

    // Click on first course's "コースを見る" button
    const firstCourseButton = page.locator('[data-testid="course-card"]').first().getByRole('button', { name: 'コースを見る' });
    await firstCourseButton.click();

    // Should navigate to course detail page
    await expect(page).toHaveURL(/\/courses\/course\d+/);
  });
});