import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';

const sdk = new NodeSDK({
    serviceName: 'nestjs-backend',
    sampler: new TraceIdRatioBasedSampler(0.2), // 20% sampling
    traceExporter: new OTLPTraceExporter({
        url: 'http://localhost:4318/v1/traces',
    }),
    instrumentations: [
        getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-fs': {
                enabled: false, // Reduce noise
            },
        }),
    ],
});

sdk.start();

console.log('✅ OpenTelemetry initialized on backend');

process.on('SIGTERM', () => {
    sdk
        .shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
});
