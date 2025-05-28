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

  // Create sample course
  const course = await prisma.course.create({
    data: {
      title: 'Introduction to Web Development',
      description: 'Learn the basics of HTML, CSS, and JavaScript',
      price: 99.99,
      isPublished: true,
      categoryId: categories[0].id,
      creatorId: instructorUser.id,
      chapters: {
        create: [
          {
            title: 'Getting Started with HTML',
            description: 'Learn the fundamentals of HTML',
            position: 1,
            isPublished: true,
            isFree: true,
          },
          {
            title: 'Styling with CSS',
            description: 'Introduction to CSS styling',
            position: 2,
            isPublished: true,
            isFree: false,
          },
          {
            title: 'JavaScript Basics',
            description: 'Learn JavaScript fundamentals',
            position: 3,
            isPublished: true,
            isFree: false,
          },
        ],
      },
    },
  });

  // Create enrollment
  await prisma.enrollment.create({
    data: {
      userId: studentUser.id,
      courseId: course.id,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('👤 Users created:', { adminUser, instructorUser, studentUser });
  console.log('📚 Categories created:', categories.length);
  console.log('🎓 Course created:', course.title);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });