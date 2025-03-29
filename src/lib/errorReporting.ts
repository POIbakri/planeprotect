import { logger } from './logger';
import { metrics } from './metrics';

interface ErrorContext {
  componentName?: string;
  action?: string;
  userId?: string;
  additionalData?: Record<string, unknown>;
}

class ErrorReporter {
  private static instance: ErrorReporter;
  private readonly environment = import.meta.env.MODE;
  private readonly sampleRate = 0.1; // 10% of errors
  private errorCount = 0;

  private constructor() {
    this.initializeGlobalHandlers();
  }

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  private initializeGlobalHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.report(event.reason, {
        action: 'unhandled_promise_rejection',
      });
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.report(event.error, {
        action: 'uncaught_error',
      });
    });
  }

  report(error: Error, context: ErrorContext = {}): void {
    this.errorCount++;

    // Log error locally
    logger.error('Application error', error, context);

    // Track error metrics
    metrics.increment('error_count', {
      type: error.name,
      ...context,
    });

    // Only report a sample of errors in production
    if (
      this.environment === 'production' &&
      Math.random() > this.sampleRate
    ) {
      return;
    }

    // Prepare error report
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context,
      },
      metadata: {
        environment: this.environment,
        errorCount: this.errorCount,
      },
    };

    // Send error report to backend
    this.sendErrorReport(errorReport);
  }

  private async sendErrorReport(report: unknown): Promise<void> {
    try {
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        logger.error('Failed to send error report', new Error(response.statusText));
      }
    } catch (error) {
      logger.error('Error reporting failed', error as Error);
    }
  }

  getErrorCount(): number {
    return this.errorCount;
  }

  clearErrorCount(): void {
    this.errorCount = 0;
  }
}

export const errorReporter = ErrorReporter.getInstance();