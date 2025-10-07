'use client';

/**
 * Custom hooks for CMS data fetching with React Query
 */

import { useQuery } from '@tanstack/react-query';
import { cmsClient } from '@/lib/cms';
import type { HomepageContent, NavigationItem, SiteSettings } from '@/types';

/**
 * Fetch homepage content with 1-hour cache
 */
export function useHomepageContent() {
  return useQuery<HomepageContent>({
    queryKey: ['homepage'],
    queryFn: () => cmsClient.getHomepageContent(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Fetch navigation items
 */
export function useNavigation(slug: string = 'main-menu') {
  return useQuery<NavigationItem[]>({
    queryKey: ['navigation', slug],
    queryFn: () => cmsClient.getNavigation(slug),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Fetch site settings
 */
export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ['site-settings'],
    queryFn: () => cmsClient.getSiteSettings(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
