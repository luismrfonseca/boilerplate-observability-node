import { registry } from '../../../lib/metrics';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const metrics = await registry.metrics();
        return new NextResponse(metrics, {
            status: 200,
            headers: {
                'Content-Type': registry.contentType,
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
        });
    } catch (err) {
        return new NextResponse(null, { status: 500 });
    }
}
