import { logger } from './logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxEntries?: number;
}

class Cache {
  private static instance: Cache;
  private cache: Map<string, CacheEntry<any>>;
  private pendingRequests: Map<string, Promise<any>>;
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly maxEntries = 1000;

  private constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.startCleanupInterval();
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cacheKey = this.generateKey(key);
    const now = Date.now();

    // Check if there's a pending request
    const pendingRequest = this.pendingRequests.get(cacheKey);
    if (pendingRequest) {
      logger.debug('Cache: Using pending request', { key: cacheKey });
      return pendingRequest;
    }

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && now < cached.expiresAt) {
      logger.debug('Cache: Hit', { key: cacheKey });
      return cached.data;
    }

    // If not in cache or expired, fetch new data
    try {
      const promise = fetchFn();
      this.pendingRequests.set(cacheKey, promise);

      const data = await promise;
      const ttl = options.ttl || this.defaultTTL;

      this.set(key, data, { ttl });
      return data;
    } catch (error) {
      logger.error('Cache: Fetch error', error as Error, { key: cacheKey });
      throw error;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const cacheKey = this.generateKey(key);
    const now = Date.now();
    const ttl = options.ttl || this.defaultTTL;

    this.cache.set(cacheKey, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });

    // Enforce max entries limit
    if (this.cache.size > (options.maxEntries || this.maxEntries)) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    logger.debug('Cache: Set', { key: cacheKey, ttl });
  }

  invalidate(key: string): void {
    const cacheKey = this.generateKey(key);
    this.cache.delete(cacheKey);
    logger.debug('Cache: Invalidated', { key: cacheKey });
  }

  clear(): void {
    this.cache.clear();
    logger.debug('Cache: Cleared all entries');
  }

  private generateKey(key: string): string {
    return `cache:${key}`;
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now >= entry.expiresAt) {
          this.cache.delete(key);
          logger.debug('Cache: Expired entry removed', { key });
        }
      }
    }, 60000); // Clean up every minute
  }
}

export const cache = Cache.getInstance();