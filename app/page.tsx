import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { WhyPlatformSection } from "@/components/why-platform-section"
import { CoverageCarousel } from "@/components/coverage-carousel"
import { NewsletterSection } from "@/components/newsletter-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <WhyPlatformSection />
        <CoverageCarousel />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  )
}
