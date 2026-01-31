/* ============================================
   MultiForms Landing Page
   ============================================ */

import {
  LandingNavbar,
  HeroSection,
  FeaturesSection,
  TemplatesSection,
  TestimonialsSection,
  CTASection,
  LandingFooter,
} from '@/components/landing'

export default function HomePage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TemplatesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <LandingFooter />
    </>
  )
}
