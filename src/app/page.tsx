'use client'

import HeroSection from '../components/ui/landing/heroSection'
import FeaturesSection from '../components/ui/landing/featuresSection'
import HowItWorksSection from '../components/ui/landing/howItWorksSection'
import TestimonialsSection from '../components/ui/landing/testimonialsSection'
import SafetyMapSection from '../components/ui/landing/safetyMapSection'
import CTASection from '../components/ui/landing/ctaSection'

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SafetyMapSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
