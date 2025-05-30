-- Insert sample data for LMS×LINE AI Support System

-- Insert categories
INSERT INTO "categories" ("id", "name", "createdAt", "updatedAt") VALUES
('cat1', 'Programming', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat2', 'Design', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat3', 'Business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat4', 'Language', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Insert users
INSERT INTO "users" ("id", "email", "name", "role", "emailVerified", "createdAt", "updatedAt") VALUES
('admin1', 'admin@lms-line.com', 'System Administrator', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('instructor1', 'instructor@lms-line.com', 'John Instructor', 'INSTRUCTOR', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('student1', 'student@lms-line.com', 'Jane Student', 'STUDENT', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;

-- Insert courses
INSERT INTO "courses" ("id", "title", "description", "price", "isPublished", "categoryId", "creatorId", "image", "createdAt", "updatedAt") VALUES
('course1', 'Introduction to Web Development', 'Learn the basics of HTML, CSS, and JavaScript to build modern websites', 99.99, true, 'cat1', 'instructor1', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('course2', 'React for Beginners', 'Master modern React development with hooks, components, and state management', 149.99, true, 'cat1', 'instructor1', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('course3', 'UI/UX Design Fundamentals', 'Learn the principles of user interface and user experience design', 79.99, true, 'cat2', 'instructor1', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('course4', 'Business Strategy 101', 'Essential business strategy concepts for entrepreneurs and managers', 199.99, true, 'cat3', 'instructor1', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('course5', '英語会話マスター', '日常英会話からビジネス英語まで、実践的な英語コミュニケーションスキル', 89.99, true, 'cat4', 'instructor1', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Insert chapters for Web Development course
INSERT INTO "chapters" ("id", "title", "description", "position", "isPublished", "isFree", "courseId", "videoUrl", "createdAt", "updatedAt") VALUES
('chapter1', 'Getting Started with HTML', 'Learn the fundamentals of HTML structure and elements', 1, true, true, 'course1', 'https://example.com/videos/html-basics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chapter2', 'Styling with CSS', 'Introduction to CSS styling and responsive design', 2, true, false, 'course1', 'https://example.com/videos/css-basics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chapter3', 'JavaScript Basics', 'Learn JavaScript fundamentals and DOM manipulation', 3, true, false, 'course1', 'https://example.com/videos/js-basics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chapter4', 'Building Your First Website', 'Put it all together to create a complete website', 4, true, false, 'course1', 'https://example.com/videos/first-website', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Insert chapters for React course
INSERT INTO "chapters" ("id", "title", "description", "position", "isPublished", "isFree", "courseId", "videoUrl", "createdAt", "updatedAt") VALUES
('chapter5', 'Introduction to React', 'Understanding React and setting up your development environment', 1, true, true, 'course2', 'https://example.com/videos/react-intro', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chapter6', 'Components and JSX', 'Creating reusable components with JSX syntax', 2, true, false, 'course2', 'https://example.com/videos/react-components', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chapter7', 'State and Props', 'Managing component state and passing data with props', 3, true, false, 'course2', 'https://example.com/videos/react-state', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Insert chapters for other courses
INSERT INTO "chapters" ("id", "title", "description", "position", "isPublished", "isFree", "courseId", "videoUrl", "createdAt", "updatedAt") VALUES
('chapter8', 'Design Thinking Process', 'Understanding the design thinking methodology', 1, true, true, 'course3', 'https://example.com/videos/design-thinking', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chapter9', 'User Research and Personas', 'Conducting user research and creating user personas', 2, true, false, 'course3', 'https://example.com/videos/user-research', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chapter10', 'Introduction to Business Strategy', 'What is business strategy and why it matters', 1, true, true, 'course4', 'https://example.com/videos/business-intro', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chapter11', 'Market Analysis', 'Understanding your market and competition', 2, true, false, 'course4', 'https://example.com/videos/market-analysis', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chapter12', '基本的な挨拶と自己紹介', '英語での基本的な挨拶と自己紹介の方法', 1, true, true, 'course5', 'https://example.com/videos/english-greetings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chapter13', '日常会話の表現', '買い物、レストラン、交通機関での英会話', 2, true, false, 'course5', 'https://example.com/videos/daily-english', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Insert enrollments
INSERT INTO "enrollments" ("id", "userId", "courseId", "createdAt", "updatedAt") VALUES
('enroll1', 'student1', 'course1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('enroll2', 'student1', 'course2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("userId", "courseId") DO NOTHING;

-- Insert user progress
INSERT INTO "user_progress" ("id", "userId", "chapterId", "isCompleted", "createdAt", "updatedAt") VALUES
('progress1', 'student1', 'chapter1', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("userId", "chapterId") DO NOTHING;