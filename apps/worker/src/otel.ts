import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';

const sdk = new NodeSDK({
    serviceName: 'nestjs-worker',
    traceExporter: new OTLPTraceExporter({
        url: 'http://localhost:4318/v1/traces',
    }),
    sampler: new TraceIdRatioBasedSampler(1.0), // 100% sampling for worker to ensure we see traces in demo
    instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
console.log('✅ OpenTelemetry initialized for nestjs-worker');

process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
});
