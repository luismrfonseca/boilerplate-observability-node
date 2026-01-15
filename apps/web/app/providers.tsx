'use client';

import { useEffect } from 'react';
import { initOtel } from '@/lib/otel';

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        initOtel();
    }, []);

    return <>{children}</>;
}
