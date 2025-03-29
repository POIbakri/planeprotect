import { logger } from './logger';

type MetricType = 'counter' | 'gauge' | 'histogram';

interface Metric {
  name: string;
  type: MetricType;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

interface Alert {
  metric: string;
  threshold: number;
  condition: 'above' | 'below';
  window: number; // in milliseconds
}

class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Metric[] = [];
  private readonly flushInterval = 60000; // 1 minute
  private alerts: Map<string, Alert> = new Map();
  private alertHistory: Map<string, number[]> = new Map();

  private constructor() {
    setInterval(() => this.flush(), this.flushInterval);
    this.setupDefaultAlerts();
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  private setupDefaultAlerts() {
    // Error rate alert
    this.setAlert('error_count', {
      threshold: 10,
      condition: 'above',
      window: 300000, // 5 minutes
    });

    // API response time alert
    this.setAlert('api_request_duration', {
      threshold: 2000, // 2 seconds
      condition: 'above',
      window: 60000, // 1 minute
    });

    // Memory usage alert
    this.setAlert('memory_heap_used', {
      threshold: 0.9, // 90% of heap limit
      condition: 'above',
      window: 60000,
    });
  }

  setAlert(metric: string, alert: Omit<Alert, 'metric'>) {
    this.alerts.set(metric, { metric, ...alert });
    this.alertHistory.set(metric, []);
  }

  increment(name: string, labels?: Record<string, string>): void {
    this.record(name, 'counter', 1, labels);
  }

  gauge(name: string, value: number, labels?: Record<string, string>): void {
    this.record(name, 'gauge', value, labels);
  }

  histogram(name: string, value: number, labels?: Record<string, string>): void {
    this.record(name, 'histogram', value, labels);
    this.checkAlert(name, value);
  }

  private checkAlert(name: string, value: number) {
    const alert = this.alerts.get(name);
    if (!alert) return;

    const history = this.alertHistory.get(name) || [];
    const now = Date.now();
    
    // Remove old values outside the window
    const windowStart = now - alert.window;
    const filteredHistory = history.filter(time => time >= windowStart);
    filteredHistory.push(now);
    this.alertHistory.set(name, filteredHistory);

    const isTriggered = alert.condition === 'above' 
      ? value > alert.threshold
      : value < alert.threshold;

    if (isTriggered && filteredHistory.length >= 3) { // Require 3 violations
      this.triggerAlert(name, value, alert);
    }
  }

  private triggerAlert(metric: string, value: number, alert: Alert) {
    logger.error(`Metric alert triggered: ${metric}`, {
      value,
      threshold: alert.threshold,
      condition: alert.condition,
    });

    // Send alert to monitoring service
    if (import.meta.env.MODE === 'production') {
      fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric,
          value,
          alert,
          timestamp: new Date().toISOString(),
        }),
      }).catch(error => {
        logger.error('Failed to send alert', error);
      });
    }
  }

  private record(
    name: string,
    type: MetricType,
    value: number,
    labels?: Record<string, string>
  ): void {
    this.metrics.push({
      name,
      type,
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  private async flush(): Promise<void> {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    if (import.meta.env.MODE === 'production') {
      try {
        await fetch('/api/metrics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metricsToSend),
        });
      } catch (error) {
        logger.error('Failed to send metrics:', error);
        // Re-add failed metrics to the queue
        this.metrics.push(...metricsToSend);
      }
    }
  }
}

export const metrics = MetricsCollector.getInstance();