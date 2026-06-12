// ============================================================
// GET /api/cron/crawl — Scheduled crawler execution
// ============================================================
// Secured with CRON_SECRET. Triggered by Vercel Cron or
// GitHub Actions every 6 hours.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { runAllCrawlers } from '@/lib/crawlers/registry';
import { invalidateCache } from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel Pro plan — 60s timeout

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting crawl cycle...');
    const startTime = Date.now();

    // Run all crawlers
    const results = await runAllCrawlers();

    // Invalidate relevant caches
    await invalidateCache('jobs:*');
    await invalidateCache('stats:*');
    await invalidateCache('trending:*');
    await invalidateCache('companies:*');

    const totalDuration = Date.now() - startTime;
    const totalJobs = results.reduce((sum, r) => sum + r.jobsFound, 0);
    const totalNew = results.reduce((sum, r) => sum + r.jobsNew, 0);

    console.log(`[Cron] Crawl complete: ${totalJobs} found, ${totalNew} new (${totalDuration}ms)`);

    return NextResponse.json({
      success: true,
      data: {
        results,
        summary: {
          totalSources: results.length,
          totalJobsFound: totalJobs,
          totalNewJobs: totalNew,
          totalDuration,
          completedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('[Cron] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Crawl failed',
      },
      { status: 500 }
    );
  }
}
