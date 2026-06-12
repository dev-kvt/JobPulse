// ============================================================
// GET /api/stats — Aggregate statistics
// ============================================================

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCached, setCache } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check cache (stats change slowly — cache for 10 min)
    const cached = await getCached('stats:global');
    if (cached) {
      return NextResponse.json({ success: true, data: cached, cached: true });
    }

    const [
      totalJobs,
      totalCompanies,
      jobsByType,
      jobsByCountry,
      jobsByRemote,
      topCompanies,
      recentCrawls,
    ] = await Promise.all([
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.company.count(),
      prisma.job.groupBy({
        by: ['jobType'],
        where: { status: 'ACTIVE' },
        _count: true,
      }),
      prisma.job.groupBy({
        by: ['country'],
        where: { status: 'ACTIVE', country: { not: null } },
        _count: true,
        orderBy: { _count: { country: 'desc' } },
        take: 20,
      }),
      prisma.job.groupBy({
        by: ['remote'],
        where: { status: 'ACTIVE' },
        _count: true,
      }),
      prisma.job.groupBy({
        by: ['companyId'],
        where: { status: 'ACTIVE' },
        _count: true,
        orderBy: { _count: { companyId: 'desc' } },
        take: 10,
      }),
      prisma.crawlLog.findMany({
        orderBy: { startedAt: 'desc' },
        take: 10,
      }),
    ]);

    // Get company names for top companies
    const companyIds = topCompanies.map((c) => c.companyId);
    const companies = await prisma.company.findMany({
      where: { id: { in: companyIds } },
      select: { id: true, name: true },
    });
    const companyMap = new Map(companies.map((c) => [c.id, c.name]));

    // Count unique countries
    const uniqueCountries = await prisma.job.findMany({
      where: { status: 'ACTIVE', country: { not: null } },
      select: { country: true },
      distinct: ['country'],
    });

    const stats = {
      totalJobs,
      totalCompanies,
      totalCountries: uniqueCountries.length,
      jobsByType: Object.fromEntries(
        jobsByType.map((g) => [g.jobType, g._count])
      ),
      jobsByCountry: Object.fromEntries(
        jobsByCountry.map((g) => [g.country || 'Unknown', g._count])
      ),
      jobsByRemote: Object.fromEntries(
        jobsByRemote.map((g) => [g.remote, g._count])
      ),
      topCompanies: topCompanies.map((c) => ({
        name: companyMap.get(c.companyId) || 'Unknown',
        jobCount: c._count,
      })),
      recentCrawls: recentCrawls.map((c) => ({
        source: c.source,
        status: c.status,
        jobsFound: c.jobsFound,
        jobsNew: c.jobsNew,
        startedAt: c.startedAt,
        duration: c.duration,
      })),
    };

    await setCache('stats:global', stats, 600); // Cache for 10 minutes

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('[API /stats] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
