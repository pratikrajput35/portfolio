import HeroSection from '@/components/sections/HeroSection';
import FeaturedProjects from '@/components/sections/FeaturedProjects';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import ServicesPreview from '@/components/sections/ServicesPreview';
import CTABanner from '@/components/sections/CTABanner';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProjects />
      <ServicesPreview />
      <TestimonialsSection />
      <CTABanner />
    </>
  );
}
