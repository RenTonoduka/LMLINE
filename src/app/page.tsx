import { MainLayout } from '@/components/layout/main-layout';
import { Hero } from '@/components/sections/hero';
import { Features } from '@/components/sections/features';
import { FeaturedCourses } from '@/components/sections/featured-courses';
import { Stats } from '@/components/sections/stats';
import { CTA } from '@/components/sections/cta';

export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
      <Features />
      <Stats />
      <FeaturedCourses />
      <CTA />
    </MainLayout>
  );
}