import { BaseProviderAdapter } from './base';
import { 
  ProviderConfig, 
  CatalogDiscoveryParams, 
  CatalogDiscoveryResult, 
  VideoSource 
} from '@/types/provider';

const JUSTWATCH_PARTNER_API_BASE = 'https://apis.justwatch.com/content';

export class JustWatchAdapter implements BaseProviderAdapter {
  readonly config: ProviderConfig = {
    id: 'justwatch',
    name: 'JustWatch Official Partner API',
    apiType: 'rest',
    apiEndpoint: JUSTWATCH_PARTNER_API_BASE,
    documentationUrl: 'https://apis.justwatch.com/docs/api/',
    authenticationType: 'partner_key',
    connectionStatus: 'partner_required',
    countryCoverage: ['IN', 'US', 'GB', 'DE', 'FR', 'CA', 'AU'],
    lastSyncAt: null,
    syncIntervalHours: 24,
    features: {
      hasCatalog: true,
      hasStreams: false,
      hasDeepLinks: true,
      hasEmbed: false,
      isFree: false,
      requiresSubscription: true
    },
    rateLimitPerMinute: 30
  };

  private partnerToken: string | null;

  constructor() {
    this.partnerToken = process.env.JUSTWATCH_PARTNER_KEY || null;
    if (this.isConfigured()) {
      this.config.connectionStatus = 'connected';
    } else {
      this.config.connectionStatus = 'partner_required';
    }
  }

  isConfigured(): boolean {
    return Boolean(this.partnerToken && this.partnerToken !== 'your_justwatch_partner_token');
  }

  async testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number; details?: Record<string, unknown> }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'JustWatch Partner API credentials are required. Set JUSTWATCH_PARTNER_KEY with authorized agreement credentials.',
        details: {
          status: 'awaiting_partner_credentials',
          documentation: this.config.documentationUrl,
          notice: 'Per JustWatch terms of service, partner credentials must be provisioned before production queries.'
        }
      };
    }

    const start = Date.now();
    try {
      const res = await fetch(`${JUSTWATCH_PARTNER_API_BASE}/providers/locale/en_IN`, {
        headers: {
          'Authorization': `Bearer ${this.partnerToken}`,
          'Accept': 'application/json'
        }
      });
      const latency = Date.now() - start;

      if (res.ok) {
        this.config.connectionStatus = 'connected';
        return {
          success: true,
          message: 'JustWatch Partner API connection verified successfully.',
          latencyMs: latency,
          details: { status: 'authorized', locale: 'en_IN' }
        };
      }

      this.config.connectionStatus = 'error';
      return {
        success: false,
        message: `JustWatch Partner API returned HTTP ${res.status}: ${res.statusText}`,
        latencyMs: latency
      };
    } catch (err: any) {
      this.config.connectionStatus = 'error';
      return {
        success: false,
        message: `JustWatch connection error: ${err.message || 'Network error'}`,
        latencyMs: Date.now() - start
      };
    }
  }

  async discoverCatalog(params: CatalogDiscoveryParams): Promise<CatalogDiscoveryResult> {
    const country = params.country || 'IN';

    // If unconfigured, do not fabricate data
    return {
      items: [],
      page: 1,
      totalPages: 0,
      totalResults: 0,
      providerId: 'justwatch',
      country
    };
  }

  async getAvailability(title: string, tmdbId?: number, country: string = 'IN'): Promise<VideoSource[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const res = await fetch(
        `${JUSTWATCH_PARTNER_API_BASE}/titles/en_${country}/popular`,
        {
          headers: {
            'Authorization': `Bearer ${this.partnerToken}`,
            'Accept': 'application/json'
          },
          next: { revalidate: 3600 }
        }
      );
      if (!res.ok) return [];
      const data = await res.json();
      const items = data.items || [];
      const match = items.find((i: any) => i.title?.toLowerCase() === title.toLowerCase());
      if (!match || !match.offers) return [];

      return match.offers.map((offer: any, idx: number): VideoSource => ({
        id: `jw-${match.id}-${offer.provider_id}-${idx}`,
        contentId: String(tmdbId || match.id),
        providerId: String(offer.provider_id),
        providerName: offer.package?.clear_name || 'Official Partner',
        sourceType: 'official_web',
        format: 'external',
        officialWatchUrl: offer.urls?.standard_web || '',
        appDeepLink: {
          android: offer.urls?.deeplink_android,
          ios: offer.urls?.deeplink_ios,
          web: offer.urls?.standard_web
        },
        pricingType: offer.monetization_type === 'flatrate' ? 'subscription' : offer.monetization_type === 'free' ? 'free' : 'rent',
        price: offer.retail_price ? `₹${offer.retail_price}` : undefined,
        quality: offer.presentation_type === '4k' ? '4K' : '1080p',
        country,
        rightsStatus: 'licensed_partner',
        verificationStatus: 'verified',
        lastChecked: new Date().toISOString()
      }));
    } catch {
      return [];
    }
  }
}
