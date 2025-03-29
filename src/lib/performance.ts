import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';
import { metrics } from './metrics';
import { logger } from './logger';

interface WebVitalMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private isMonitoring = false;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Monitor Core Web Vitals
    onCLS(this.handleWebVital);
    onFID(this.handleWebVital);
    onFCP(this.handleWebVital);
    onLCP(this.handleWebVital);
    onTTFB(this.handleWebVital);

    // Monitor Navigation Timing
    this.monitorNavigationTiming();

    // Monitor Resource Timing
    this.monitorResourceTiming();

    // Monitor Long Tasks
    this.monitorLongTasks();

    // Monitor Memory Usage
    this.monitorMemoryUsage();

    logger.info('Performance monitoring started');
  }

  private handleWebVital = (metric: WebVitalMetric): void => {
    const { name, value, delta, id } = metric;

    metrics.histogram(`web_vitals_${name.toLowerCase()}`, value, {
      delta: delta.toString(),
      id,
    });

    logger.info(`Web Vital: ${name}`, {
      value,
      delta,
      id,
    });
  };

  private monitorNavigationTiming(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const timings = {
            dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcpConnection: navigation.connectEnd - navigation.connectStart,
            serverResponse: navigation.responseEnd - navigation.requestStart,
            domComplete: navigation.domComplete - navigation.responseEnd,
            loadEvent: navigation.loadEventEnd - navigation.loadEventStart,
            totalPageLoad: navigation.loadEventEnd - navigation.startTime,
          };

          Object.entries(timings).forEach(([key, value]) => {
            metrics.histogram(`navigation_timing_${key}`, value);
          });

          logger.info('Navigation Timing', timings);
        }
      }, 0);
    });
  }

  private monitorResourceTiming(): void {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          
          metrics.histogram('resource_load_time', resource.duration, {
            type: resource.initiatorType,
            name: new URL(resource.name).pathname,
          });

          if (resource.duration > 1000) {
            logger.warn('Slow resource load', {
              resource: resource.name,
              duration: resource.duration,
              type: resource.initiatorType,
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private monitorLongTasks(): void {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        metrics.histogram('long_task_duration', entry.duration, {
          name: entry.name,
        });

        logger.warn('Long task detected', {
          duration: entry.duration,
          name: entry.name,
          startTime: entry.startTime,
        });
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
  }

  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        
        metrics.gauge('memory_heap_size', memory.totalJSHeapSize);
        metrics.gauge('memory_heap_limit', memory.jsHeapSizeLimit);
        metrics.gauge('memory_heap_used', memory.usedJSHeapSize);

        const heapUsagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (heapUsagePercent > 90) {
          logger.warn('High memory usage', {
            usedHeap: memory.usedJSHeapSize,
            totalHeap: memory.totalJSHeapSize,
            heapLimit: memory.jsHeapSizeLimit,
            usagePercent: heapUsagePercent,
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();