import { logger } from './logger';

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let attempt = 1;
  let delay = finalConfig.initialDelay;

  while (attempt <= finalConfig.maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === finalConfig.maxAttempts) {
        throw error;
      }

      logger.warn('Operation failed, retrying', {
        attempt,
        delay,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      await new Promise(resolve => setTimeout(resolve, delay));
      
      delay = Math.min(
        delay * finalConfig.backoffFactor,
        finalConfig.maxDelay
      );
      attempt++;
    }
  }

  throw new Error('Retry attempts exhausted');
}