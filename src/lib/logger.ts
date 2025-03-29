import { ErrorCodes } from './errors';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private logBuffer: LogEntry[] = [];
  private readonly bufferSize = 1000;
  private readonly environment = import.meta.env.MODE;

  private constructor() {
    window.addEventListener('unload', () => this.flush());
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatError(error: Error): Record<string, unknown> {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof Error && 'code' in error
        ? { code: (error as any).code }
        : {}),
    };
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error ? this.formatError(error) as any : undefined,
    };
  }

  private log(entry: LogEntry): void {
    // Add to buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.bufferSize) {
      this.logBuffer.shift();
    }

    // Console output in development
    if (this.environment === 'development') {
      const consoleMethod = entry.level === 'error' ? 'error' 
        : entry.level === 'warn' ? 'warn'
        : entry.level === 'info' ? 'info'
        : 'debug';

      console[consoleMethod](
        `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`,
        entry.context || '',
        entry.error || ''
      );
    }

    // In production, we could send logs to a service
    if (this.environment === 'production') {
      this.sendToLogService(entry);
    }
  }

  private async sendToLogService(entry: LogEntry): Promise<void> {
    // Implementation for sending logs to a service
    // This is where you'd integrate with your logging service
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        console.error('Failed to send log to service:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending log to service:', error);
    }
  }

  private flush(): void {
    // Implement log flushing logic
    if (this.environment === 'production' && this.logBuffer.length > 0) {
      navigator.sendBeacon('/api/logs/bulk', JSON.stringify(this.logBuffer));
      this.logBuffer = [];
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(this.createLogEntry('debug', message, context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(this.createLogEntry('info', message, context));
  }

  warn(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(this.createLogEntry('warn', message, context, error));
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(this.createLogEntry('error', message, context, error));
  }

  // API specific logging methods
  logApiRequest(endpoint: string, params: Record<string, unknown>): void {
    this.debug('API Request', {
      endpoint,
      params: this.sanitizeParams(params),
    });
  }

  logApiResponse(endpoint: string, response: unknown): void {
    this.debug('API Response', {
      endpoint,
      response: this.sanitizeResponse(response),
    });
  }

  logApiError(
    endpoint: string,
    error: Error,
    context?: Record<string, unknown>
  ): void {
    this.error(
      `API Error: ${endpoint}`,
      error,
      {
        ...context,
        errorCode: (error as any).code || ErrorCodes.API_ERROR,
      }
    );
  }

  // Security logging
  logSecurityEvent(event: string, context: Record<string, unknown>): void {
    this.info(`Security Event: ${event}`, {
      ...context,
      timestamp: new Date().toISOString(),
    });
  }

  // Performance logging
  logPerformanceMetric(
    metric: string,
    value: number,
    context?: Record<string, unknown>
  ): void {
    this.info(`Performance Metric: ${metric}`, {
      value,
      ...context,
    });
  }

  private sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
    const sensitiveFields = ['password', 'token', 'key', 'secret'];
    return Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        key,
        sensitiveFields.includes(key.toLowerCase()) ? '[REDACTED]' : value,
      ])
    );
  }

  private sanitizeResponse(response: unknown): unknown {
    if (typeof response !== 'object' || !response) return response;
    
    const sanitized = { ...response as Record<string, unknown> };
    const sensitiveFields = ['token', 'key', 'secret'];
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
}

export const logger = Logger.getInstance();