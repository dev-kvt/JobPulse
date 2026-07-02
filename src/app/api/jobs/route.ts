// ============================================================
// GET /api/jobs — Paginated job listing with filters
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCached, setCache } from '@/lib/redis';


export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const sort = searchParams.get('sort') || 'score';
    const order = searchParams.get('order') || 'desc';
    const type = searchParams.get('type');
    const remote = searchParams.get('remote');
    const country = searchParams.get('country');
    const stack = searchParams.get('stack');
    const visa = searchParams.get('visa');
    const salaryMin = searchParams.get('salaryMin');
    const companyId = searchParams.get('companyId');

    // Check cache
    const cacheKey = `jobs:${page}:${limit}:${sort}:${order}:${type}:${remote}:${country}:${stack}:${visa}:${salaryMin}:${companyId}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      status: 'ACTIVE',
    };

    if (type) {
      const types = type.split(',');
      where.jobType = { in: types };
    }

    if (remote) {
      const remotes = remote.split(',');
      where.remote = { in: remotes };
    }

    if (country) {
      const countries = country.split(',');
      where.country = { in: countries };
    }

    if (stack) {
      const stacks = stack.split(',');
      where.techStack = { hasSome: stacks };
    }

    if (visa === 'true') {
      where.visaSponsorship = true;
    }

    if (salaryMin) {
      where.salaryMin = { gte: parseInt(salaryMin) };
    }

    if (companyId) {
      where.companyId = companyId;
    }

    // Build orderBy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: Record<string, any> = {};
    switch (sort) {
      case 'salary':
        orderBy.salaryMax = order === 'asc' ? 'asc' : 'desc';
        break;
      case 'date':
        orderBy.postedAt = order === 'asc' ? 'asc' : 'desc';
        break;
      case 'company':
        orderBy.company = { name: order === 'asc' ? 'asc' : 'desc' };
        break;
      default:
        orderBy.score = order === 'asc' ? 'asc' : 'desc';
    }

    // Execute queries
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy,
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
    };

    // Cache for 5 minutes
    await setCache(cacheKey, response, 300);

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /jobs] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
