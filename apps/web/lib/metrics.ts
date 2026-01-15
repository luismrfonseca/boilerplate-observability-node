import { collectDefaultMetrics, Registry, Counter, Histogram } from 'prom-client';

// Global registry to avoid hot-reload issues in dev
const globalRegistry = globalThis as unknown as { __PROMETHEUS_REGISTRY__?: Registry };

export const registry = globalRegistry.__PROMETHEUS_REGISTRY__ || new Registry();

if (!globalRegistry.__PROMETHEUS_REGISTRY__) {
    globalRegistry.__PROMETHEUS_REGISTRY__ = registry;
    collectDefaultMetrics({ register: registry, prefix: 'nextjs_' });
}

// --- HTTP Server Metrics ---
export const httpRequestDurationMicroseconds = new Histogram({
    name: 'nextjs_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    registers: [registry],
});

export const httpRequestsTotal = new Counter({
    name: 'nextjs_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'code'],
    registers: [registry],
});

export const httpErrorsTotal = new Counter({
    name: 'nextjs_http_errors_total',
    help: 'Total number of HTTP errors (5xx)',
    labelNames: ['method', 'route', 'code'],
    registers: [registry],
});

// --- Web Vitals Metrics (Client-Side) ---
export const webVitalsLCP = new Histogram({
    name: 'nextjs_web_vitals_lcp',
    help: 'Largest Contentful Paint (LCP)',
    labelNames: ['path'],
    buckets: [0.1, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10],
    registers: [registry],
});

export const webVitalsCLS = new Histogram({
    name: 'nextjs_web_vitals_cls',
    help: 'Cumulative Layout Shift (CLS)',
    labelNames: ['path'],
    buckets: [0.01, 0.1, 0.25, 0.5, 0.75, 1], // CLS is small (0.1 is good)
    registers: [registry],
});

export const webVitalsINP = new Histogram({
    name: 'nextjs_web_vitals_inp',
    help: 'Interaction to Next Paint (INP)',
    labelNames: ['path'],
    buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1.0],
    registers: [registry],
});

export const webVitalsFCP = new Histogram({
    name: 'nextjs_web_vitals_fcp',
    help: 'First Contentful Paint (FCP)',
    labelNames: ['path'],
    buckets: [0.1, 0.5, 1.0, 1.5, 2.0, 3.0],
    registers: [registry],
});

export const webVitalsTTFB = new Histogram({
    name: 'nextjs_web_vitals_ttfb',
    help: 'Time to First Byte (TTFB)',
    labelNames: ['path'],
    buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1.0, 1.5],
    registers: [registry],
});
