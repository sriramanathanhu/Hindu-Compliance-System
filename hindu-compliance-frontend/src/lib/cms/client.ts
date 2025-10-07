/**
 * Payload CMS API Client
 * Handles content fetching with caching and error handling
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  HomepageContent,
  NavigationItem,
  SiteSettings,
  PayloadResponse,
  PayloadError,
} from '@/types';

class PayloadCMSClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_CMS_URL || 'http://localhost:3001';

    this.client = axios.create({
      baseURL: `${this.baseUrl}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Add API key if available
    const apiKey = process.env.PAYLOAD_CMS_API_KEY;
    if (apiKey) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
    }

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<PayloadError>) => {
        if (error.response?.data?.errors) {
          const messages = error.response.data.errors.map((e) => e.message).join(', ');
          throw new Error(`CMS Error: ${messages}`);
        }
        throw new Error(error.message || 'CMS request failed');
      }
    );
  }

  /**
   * Fetch homepage content
   */
  async getHomepageContent(): Promise<HomepageContent> {
    const response = await this.client.get<HomepageContent>('/pages/homepage');
    return response.data;
  }

  /**
   * Fetch navigation items
   */
  async getNavigation(slug: string = 'main-menu'): Promise<NavigationItem[]> {
    const response = await this.client.get<PayloadResponse<NavigationItem>>(
      `/navigation/${slug}`
    );
    return response.data.docs;
  }

  /**
   * Fetch global site settings
   */
  async getSiteSettings(): Promise<SiteSettings> {
    const response = await this.client.get<SiteSettings>('/globals/site-settings');
    return response.data;
  }

  /**
   * Fetch media file URL
   */
  getMediaUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    return `${this.baseUrl}${path}`;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const cmsClient = new PayloadCMSClient();

// Export for testing or custom instances
export default PayloadCMSClient;
