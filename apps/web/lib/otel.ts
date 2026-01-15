'use client';

import { trace } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

let initialized = false;

export function initOtel() {
    if (initialized) return;
    initialized = true;

    try {
        const provider = new WebTracerProvider();

        const exporter = new OTLPTraceExporter({
            url: 'http://localhost:4318/v1/traces',
        });

        // Use SimpleSpanProcessor for development (BatchSpanProcessor for production)
        // Type definition mismatch: WebTracerProvider extends BasicTracerProvider which has addSpanProcessor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (provider as any).addSpanProcessor(new SimpleSpanProcessor(exporter));

        provider.register();

        registerInstrumentations({
            instrumentations: [
                new FetchInstrumentation({
                    propagateTraceHeaderCorsUrls: /.*/,
                    clearTimingResources: true,
                }),
            ],
        });

        console.log('✅ OpenTelemetry initialized on frontend');
    } catch (error) {
        console.error('❌ Failed to initialize OpenTelemetry:', error);
    }
}
