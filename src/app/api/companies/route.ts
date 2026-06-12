// ============================================================
// GET /api/companies — Company directory
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCached, setCache } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30')));
    const search = searchParams.get('q');

    const cacheKey = `companies:${page}:${limit}:${search || ''}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, ...cached, cached: true });
    }

    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy: { tier: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { jobs: { where: { status: 'ACTIVE' } } },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    const data = companies.map((c:any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      logo: c.logo,
      website: c.website,
      industry: c.industry,
      size: c.size,
      tier: c.tier,
      hqCountry: c.hqCountry,
      jobCount: c._count.jobs,
    }));

    const totalPages = Math.ceil(total / limit);

    const response = {
      data,
      meta: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };

    await setCache(cacheKey, response, 300);

    return NextResponse.json({ success: true, ...response });
  } catch (error) {
    console.error('[API /companies] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}
