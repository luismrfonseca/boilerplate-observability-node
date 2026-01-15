# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. No Traces Appearing in Grafana

#### Check 1: Verify Services are Running
```bash
# Check Docker containers
docker ps

# Should show:
# - docker-tempo-1
# - docker-grafana-1
```

#### Check 2: Verify OTLP Endpoint
```bash
# Test if Tempo is accepting traces
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -d '{}'

# Should return 200 or 400 (not connection refused)
```

#### Check 3: Check Application Logs
```bash
# Backend should show:
✅ OpenTelemetry initialized on backend
🚀 NestJS running on http://localhost:3001

# Frontend console should show:
✅ OpenTelemetry initialized on frontend
```

#### Check 4: Verify Sampling
If you're using low sampling rates (e.g., 10%), you might need to make multiple requests to see traces.

**Solution**: Temporarily set sampling to 100% for testing:
```typescript
// Frontend and Backend
sampler: new TraceIdRatioBasedSampler(1.0)
```

### 2. CORS Errors

**Error**: `Access to fetch at 'http://localhost:3001/api/hello' from origin 'http://localhost:3002' has been blocked by CORS policy`

**Solution**: Verify CORS is enabled in `apps/api/src/main.ts`:
```typescript
app.enableCors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});
```

### 3. TypeScript Errors

**Error**: `'Resource' only refers to a type, but is being used as a value here`

**Solution**: Use simplified configuration without Resource imports (already implemented in this boilerplate).

### 4. Port Conflicts

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**: Check which ports are in use:
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3002

# Kill process if needed
taskkill /PID <PID> /F
```

**Port Mapping**:
- 3000 → Grafana
- 3001 → NestJS Backend
- 3002 → Next.js Frontend
- 3200 → Tempo HTTP
- 4318 → OTLP HTTP Receiver

### 5. Grafana Can't Connect to Tempo

**Error**: Grafana shows "Error connecting to Tempo"

**Solution 1**: Check if both containers are on the same network:
```bash
docker network inspect docker_observability
```

**Solution 2**: Restart containers:
```bash
cd infra/docker
docker compose down
docker compose up -d
```

**Solution 3**: Check Tempo logs:
```bash
docker logs docker-tempo-1
```

### 6. Traces are Incomplete

**Issue**: Only seeing frontend or backend spans, not both

**Cause**: Trace propagation not working

**Solution**: Verify `propagateTraceHeaderCorsUrls` in frontend:
```typescript
new FetchInstrumentation({
  propagateTraceHeaderCorsUrls: /.*/,  // Allow all origins
})
```

### 7. High Memory Usage

**Issue**: Application using too much memory

**Cause**: Too many traces being collected

**Solutions**:
1. **Reduce sampling rate**:
   ```typescript
   sampler: new TraceIdRatioBasedSampler(0.05) // 5%
   ```

2. **Disable noisy instrumentations**:
   ```typescript
   getNodeAutoInstrumentations({
     '@opentelemetry/instrumentation-fs': { enabled: false },
     '@opentelemetry/instrumentation-dns': { enabled: false },
   })
   ```

### 8. Slow Application Performance

**Issue**: Application feels slower after adding OpenTelemetry

**Solutions**:
1. **Use BatchSpanProcessor** (already configured)
2. **Reduce sampling**
3. **Disable unnecessary instrumentations**
4. **Use async exporters**

### 9. Docker Compose Fails to Start

**Error**: `Error response from daemon: driver failed programming external connectivity`

**Solution**: 
```bash
# Restart Docker Desktop
# Or use different ports in docker-compose.yml
```

### 10. Frontend Not Sending Traces

**Issue**: Backend traces work, but no frontend traces

**Checks**:
1. **Browser Console**: Look for errors
2. **Network Tab**: Check if requests to `localhost:4318` are being made
3. **CORS**: Tempo needs to accept browser requests

**Solution**: Add CORS headers to Tempo (already configured in `tempo.yaml`)

### 11. Grafana Shows "No Data"

**Steps**:
1. Go to **Explore** → Select **Tempo**
2. Click **"Search"** (don't use TraceQL yet)
3. Set time range to "Last 15 minutes"
4. Click **"Run query"**

**If still no data**:
1. Make API requests from the frontend
2. Wait 10-30 seconds for traces to be indexed
3. Refresh the search

### 12. Can't See Span Attributes

**Issue**: Spans appear but no custom attributes

**Cause**: Attributes not being set correctly

**Solution**: Verify attribute setting:
```typescript
span.setAttribute('key', 'value');  // ✅ Correct
span.attributes.key = 'value';      // ❌ Wrong
```

### 13. Nested Spans Not Showing

**Issue**: Child spans not appearing under parent

**Cause**: Context not being propagated

**Solution**: Use context API:
```typescript
import { context, trace } from '@opentelemetry/api';

const parentSpan = tracer.startSpan('parent');
const ctx = trace.setSpan(context.active(), parentSpan);

context.with(ctx, () => {
  const childSpan = tracer.startSpan('child');
  // ... work
  childSpan.end();
});

parentSpan.end();
```

### 14. Module Not Found Errors

**Error**: `Cannot find module '@opentelemetry/...'`

**Solution**:
```bash
# Reinstall dependencies
cd apps/web
rm -rf node_modules package-lock.json
npm install

cd ../api
rm -rf node_modules package-lock.json
npm install
```

### 15. Tempo Storage Full

**Error**: Tempo stops accepting traces

**Solution**: Clear Tempo data:
```bash
cd infra/docker
docker compose down
docker volume rm docker_tempo-data
docker compose up -d
```

## Debug Mode

### Enable Verbose Logging

**Frontend** (`apps/web/lib/otel.ts`):
```typescript
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
```

**Backend** (`apps/api/src/otel.ts`):
```typescript
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
```

### Check Trace IDs

In browser console:
```javascript
// After making a request, check the trace ID
performance.getEntriesByType('resource').forEach(r => {
  console.log(r.name, r.responseStart - r.requestStart);
});
```

## Performance Optimization

### Production Configuration

**Frontend**:
```typescript
const provider = new WebTracerProvider({
  sampler: new TraceIdRatioBasedSampler(0.01), // 1%
});

// Batch configuration
provider.addSpanProcessor(
  new BatchSpanProcessor(exporter, {
    maxQueueSize: 100,
    maxExportBatchSize: 10,
    scheduledDelayMillis: 5000,
  })
);
```

**Backend**:
```typescript
sampler: new TraceIdRatioBasedSampler(0.05), // 5%
```

## Getting Help

1. **Check OpenTelemetry Docs**: https://opentelemetry.io/docs/
2. **Grafana Community**: https://community.grafana.com/
3. **GitHub Issues**: Check the OpenTelemetry repositories
4. **Stack Overflow**: Tag with `opentelemetry`

## Useful Commands

```bash
# View all Docker logs
docker compose logs -f

# View only Tempo logs
docker logs -f docker-tempo-1

# View only Grafana logs
docker logs -f docker-grafana-1

# Restart everything
docker compose restart

# Check container health
docker compose ps

# Remove all data and start fresh
docker compose down -v
docker compose up -d
```

---

**Still having issues? Check the logs and error messages carefully! 🔍**
