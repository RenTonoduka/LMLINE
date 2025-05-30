import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Programming' },
      update: {},
      create: { name: 'Programming' },
    }),
    prisma.category.upsert({
      where: { name: 'Design' },
      update: {},
      create: { name: 'Design' },
    }),
    prisma.category.upsert({
      where: { name: 'Business' },
      update: {},
      create: { name: 'Business' },
    }),
    prisma.category.upsert({
      where: { name: 'Language' },
      update: {},
      create: { name: 'Language' },
    }),
  ]);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lms-line.com' },
    update: {},
    create: {
      email: 'admin@lms-line.com',
      name: 'System Administrator',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  // Create instructor user
  const instructorUser = await prisma.user.upsert({
    where: { email: 'instructor@lms-line.com' },
    update: {},
    create: {
      email: 'instructor@lms-line.com',
      name: 'John Instructor',
      role: UserRole.INSTRUCTOR,
      emailVerified: true,
    },
  });

  // Create student user
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@lms-line.com' },
    update: {},
    create: {
      email: 'student@lms-line.com',
      name: 'Jane Student',
      role: UserRole.STUDENT,
      emailVerified: true,
    },
  });

  // Create sample courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'Introduction to Web Development',
        description: 'Learn the basics of HTML, CSS, and JavaScript to build modern websites',
        price: 99.99,
        isPublished: true,
        categoryId: categories[0].id, // Programming
        creatorId: instructorUser.id,
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500',
        chapters: {
          create: [
            {
              title: 'Getting Started with HTML',
              description: 'Learn the fundamentals of HTML structure and elements',
              position: 1,
              isPublished: true,
              isFree: true,
              videoUrl: 'https://example.com/videos/html-basics',
            },
            {
              title: 'Styling with CSS',
              description: 'Introduction to CSS styling and responsive design',
              position: 2,
              isPublished: true,
              isFree: false,
              videoUrl: 'https://example.com/videos/css-basics',
            },
            {
              title: 'JavaScript Basics',
              description: 'Learn JavaScript fundamentals and DOM manipulation',
              position: 3,
              isPublished: true,
              isFree: false,
              videoUrl: 'https://example.com/videos/js-basics',
            },
            {
              title: 'Building Your First Website',
              description: 'Put it all together to create a complete website',
              position: 4,
              isPublished: true,
              isFree: false,
              videoUrl: 'https://example.com/videos/first-website',
            },
          ],
        },
      },
    }),
    
    prisma.course.create({
      data: {
        title: 'React for Beginners',
        description: 'Master modern React development with hooks, components, and state management',
        price: 149.99,
        isPublished: true,
        categoryId: categories[0].id, // Programming
        creatorId: instructorUser.id,
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500',
        chapters: {
          create: [
            {
              title: 'Introduction to React',
              description: 'Understanding React and setting up your development environment',
              position: 1,
              isPublished: true,
              isFree: true,
              videoUrl: 'https://example.com/videos/react-intro',
            },
            {
              title: 'Components and JSX',
              description: 'Creating reusable components with JSX syntax',
              position: 2,
              isPublished: true,
              isFree: false,
              videoUrl: 'https://example.com/videos/react-components',
            },
            {
              title: 'State and Props',
              description: 'Managing component state and passing data with props',
              position: 3,
              isPublished: true,
              isFree: false,
              videoUrl: 'https://example.com/videos/react-state',
            },
          ],
        },
      },
    }),

    prisma.course.create({
      data: {
        title: 'UI/UX Design Fundamentals',
        description: 'Learn the principles of user interface and user experience design',
        price: 79.99,
        isPublished: true,
        categoryId: categories[1].id, // Design
        creatorId: instructorUser.id,
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
        chapters: {
          create: [
            {
              title: 'Design Thinking Process',
              description: 'Understanding the design thinking methodology',
              position: 1,
              isPublished: true,
              isFree: true,
              videoUrl: 'https://example.com/videos/design-thinking',
            },
            {
              title: 'User Research and Personas',
              description: 'Conducting user research and creating user personas',
              position: 2,
              isPublished: true,
              isFree: false,
              videoUrl: 'https://example.com/videos/user-research',
            },
          ],
        },
      },
    }),

    prisma.course.create({
      data: {
        title: 'Business Strategy 101',
        description: 'Essential business strategy concepts for entrepreneurs and managers',
        price: 199.99,
        isPublished: true,
        categoryId: categories[2].id, // Business
        creatorId: instructorUser.id,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
        chapters: {
          create: [
            {
              title: 'Introduction to Business Strategy',
              description: 'What is business strategy and why it matters',
              position: 1,
              isPublished: true,
              isFree: true,
              videoUrl: 'https://example.com/videos/business-intro',
            },
            {
              title: 'Market Analysis',
              description: 'Understanding your market and competition',
              position: 2,
              isPublished: true,
              isFree: false,
              videoUrl: 'https://example.com/videos/market-analysis',
            },
          ],
        },
      },
    }),

    prisma.course.create({
      data: {
        title: '英語会話マスター',
        description: '日常英会話からビジネス英語まで、実践的な英語コミュニケーションスキル',
        price: 89.99,
        isPublished: true,
        categoryId: categories[3].id, // Language
        creatorId: instructorUser.id,
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500',
        chapters: {
          create: [
            {
              title: '基本的な挨拶と自己紹介',
              description: '英語での基本的な挨拶と自己紹介の方法',
              position: 1,
              isPublished: true,
              isFree: true,
              videoUrl: 'https://example.com/videos/english-greetings',
            },
            {
              title: '日常会話の表現',
              description: '買い物、レストラン、交通機関での英会話',
              position: 2,
              isPublished: true,
              isFree: false,
              videoUrl: 'https://example.com/videos/daily-english',
            },
          ],
        },
      },
    }),
  ]);

  // Create enrollments
  const enrollments = await Promise.all([
    prisma.enrollment.create({
      data: {
        userId: studentUser.id,
        courseId: courses[0].id, // Web Development
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: studentUser.id,
        courseId: courses[1].id, // React
      },
    }),
  ]);

  // Create some user progress
  const webDevChapters = await prisma.chapter.findMany({
    where: { courseId: courses[0].id },
    orderBy: { position: 'asc' },
  });

  if (webDevChapters.length > 0) {
    await prisma.userProgress.create({
      data: {
        userId: studentUser.id,
        chapterId: webDevChapters[0].id,
        isCompleted: true,
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('👤 Users created:', { adminUser, instructorUser, studentUser });
  console.log('📚 Categories created:', categories.length);
  console.log('🎓 Courses created:', courses.length);
  console.log('📖 Enrollments created:', enrollments.length);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });