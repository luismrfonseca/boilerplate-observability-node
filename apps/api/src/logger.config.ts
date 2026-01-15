import * as winston from 'winston';
import LokiTransport from 'winston-loki';
import { trace, context } from '@opentelemetry/api';

const lokiTransport = new LokiTransport({
    host: 'http://localhost:3100',
    labels: { app: 'nestjs-backend' },
    json: true,
    format: winston.format.json(),
    replaceTimestamp: true,
    onConnectionError: (err) => console.error('Loki connection error:', err),
});

// Custom format to add trace_id
const addTraceId = winston.format((info) => {
    const span = trace.getSpan(context.active());
    if (span) {
        const spanContext = span.spanContext();
        info.trace_id = spanContext.traceId;
        info.span_id = spanContext.spanId;
    }
    return info;
});

export const winstonOptions: winston.LoggerOptions = {
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                addTraceId(),
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, trace_id, ...meta }) => {
                    const traceInfo = trace_id ? ` [trace_id=${trace_id}]` : '';
                    return `${timestamp} [${level}]${traceInfo}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''
                        }`;
                })
            ),
        }),
        lokiTransport,
    ],
};
