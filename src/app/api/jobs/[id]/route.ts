// ============================================================
// GET /api/jobs/[id] — Single job detail
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Fetch related jobs (same company or similar tech stack)
    const relatedJobs = await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        id: { not: job.id },
        OR: [
          { companyId: job.companyId },
          { techStack: { hasSome: job.techStack.slice(0, 3) } },
        ],
      },
      orderBy: { score: 'desc' },
      take: 6,
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
    });

    return NextResponse.json({
      success: true,
      data: {
        ...job,
        relatedJobs,
      },
    });
  } catch (error) {
    console.error('[API /jobs/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}
