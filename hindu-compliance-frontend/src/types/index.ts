/**
 * Central type exports
 */

export type {
  NandiUser,
  NandiTokenResponse,
  NandiSession,
  NandiAuthError,
  AuthState,
  SignInParams,
  TokenExchangeParams,
} from './auth';

export type {
  MediaItem,
  NavigationItem,
  HeroSection,
  Feature,
  SecondarySection,
  FeaturedItem,
  FeaturedContent,
  SectionPart,
  FourthSection,
  ServiceItem,
  BusinessServices,
  Testimonial,
  TestimonialsSection,
  FooterLink,
  FooterColumn,
  FooterSection,
  HomepageContent,
  SiteSettings,
  PayloadResponse,
  PayloadError,
} from './cms';

// Common utility types
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
