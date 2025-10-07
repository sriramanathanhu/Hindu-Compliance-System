'use client';

import { Header, Footer } from '@/components/layout';
import {
  HeroSection,
  SecondarySection,
  FeaturedContent,
  FourthSection,
  BusinessServices,
  TestimonialsSection,
} from '@/components/homepage';
import { useHomepageContent, useNavigation, useSiteSettings } from '@/hooks/useCMS';

export default function HomePage() {
  const { data: homepage, isLoading: isLoadingHomepage } = useHomepageContent();
  const { data: navigation } = useNavigation();
  const { data: siteSettings } = useSiteSettings();

  if (isLoadingHomepage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!homepage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-neutral-700 mb-4">Unable to load homepage content</p>
          <p className="text-neutral-600">Please check your CMS connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        navigation={navigation}
        siteName={siteSettings?.site_name}
        logoUrl={siteSettings?.site_logo?.url}
      />

      <main className="flex-1">
        <HeroSection hero={homepage.hero} />
        <SecondarySection section={homepage.secondary_section} />
        <FeaturedContent content={homepage.featured_content} />
        <FourthSection section={homepage.fourth_section} />
        <BusinessServices services={homepage.business_services} />
        <TestimonialsSection testimonials={homepage.testimonials} />
      </main>

      <Footer />
    </div>
  );
}
