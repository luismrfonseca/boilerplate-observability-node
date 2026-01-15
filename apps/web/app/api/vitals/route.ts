import { NextResponse } from 'next/server';
import {
    webVitalsLCP,
    webVitalsCLS,
    webVitalsINP,
    webVitalsFCP,
    webVitalsTTFB
} from '../../../lib/metrics';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, value, path } = body;

        // Labels (clean path to avoid high cardinality)
        const labels = { path: path || '/' };

        switch (name) {
            case 'LCP':
                webVitalsLCP.observe(labels, value / 1000); // ms -> s
                break;
            case 'CLS':
                webVitalsCLS.observe(labels, value); // Score (no conversion)
                break;
            case 'INP':
                webVitalsINP.observe(labels, value / 1000); // ms -> s
                break;
            case 'FCP':
                webVitalsFCP.observe(labels, value / 1000); // ms -> s
                break;
            case 'TTFB':
                webVitalsTTFB.observe(labels, value / 1000); // ms -> s
                break;
            default:
                console.warn(`Unknown web vital: ${name}`);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error processing web vital:', err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
