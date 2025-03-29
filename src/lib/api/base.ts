import { logger } from '../logger';
import { cache } from '../cache';
import { metrics } from '../metrics';
import { handleApiError } from '../errors';
import { API_CONFIG } from '../constants';
import type { ApiResponse } from '../types';

interface RequestOptions {
  method?: string;
  cache?: boolean;
  ttl?: number;
  retries?: number;
}

export async function makeApiRequest<T>(
  endpoint: string,
  params: Record<string, string> = {},
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const cacheKey = `api:${endpoint}:${JSON.stringify(params)}`;
  const startTime = performance.now();

  try {
    if (options.cache) {
      return await cache.get(
        cacheKey,
        () => executeRequest<T>(endpoint, params, options),
        { ttl: options.ttl || API_CONFIG.cacheTTL }
      );
    }

    return await executeRequest<T>(endpoint, params, options);
  } catch (error) {
    handleApiError(error);
    throw error;
  } finally {
    const duration = performance.now() - startTime;
    metrics.histogram('api_request_duration', duration, {
      endpoint,
      cached: String(!!options.cache),
    });
  }
}

async function executeRequest<T>(
  endpoint: string,
  params: Record<string, string>,
  options: RequestOptions
): Promise<ApiResponse<T>> {
  const url = new URL(`${API_CONFIG.baseUrl}${endpoint}`);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    logger.debug('Making API request', { endpoint, params });

    const response = await fetch(url.toString(), {
      method: options.method || 'GET',
      signal: controller.signal,
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      logger.error('API error', data.error);
      throw new Error(data.error.message || 'API error occurred');
    }

    return {
      data: data as T,
      error: null,
    };
  } catch (error) {
    logger.error('API request failed', error as Error, { endpoint });
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function buildQueryString(params: Record<string, string | number | boolean>): string {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

export function parseResponse<T>(response: unknown): ApiResponse<T> {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response format');
  }

  if ('error' in response && response.error) {
    return {
      data: null as unknown as T,
      error: {
        message: String(response.error),
        code: 'API_ERROR',
      },
    };
  }

  if (!('data' in response)) {
    throw new Error('Response missing data field');
  }

  return {
    data: response.data as T,
    error: null,
  };
}