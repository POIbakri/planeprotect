import { logger } from './logger';

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private readonly securityHeaders = {
    'Content-Security-Policy': this.generateCSP(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': this.generatePermissionsPolicy(),
  };

  private constructor() {
    this.setupSecurityMonitoring();
  }

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  private generateCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://rsms.me",
      "img-src 'self' https://images.unsplash.com data: blob:",
      "font-src 'self' https://rsms.me",
      `connect-src 'self' ${import.meta.env.VITE_SUPABASE_URL} https://api.aviationstack.com`,
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; ');
  }

  private generatePermissionsPolicy(): string {
    return [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'bluetooth=()',
    ].join(', ');
  }

  private setupSecurityMonitoring(): void {
    // Monitor for XSS attempts
    this.monitorXSSAttempts();

    // Monitor for CSRF attempts
    this.monitorCSRFAttempts();

    // Monitor for suspicious network requests
    this.monitorNetworkRequests();

    // Apply security headers
    this.applySecurityHeaders();

    logger.info('Security monitoring initialized');
  }

  private monitorXSSAttempts(): void {
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (typeof message === 'string' && message.includes('Script error')) {
        logger.warn('Potential XSS attempt detected', {
          message,
          source,
          lineno,
          colno,
        });
      }
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };
  }

  private monitorCSRFAttempts(): void {
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(init.method)) {
        const token = localStorage.getItem('csrf_token');
        if (!token || !init.headers?.['X-CSRF-Token']) {
          logger.warn('CSRF token missing in request', {
            url: typeof input === 'string' ? input : input.url,
            method: init.method,
          });
        }
      }
      return originalFetch(input, init);
    };
  }

  private monitorNetworkRequests(): void {
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = class extends originalXHR {
      open(method: string, url: string | URL) {
        if (typeof url === 'string' && !url.startsWith(window.location.origin)) {
          logger.info('External request detected', {
            method,
            url: url.toString(),
          });
        }
        super.open(method, url);
      }
    };
  }

  private applySecurityHeaders(): void {
    // Apply security headers to meta tags
    Object.entries(this.securityHeaders).forEach(([header, value]) => {
      const meta = document.createElement('meta');
      meta.httpEquiv = header;
      meta.content = value;
      document.head.appendChild(meta);
    });
  }
}

export const securityMonitor = SecurityMonitor.getInstance();