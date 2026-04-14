import { RedirectWhenAuthenticated } from '@/components/auth/redirect-when-authenticated';
import { TrackFinalCtaSection } from '@/components/landing/track-final-cta-section';
import { TrackHowItWorksSection } from '@/components/landing/track-how-it-works-section';
import { TrackLandingHero } from '@/components/landing/track-landing-hero';
import { TrackWhyDeliveryPointSection } from '@/components/landing/track-why-delivery-point-section';
import { LandingDivider } from '@/components/landing/landing-divider';

export default function HomePage() {
  return (
    <RedirectWhenAuthenticated>
      <div className="page-shell">
        <TrackLandingHero />
        <LandingDivider />
        <TrackHowItWorksSection />
        <LandingDivider />
        <TrackWhyDeliveryPointSection />
        <LandingDivider tone="slate" />
        <TrackFinalCtaSection />
      </div>
    </RedirectWhenAuthenticated>
  );
}
