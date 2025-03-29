import { rateLimiter } from './rateLimit';
import { withRetry } from './retry';
import { cache } from './cache';
import { logger } from './logger';
import { ApiError } from './errors';

interface RequestConfig extends RequestInit {
  retry?: boolean;
  cache?: boolean;
  cacheTTL?: number;
  rateLimit?: {
    key: string;
    maxRequests: number;
    windowMs: number;
  };
}

const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const cacheKey = `${config.method || 'GET'}:${url}`;

    // Check rate limit
    if (config.rateLimit) {
      const canProceed = await rateLimiter.checkLimit(
        config.rateLimit.key,
        {
          maxRequests: config.rateLimit.maxRequests,
          windowMs: config.rateLimit.windowMs,
        }
      );

      if (!canProceed) {
        await rateLimiter.waitForReset(config.rateLimit.key);
      }
    }

    // Check cache for GET requests
    if (config.cache && config.method === 'GET') {
      const cachedData = await cache.get<T>(
        cacheKey,
        () => this.executeRequest<T>(url, config),
        { ttl: config.cacheTTL || DEFAULT_CACHE_TTL }
      );
      return cachedData;
    }

    // Execute request with retry if configured
    if (config.retry) {
      return withRetry(() => this.executeRequest<T>(url, config));
    }

    return this.executeRequest<T>(url, config);
  }

  private async executeRequest<T>(
    url: string,
    config: RequestConfig
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...config,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
      });

      if (!response.ok) {
        throw new ApiError(
          response.statusText,
          'API_ERROR',
          response.status
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      logger.error('API request failed', error as Error, {
        url,
        method: config.method,
      });
      throw error;
    }
  }

  private buildUrl(endpoint: string): string {
    return endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint}`;
  }

  // Convenience methods
  async get<T>(
    endpoint: string,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data: unknown,
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string,
    data: unknown,
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(
    endpoint: string,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export const apiClient = ApiClient.getInstance();