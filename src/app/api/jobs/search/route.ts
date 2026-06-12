// ============================================================
// GET /api/jobs/search — Full-text search
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCached, setCache } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    if (!q) {
      return NextResponse.json(
        { success: false, error: 'Search query "q" is required' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `search:${q}:${page}:${limit}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    // Use PostgreSQL text search with ILIKE as fallback
    // For full-text search, we'd use ts_query but ILIKE works well for smaller datasets
    const searchTerms = q.split(/\s+/).filter(Boolean);
    const searchConditions = searchTerms.map((term) => ({
      OR: [
        { title: { contains: term, mode: 'insensitive' as const } },
        { description: { contains: term, mode: 'insensitive' as const } },
        { techStack: { has: term.toLowerCase() } },
        { company: { name: { contains: term, mode: 'insensitive' as const } } },
      ],
    }));

    const where = {
      status: 'ACTIVE' as const,
      AND: searchConditions,
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { score: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              size: true,
              tier: true,
            },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    // Log search for analytics
    try {
      await prisma.searchHistory.create({
        data: {
          query: q,
          filters: { page, limit },
          results: total,
        },
      });
    } catch {
      // Non-critical — don't fail the request
    }

    const totalPages = Math.ceil(total / limit);

    const response = {
      success: true,
      data: jobs,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      query: q,
    };

    await setCache(cacheKey, response, 180); // Cache for 3 minutes

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /jobs/search] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
