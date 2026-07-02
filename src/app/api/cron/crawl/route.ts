// ============================================================
// GET /api/cron/crawl — Scheduled crawler execution
// ============================================================
// Secured with CRON_SECRET. Triggered by Vercel Cron or
// GitHub Actions every 6 hours.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { runAllCrawlers } from '@/lib/crawlers/registry';
import { invalidateCache } from '@/lib/redis';
import { waitUntil } from '@vercel/functions'; // Handles background execution post-response

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max ceiling timeout

// Heavy lifting broken out into a background process wrapper
async function handleBackgroundCrawl() {
  try {
    console.log('[Cron] Background execution started...');
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

    console.log(`[Cron] Background crawl complete: ${totalJobs} found, ${totalNew} new (${totalDuration}ms)`);
  } catch (error) {
    console.error('[Cron Error] Background task failed:', error);
  }
}

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

    console.log('[Cron] Valid request received. Scheduling crawl cycle...');

    // Push execution to Vercel's background lifecycle runner
    waitUntil(handleBackgroundCrawl());

    // Instantly respond back to GitHub Actions to prevent 504 timeouts
    return NextResponse.json({
      success: true,
      message: 'Crawl cycle initiated successfully in the background.',
      triggeredAt: new Date().toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error('[Cron] Initial dispatch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to dispatch crawl cycle',
      },
      { status: 500 }
    );
  }
}