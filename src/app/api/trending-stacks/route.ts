// ============================================================
// GET /api/trending-stacks — Technology demand trends
// ============================================================

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCached, setCache } from '@/lib/redis';
import { getStackRankings } from '@/lib/analysis/market';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cached = await getCached('trending:stacks');
    if (cached) {
      return NextResponse.json({ success: true, data: cached, cached: true });
    }

    // Get all active jobs and their tech stacks
    const jobs = await prisma.job.findMany({
      where: { status: 'ACTIVE' },
      select: {
        techStack: true,
        salaryMin: true,
        salaryMax: true,
        postedAt: true,
      },
    });

    // Count technology mentions
    const techCounts = new Map<string, number>();
    const techSalaries = new Map<string, number[]>();

    for (const job of jobs) {
      for (const tech of job.techStack) {
        techCounts.set(tech, (techCounts.get(tech) || 0) + 1);

        const salary = job.salaryMin || job.salaryMax;
        if (salary) {
          if (!techSalaries.has(tech)) techSalaries.set(tech, []);
          techSalaries.get(tech)!.push(salary);
        }
      }
    }

    // Sort by count
    const totalJobs = jobs.length || 1;
    const mostRequested = Array.from(techCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalJobs) * 100),
      }));

    // Calculate average salaries per tech
    const highestSalary = Array.from(techSalaries.entries())
      .map(([name, salaries]) => ({
        name,
        avgSalary: Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length),
        jobCount: salaries.length,
      }))
      .sort((a, b) => b.avgSalary - a.avgSalary)
      .slice(0, 15);

    // Stack rankings from market analysis
    const stackRankings = getStackRankings();

    const data = {
      mostRequested,
      fastestGrowing: mostRequested.slice(0, 10).map((item) => ({
        ...item,
        growth: Math.round(Math.random() * 30 + 5), // Placeholder — would be computed from historical data
      })),
      highestSalary,
      stackRankings: stackRankings.slice(0, 25),
    };

    await setCache('trending:stacks', data, 600);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API /trending-stacks] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending stacks' },
      { status: 500 }
    );
  }
}
