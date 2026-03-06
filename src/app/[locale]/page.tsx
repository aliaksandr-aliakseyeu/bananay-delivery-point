import { HeroSection } from '@/components/hero/hero-section';
import { RedirectWhenAuthenticated } from '@/components/auth/redirect-when-authenticated';

export default function HomePage() {
  return (
    <RedirectWhenAuthenticated>
      <div className="flex flex-col">
        <HeroSection />
      </div>
    </RedirectWhenAuthenticated>
  );
}
