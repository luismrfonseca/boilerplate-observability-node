'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
    useReportWebVitals((metric) => {
        const body = JSON.stringify({
            name: metric.name,
            value: metric.value,
            path: window.location.pathname,
        });

        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/vitals', body);
        } else {
            fetch('/api/vitals', {
                body,
                method: 'POST',
                keepalive: true,
            });
        }
    });

    return null;
}
