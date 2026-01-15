# 📈 Prometheus Integration Guide

## Overview

Prometheus has been successfully integrated into the observability boilerplate to provide **metrics and monitoring** capabilities alongside distributed tracing.

## 🎯 What Was Added

### 1. Infrastructure (Docker)
- **Prometheus** container running on port **9090**
- Configured to scrape metrics from the NestJS backend every 15 seconds
- Persistent storage with Docker volume

### 2. Backend (NestJS)
- **@willsoto/nestjs-prometheus** package for easy Prometheus integration
- **/metrics** endpoint exposing Prometheus metrics
- **Default metrics** (CPU, memory, event loop, etc.)
- **Custom metrics**:
  - `api_requests_total` - Counter for total API requests
  - `api_request_duration_seconds` - Histogram for request duration

### 3. Grafana Integration
- Prometheus datasource auto-configured
- Exemplar support linking metrics to traces
- Ready to create dashboards

## 📊 Available Metrics

### Default Metrics (Node.js)
- `process_cpu_user_seconds_total` - CPU usage
- `process_resident_memory_bytes` - Memory usage
- `nodejs_eventloop_lag_seconds` - Event loop lag
- `nodejs_heap_size_total_bytes` - Heap size
- And many more...

### Custom Application Metrics

#### 1. Request Counter
```
api_requests_total{endpoint="/api/hello", method="GET"}
```
Tracks the total number of requests to each endpoint.

#### 2. Request Duration Histogram
```
api_request_duration_seconds{endpoint="/api/slow"}
```
Tracks request duration with buckets: [0.1, 0.5, 1, 2, 5, 10] seconds.

## 🔍 Viewing Metrics

### Option 1: Raw Metrics Endpoint
Visit http://localhost:3001/metrics to see all metrics in Prometheus format.

Example output:
```
# HELP api_requests_total Total number of API requests
# TYPE api_requests_total counter
api_requests_total{endpoint="/api/hello",method="GET"} 5

# HELP api_request_duration_seconds API request duration in seconds
# TYPE api_request_duration_seconds histogram
api_request_duration_seconds_bucket{le="0.1",endpoint="/api/hello"} 5
api_request_duration_seconds_bucket{le="0.5",endpoint="/api/hello"} 5
api_request_duration_seconds_sum{endpoint="/api/hello"} 0.045
api_request_duration_seconds_count{endpoint="/api/hello"} 5
```

### Option 2: Prometheus UI
1. Open http://localhost:9090
2. Use the query interface to explore metrics
3. Example queries:
   ```promql
   # Request rate
   rate(api_requests_total[5m])
   
   # 95th percentile latency
   histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m]))
   
   # Total requests by endpoint
   sum by (endpoint) (api_requests_total)
   ```

### Option 3: Grafana
1. Open http://localhost:3000
2. Go to **Explore**
3. Select **Prometheus** datasource
4. Run queries or create dashboards

## 📈 Example Queries

### Request Rate (requests per second)
```promql
rate(api_requests_total[5m])
```

### Average Request Duration
```promql
rate(api_request_duration_seconds_sum[5m]) / rate(api_request_duration_seconds_count[5m])
```

### 95th Percentile Latency
```promql
histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m]))
```

### Memory Usage
```promql
process_resident_memory_bytes
```

### CPU Usage
```promql
rate(process_cpu_user_seconds_total[5m])
```

## 🎨 Creating Dashboards in Grafana

1. Go to **Dashboards** → **New** → **New Dashboard**
2. Add panels with queries like:
   - **Request Rate**: `rate(api_requests_total[5m])`
   - **Latency**: `histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m]))`
   - **Error Rate**: `rate(api_requests_total{status="error"}[5m])`
3. Save the dashboard

## 🔧 Adding Custom Metrics

### Step 1: Define the Metric in app.module.ts
```typescript
import { makeCounterProvider, makeGaugeProvider } from '@willsoto/nestjs-prometheus';

providers: [
  makeCounterProvider({
    name: 'my_custom_counter',
    help: 'Description of my counter',
    labelNames: ['label1', 'label2'],
  }),
  makeGaugeProvider({
    name: 'my_custom_gauge',
    help: 'Description of my gauge',
  }),
]
```

### Step 2: Inject and Use in Service
```typescript
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge } from 'prom-client';

constructor(
  @InjectMetric('my_custom_counter')
  private readonly myCounter: Counter<string>,
  @InjectMetric('my_custom_gauge')
  private readonly myGauge: Gauge<string>,
) {}

someMethod() {
  this.myCounter.inc({ label1: 'value1' });
  this.myGauge.set(42);
}
```

## 📦 Metric Types

### Counter
Monotonically increasing value (e.g., total requests, errors).
```typescript
counter.inc(); // Increment by 1
counter.inc(5); // Increment by 5
counter.inc({ label: 'value' }); // With labels
```

### Gauge
Value that can go up or down (e.g., memory usage, active connections).
```typescript
gauge.set(100);
gauge.inc();
gauge.dec();
```

### Histogram
Observations in configurable buckets (e.g., request duration).
```typescript
const end = histogram.startTimer();
// ... do work
end(); // Records duration
```

### Summary
Similar to histogram but calculates quantiles on the client side.

## 🔗 Metrics + Traces Integration

With **exemplars** enabled in Grafana, you can:
1. View a metric spike in Prometheus
2. Click on an exemplar point
3. Jump directly to the corresponding trace in Tempo

This creates a seamless experience between metrics and traces!

## 🎯 Best Practices

1. **Use Labels Wisely**: Don't create too many unique label combinations (cardinality explosion)
2. **Histogram Buckets**: Choose buckets that make sense for your use case
3. **Naming Convention**: Use `_total` suffix for counters, `_seconds` for durations
4. **Don't Over-Instrument**: Only measure what you need
5. **Use Summaries Sparingly**: Histograms are usually better

## 🚀 Production Considerations

### Scrape Interval
Adjust in `prometheus.yml`:
```yaml
global:
  scrape_interval: 30s  # Reduce load in production
```

### Retention
Configure data retention:
```yaml
command:
  - '--storage.tsdb.retention.time=15d'
```

### High Availability
For production, consider:
- Multiple Prometheus instances
- Thanos or Cortex for long-term storage
- Federation for scaling

## 📚 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Prometheus Guide](https://grafana.com/docs/grafana/latest/datasources/prometheus/)
- [@willsoto/nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus)

---

**Your observability stack is now complete with Traces + Metrics! 🎉**
