# 🚀 Quick Start Guide

## Step 1: Start Observability Infrastructure

```bash
cd infra/docker
docker compose up -d
```

Wait ~10 seconds for services to be ready.

## Step 2: Start Backend (Terminal 1)

```bash
cd apps/api
npm run start:dev
```

You should see:
```
✅ OpenTelemetry initialized on backend
🚀 NestJS running on http://localhost:3001
```

## Step 3: Start Frontend (Terminal 2)

```bash
cd apps/web
npm run dev
```

You should see:
```
✅ OpenTelemetry initialized on frontend
▲ Next.js 15.x.x
- Local: http://localhost:3002
```

## Step 4: Test the Application

1. Open http://localhost:3002
2. Click **"🚀 Simple API Call"**
3. Click **"🐌 Slow Operation (3s)"**

## Step 5: View Traces in Grafana

1. Open http://localhost:3000 (Grafana)
2. Click **Explore** (compass icon on left sidebar)
3. Select **Tempo** from the dropdown
4. Click **"Search"** button
5. You'll see a list of recent traces
6. Click on any trace to see the full distributed trace

### What you'll see in the trace:
- **Frontend span**: Browser fetch request
- **Backend span**: NestJS HTTP handler
- **Service span**: AppService method
- **Custom spans**: Manual instrumentation (for slow/nested operations)

## 🎯 Understanding the Trace

A complete trace shows:
```
Browser (Next.js)
  └─ HTTP Request
      └─ NestJS Controller
          └─ AppService
              └─ Slow Operation (manual span)
```

Each span shows:
- Duration
- Attributes (custom metadata)
- Status (OK/ERROR)
- Timestamps

## 🔍 Troubleshooting

### No traces appearing?

1. **Check Tempo is running:**
   ```bash
   docker ps
   ```
   You should see `grafana/tempo` and `grafana/grafana`

2. **Check backend logs:**
   Look for `✅ OpenTelemetry initialized on backend`

3. **Check frontend console:**
   Open browser DevTools, look for `✅ OpenTelemetry initialized on frontend`

4. **Test OTLP endpoint:**
   ```bash
   curl http://localhost:4318/v1/traces
   ```

### CORS errors?

Make sure both apps are running and the backend is on port 3001.

### Port conflicts?

- Grafana: 3000
- NestJS: 3001
- Next.js: 3002
- Tempo: 3200
- OTLP: 4318

## 📊 Next Steps

- Explore the code in `apps/web/lib/otel.ts` (frontend)
- Check `apps/api/src/otel.ts` (backend)
- See manual span creation in `apps/api/src/app.service.ts`
- Read the main README.md for detailed documentation

---

**Happy tracing! 🔭**
