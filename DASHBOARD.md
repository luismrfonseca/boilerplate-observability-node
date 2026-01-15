# 📊 Observability Overview Dashboard

This project includes a pre-configured Grafana dashboard that provides a real-time view of your application's health and performance.

## 🚀 Accessing the Dashboard

1. Open Grafana: [http://localhost:3000](http://localhost:3000)
2. Go to **Dashboards** (in the sidebar)
3. Click on **Observability Overview**

**Direct Link:** [http://localhost:3000/d/observability-overview](http://localhost:3000/d/observability-overview)

## 📉 Panels Explained

### 1. Service Status
**Type:** Stat
**Query:** `up{job=~"nestjs-backend|nestjs-worker"}`
- Shows **UP** (Green) if your services are scraping correctly.
- Shows **DOWN** (Red) if Prometheus cannot reach them.

### 2. Throughput (RPS)
**Type:** Time Series
**Query:** `sum(rate(api_requests_total[1m])) by (method, endpoint)`
- Shows the number of requests per second (RPS) for each endpoint.
- Useful for identifying traffic spikes.

### 3. Latency (p95)
**Type:** Time Series
**Query:** `histogram_quantile(0.95, sum(rate(api_request_duration_seconds_bucket[5m])) by (le, endpoint))`
- Shows the **95th percentile duration** of requests.
- "p95 = 2.5s" means 95% of requests are faster than 2.5s.
- This is a better metric than "Average" for performance monitoring.

### 4. Error Rate (5xx)
**Type:** Time Series
**Query:** `sum(rate(api_requests_total{status=~"5.."}[1m])) by (endpoint)`
- Shows the rate of failed requests (HTTP 500-599).
- Should ideally be 0. Use this to spot bugs or outages.

### 5. System Resources
**Type:** Time Series
- **CPU Usage:** `rate(process_cpu_seconds_total[1m])`
- **Memory Usage:** `process_resident_memory_bytes`
- Tracks the resource consumption of your NestJS services.

### 6. Application Logs
**Type:** Logs
**Query:** `{app=~"nestjs-backend|nestjs-worker"}`
- Live feed of logs from key services.
- **Trace Integration:** Logs with `trace_id` are automatically linked to Tempo traces.

## 🛠️ Configuration

The dashboard is defined as code (IaC) in `infra/docker/dashboards/main-dashboard.json`.
It is automatically provisioned by Grafana on startup using `infra/docker/grafana-dashboards.yaml`.

**To edit the dashboard:**
1. Make changes in the Grafana UI.
2. Click **Share** -> **Export** -> **View JSON**.
3. Copy the JSON and overwrite `main-dashboard.json`.
4. Restart Grafana to verify.

# 🖥️ Frontend Web Vitals Dashboard

A dedicated dashboard for listening to user experience metrics from the browser.

## 🚀 Accessing the Dashboard

1. Open Grafana: [http://localhost:3000](http://localhost:3000)
2. Go to **Dashboards** (in the sidebar)
3. Click on **Frontend Web Vitals**

**Direct Link:** [http://localhost:3000/d/frontend-web-vitals](http://localhost:3000/d/frontend-web-vitals)

## ⚡ Metrics Explained

### 1. LCP (Largest Contentful Paint)
- Measures **loading performance**.
- Target: **< 2.5s**.

### 2. CLS (Cumulative Layout Shift)
- Measures **visual stability**.
- Target: **< 0.1**.

### 3. INP (Interaction to Next Paint)
- Measures **interactivity**.
- Target: **< 200ms**.

### 4. TTFB (Time to First Byte)
- Measures **server response time**.
- Target: **< 0.8s**.

This data is collected from real users (RUM) using the `web-vitals` library and shipped to Prometheus via the Next.js API.

# ⚙️ Node.js Internals Dashboard

A dashboard for deep-diving into the runtime performance of your Node.js services.

## 🚀 Accessing the Dashboard

1. Open Grafana: [http://localhost:3000](http://localhost:3000)
2. Go to **Dashboards**
3. Click on **Node.js Internals**

**Direct Link:** [http://localhost:3000/d/nodejs-internals](http://localhost:3000/d/nodejs-internals)

## 🩺 Metrics Explained

### 1. Event Loop Lag
- **The #1 Silent Killer**: Measures how long the Node.js event loop is blocked.
- **High Lag (>100ms)**: Means your code is running CPU-intensive tasks synchronously, blocking all other requests.

### 2. Heap Memory Usage
- **Used vs Total**: Tracks memory consumption.
- **Leaks**: If "Used" memory grows constantly without dropping (GC), you have a memory leak.

### 3. Active Handles & Requests
- **Handles**: Open sockets, file descriptors, timers.
- **Requests**: Incoming HTTP requests or DNS queries.
- **Monitoring**: Sudden spikes here can indicate a "Request Smuggling" attack or a resource leak (e.g., forgetting to close sockets).

### 4. Garbage Collection (GC)
- **Time Spent**: How much time is spent cleaning up memory.
- **Spikes**: Frequent GC spikes mean you are creating too many short-lived objects (high allocations).
