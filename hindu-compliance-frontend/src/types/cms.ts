/**
 * Payload CMS Content Types
 * Based on data-model.md Phase 1 entities
 */

export interface MediaItem {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  mime_type?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  order: number;
  parent_id?: string;
  children?: NavigationItem[];
}

export interface HeroSection {
  title: string;
  subtitle: string;
  background_image: MediaItem;
  cta_text?: string;
  cta_link?: string;
  search_placeholder?: string;
}

export interface Feature {
  id: string;
  icon?: MediaItem;
  title: string;
  description: string;
}

export interface SecondarySection {
  title: string;
  description: string;
  features: Feature[];
}

export interface FeaturedItem {
  id: string;
  title: string;
  description?: string;
  image?: MediaItem;
  link?: string;
}

export interface FeaturedContent {
  title: string;
  items: FeaturedItem[];
}

export interface SectionPart {
  title: string;
  content: string;
  image?: MediaItem;
}

export interface FourthSection {
  part1: SectionPart;
  part2: SectionPart;
}

export interface ServiceItem {
  id: string;
  icon?: MediaItem;
  title: string;
  description: string;
  link?: string;
}

export interface BusinessServices {
  title: string;
  services: ServiceItem[];
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_role?: string;
  author_image?: MediaItem;
  content: string;
  rating?: number;
}

export interface TestimonialsSection {
  title: string;
  items: Testimonial[];
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
  order: number;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface FooterSection {
  logo?: MediaItem;
  tagline?: string;
  columns: FooterColumn[];
  social_links?: {
    platform: string;
    url: string;
    icon?: string;
  }[];
  copyright?: string;
}

export interface HomepageContent {
  hero: HeroSection;
  secondary_section: SecondarySection;
  featured_content: FeaturedContent;
  fourth_section: FourthSection;
  business_services: BusinessServices;
  testimonials: TestimonialsSection;
  last_updated: string;
}

export interface SiteSettings {
  site_name: string;
  site_logo: MediaItem;
  site_description?: string;
  contact_email?: string;
  contact_phone?: string;
  social_links?: {
    platform: string;
    url: string;
  }[];
}

export interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

export interface PayloadError {
  errors: {
    message: string;
    field?: string;
  }[];
}
