# 📝 Grafana Loki Integration Guide

## Overview

Grafana Loki has been successfully integrated to provide **log aggregation** and complete the observability stack with the three pillars: **Traces**, **Metrics**, and **Logs**.

## 🎯 What Was Added

### 1. Infrastructure (Docker)
- **Loki** container running on port **3100**
- Filesystem storage for logs
- Configured for development with generous limits

### 2. Backend (NestJS)
- **Winston** logger with structured logging
- **winston-loki** transport for automatic log shipping
- **Trace ID correlation** - logs include trace_id for correlation
- **nest-winston** integration with NestJS

### 3. Grafana Integration
- Loki datasource auto-configured
- **Derived fields** to link logs → traces
- Click on a log entry to jump to the related trace!

## 📊 Log Structure

Each log entry includes:
```json
{
  "timestamp": "2026-01-15T13:00:00.000Z",
  "level": "info",
  "message": "Processing hello request",
  "context": "AppService",
  "trace_id": "a1b2c3d4e5f6g7h8i9j0",
  "span_id": "1234567890abcdef"
}
```

The `trace_id` field enables **correlation** between logs and traces!

## 🔍 Viewing Logs

### Option 1: Grafana Explore
1. Open http://localhost:3000
2. Go to **Explore**
3. Select **Loki** datasource
4. Use LogQL queries or browse recent logs
5. Click on a log entry
6. Click the **Tempo** button to jump to the related trace!

### Option 2: Direct Loki API
```bash
# Query recent logs
curl -G -s "http://localhost:3100/loki/api/v1/query_range" \
  --data-urlencode 'query={app="nestjs-backend"}' \
  | jq
```

## 📈 LogQL Queries

### Basic Queries

#### All logs from the app
```logql
{app="nestjs-backend"}
```

#### Filter by log level
```logql
{app="nestjs-backend"} |= "error"
```

#### Logs from specific context
```logql
{app="nestjs-backend"} | json | context="AppService"
```

#### Logs with specific trace_id
```logql
{app="nestjs-backend"} | json | trace_id="abc123"
```

### Advanced Queries

#### Count errors per minute
```logql
sum(rate({app="nestjs-backend"} |= "error" [1m]))
```

#### Slow operations (duration > 2s)
```logql
{app="nestjs-backend"} | json | duration > 2
```

#### Logs grouped by level
```logql
sum by (level) (count_over_time({app="nestjs-backend"}[5m]))
```

## 🔗 Logs ↔ Traces Correlation

The magic happens through the `trace_id` field:

1. **In Logs**: Winston automatically adds `trace_id` from OpenTelemetry context
2. **In Grafana**: Derived fields extract `trace_id` from logs
3. **Click to Navigate**: Click the Tempo button next to a log to see the full trace!

### How it works:

```typescript
// In logger.config.ts
const addTraceId = winston.format((info) => {
  const span = trace.getSpan(context.active());
  if (span) {
    const spanContext = span.spanContext();
    info.trace_id = spanContext.traceId;  // ← This enables correlation!
  }
  return info;
});
```

## 🎨 Log Levels

Winston supports multiple log levels:

```typescript
logger.error('Something went wrong', error.stack);
logger.warn('This might be a problem');
logger.log('Normal operation');
logger.debug('Detailed debugging info');
logger.verbose('Very detailed info');
```

## 🔧 Adding Logs to Your Code

### In Services

```typescript
import { Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class MyService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  myMethod() {
    this.logger.log('Processing request', 'MyService');
    
    try {
      // Your code
      this.logger.log('Operation successful', 'MyService');
    } catch (error) {
      this.logger.error('Operation failed', error.stack, 'MyService');
      throw error;
    }
  }
}
```

### In Controllers

```typescript
@Controller()
export class MyController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @Get()
  getData() {
    this.logger.log('GET request received', 'MyController');
    return { data: 'example' };
  }
}
```

## 📊 Loki Configuration

The configuration in `loki-config.yaml` includes:

- **Storage**: Filesystem (development) - can be changed to S3, GCS, etc.
- **Retention**: 168h (7 days)
- **Rate Limits**: Generous for development
- **Schema**: v13 with TSDB

### Production Considerations

For production, consider:
- **Object Storage**: S3, GCS, or Azure Blob
- **Retention Policies**: Based on compliance requirements
- **Compaction**: Enable for better query performance
- **Replication**: Multiple Loki instances for HA

## 🎯 Best Practices

### 1. Structured Logging
Always use structured logs with context:
```typescript
logger.log('User action', 'MyService', { userId: 123, action: 'login' });
```

### 2. Include Trace IDs
The integration does this automatically, but ensure OpenTelemetry context is active.

### 3. Appropriate Log Levels
- **error**: Actual errors that need attention
- **warn**: Potential issues
- **log/info**: Normal operations
- **debug**: Detailed debugging (disable in production)

### 4. Don't Log Sensitive Data
Never log:
- Passwords
- API keys
- Personal information (PII)
- Credit card numbers

### 5. Use Labels Wisely
Loki uses labels for indexing. Too many unique labels = high cardinality = poor performance.

Good labels:
- `app`
- `environment`
- `level`

Bad labels:
- `user_id` (too many unique values)
- `request_id` (use fields instead)

## 🔍 Debugging with Logs + Traces

### Scenario: Finding slow requests

1. **Query Loki** for slow operations:
   ```logql
   {app="nestjs-backend"} |= "Slow operation"
   ```

2. **Click on a log entry**

3. **Click the Tempo button** to see the full trace

4. **Analyze the trace** to see which span took the longest

This workflow combines the power of logs and traces!

## 📈 Monitoring Patterns

### Error Rate
```logql
sum(rate({app="nestjs-backend"} |= "error" [5m]))
```

### Request Volume
```logql
sum(rate({app="nestjs-backend"} |= "Processing" [1m]))
```

### Slow Operations
```logql
{app="nestjs-backend"} |= "Slow operation"
```

## 🚀 Advanced Features

### Multi-tenancy
Loki supports multi-tenancy with `X-Scope-OrgID` header.

### Alerting
Configure alerts in Grafana based on LogQL queries.

### Dashboards
Create dashboards combining:
- Logs (Loki)
- Metrics (Prometheus)
- Traces (Tempo)

## 📚 Resources

- [Grafana Loki Documentation](https://grafana.com/docs/loki/latest/)
- [LogQL Query Language](https://grafana.com/docs/loki/latest/logql/)
- [Winston Documentation](https://github.com/winstonjs/winston)
- [winston-loki](https://github.com/JaniAnttonen/winston-loki)

---

**Your observability stack is now complete! Traces + Metrics + Logs = Full Observability! 🎉**
