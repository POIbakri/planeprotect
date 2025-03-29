import { logger } from './logger';
import { metrics } from './metrics';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDuration?: number;
}

interface RateLimitState {
  count: number;
  resetTime: number;
  blocked?: boolean;
  blockExpires?: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, RateLimitState>;
  private readonly cleanupInterval = 3600000; // 1 hour

  private constructor() {
    this.limits = new Map();
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  async checkLimit(key: string, config: RateLimitConfig): Promise<boolean> {
    const now = Date.now();
    const state = this.limits.get(key) || { count: 0, resetTime: now + config.windowMs };

    // Check if blocked
    if (state.blocked && state.blockExpires && now < state.blockExpires) {
      metrics.increment('rate_limit_blocked', { key });
      return false;
    }

    // Reset if window has passed
    if (now > state.resetTime) {
      state.count = 0;
      state.resetTime = now + config.windowMs;
      state.blocked = false;
      state.blockExpires = undefined;
    }

    // Check if limit exceeded
    if (state.count >= config.maxRequests) {
      if (config.blockDuration) {
        state.blocked = true;
        state.blockExpires = now + config.blockDuration;
      }

      metrics.increment('rate_limit_exceeded', { key });
      logger.warn('Rate limit exceeded', {
        key,
        count: state.count,
        resetTime: new Date(state.resetTime).toISOString(),
      });
      return false;
    }

    // Increment counter
    state.count++;
    this.limits.set(key, state);
    
    metrics.gauge('rate_limit_remaining', config.maxRequests - state.count, { key });
    return true;
  }

  getRemainingRequests(key: string): number {
    const state = this.limits.get(key);
    if (!state) return Infinity;

    const now = Date.now();
    if (now > state.resetTime) return Infinity;

    return Math.max(0, state.count);
  }

  async waitForReset(key: string): Promise<void> {
    const state = this.limits.get(key);
    if (!state) return;

    const now = Date.now();
    const waitTime = Math.max(0, state.resetTime - now);
    
    if (waitTime > 0) {
      logger.info('Waiting for rate limit reset', {
        key,
        waitTime,
        resetTime: new Date(state.resetTime).toISOString(),
      });
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, state] of this.limits.entries()) {
      if (now > state.resetTime && (!state.blockExpires || now > state.blockExpires)) {
        this.limits.delete(key);
      }
    }
  }
}

export const rateLimiter = RateLimiter.getInstance();