import { MotionConfig } from 'framer-motion';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import StatsSection from './StatsSection';
import BenefitsSection from './BenefitsSection';
import TestimonialsSection from './TestimonialsSection';
import FinalCtaSection from './FinalCtaSection';
import LandingFooter from './LandingFooter';

export default function LandingPage() {
    return (
        <MotionConfig reducedMotion="user">
            <div className="landing-root">
                <a href="#main-content" className="landing-skip-link">
                    Skip to content
                </a>
                <header>
                    <LandingNavbar />
                </header>
                <main id="main-content">
                    <HeroSection />
                    <FeaturesSection />
                    <HowItWorksSection />
                    <StatsSection />
                    <BenefitsSection />
                    <TestimonialsSection />
                    <FinalCtaSection />
                </main>
                <footer>
                    <LandingFooter />
                </footer>
            </div>
        </MotionConfig>
    );
}