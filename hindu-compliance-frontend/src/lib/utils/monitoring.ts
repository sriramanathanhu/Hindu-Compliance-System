/**
 * Performance monitoring utilities
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Report Web Vitals to console or analytics
 */
export function reportWebVitals(metric: PerformanceMetric) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
    });
  }

  // Send to analytics service (e.g., Google Analytics, Sentry)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_rating: metric.rating,
      non_interaction: true,
    });
  }
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string) {
  if (typeof window === 'undefined') return;

  const startMark = `${componentName}-start`;
  const endMark = `${componentName}-end`;
  const measureName = `${componentName}-render`;

  performance.mark(startMark);

  return () => {
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);

    const measure = performance.getEntriesByName(measureName)[0];
    if (measure && process.env.NODE_ENV === 'development') {
      console.log(`[Render Time] ${componentName}: ${measure.duration.toFixed(2)}ms`);
    }

    // Cleanup
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
  };
}

/**
 * Log API request performance
 */
export function logAPIPerformance(
  endpoint: string,
  startTime: number,
  success: boolean
) {
  const duration = Date.now() - startTime;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${endpoint}:`, {
      duration: `${duration}ms`,
      success,
    });
  }

  // Send to monitoring service
  if (duration > 3000) {
    console.warn(`Slow API request: ${endpoint} took ${duration}ms`);
  }
}

/**
 * Monitor bundle size in development
 */
export function logBundleSize() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  const resources = performance.getEntriesByType('resource');
  const scripts = resources.filter((r) => r.name.includes('.js'));

  let totalSize = 0;
  scripts.forEach((script: any) => {
    totalSize += script.transferSize || 0;
  });

  console.log(`[Bundle Size] Total JS: ${(totalSize / 1024).toFixed(2)}KB`);
}

/**
 * Global error handler
 */
export function setupErrorMonitoring() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    console.error('Global error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });

    // Send to error tracking service (e.g., Sentry)
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);

    // Send to error tracking service
  });
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
