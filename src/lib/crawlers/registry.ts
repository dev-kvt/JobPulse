// ============================================================
// Crawler Registry
// ============================================================
// Central registry managing all crawler instances.
// Handles parallel execution, aggregation, and database persistence.
// ============================================================

import type { JobCrawler } from '@/types/crawler';
import type { NormalizedJob, JobSource } from '@/types/job';
import { GreenhouseCrawler } from './greenhouse';
import { LeverCrawler } from './lever';
import { AshbyCrawler } from './ashby';
import { WorkdayCrawler } from './workday';
import { SmartRecruitersCrawler } from './smartrecruiters';
import { YCJobsCrawler } from './yc-jobs';
import { WellfoundCrawler } from './wellfound';
import { RemoteOKCrawler } from './remoteok';
import { WeWorkRemotelyCrawler } from './weworkremotely';
import { deduplicateJobs } from './deduplicator';
import { calculateJobScore } from '@/lib/ranking/score';
import { prisma } from '@/lib/prisma';
import type { CrawlResult } from '@/types/api';

/** All registered crawlers */
const CRAWLERS: JobCrawler[] = [
  new GreenhouseCrawler(),
  new LeverCrawler(),
  new AshbyCrawler(),
  new WorkdayCrawler(),
  new SmartRecruitersCrawler(),
  new YCJobsCrawler(),
  new WellfoundCrawler(),
  new RemoteOKCrawler(),
  new WeWorkRemotelyCrawler(),
];

/**
 * Get all registered crawlers.
 */
export function getAllCrawlers(): JobCrawler[] {
  return CRAWLERS;
}

/**
 * Get a specific crawler by source.
 */
export function getCrawler(source: JobSource): JobCrawler | undefined {
  return CRAWLERS.find((c) => c.source === source);
}

/**
 * Run a single crawler and persist results.
 */
export async function runCrawler(source: JobSource): Promise<CrawlResult> {
  const crawler = getCrawler(source);
  if (!crawler) {
    return {
      source,
      status: 'error',
      jobsFound: 0,
      jobsNew: 0,
      jobsUpdated: 0,
      duration: 0,
      errors: [`Crawler not found: ${source}`],
    };
  }

  const startTime = Date.now();
  const errors: string[] = [];

  try {
    // Create crawl log entry
    const crawlLog = await prisma.crawlLog.create({
      data: { source, status: 'RUNNING' },
    });

    // 1. Crawl raw jobs
    const rawJobs = await crawler.crawl();

    // 2. Normalize all jobs
    const normalizedJobs = rawJobs.map((raw) => {
      try {
        return crawler.normalize(raw);
      } catch (error) {
        errors.push(`Normalize error: ${error}`);
        return null;
      }
    }).filter((j): j is NormalizedJob => j !== null);

    // 3. Deduplicate
    const uniqueJobs = deduplicateJobs(normalizedJobs);

    // 4. Persist to database
    let jobsNew = 0;
    let jobsUpdated = 0;

    for (const job of uniqueJobs) {
      try {
        // Upsert company
        const company = await prisma.company.upsert({
          where: { slug: job.companySlug },
          update: { updatedAt: new Date() },
          create: {
            name: job.companyName,
            slug: job.companySlug,
            atsPlatform: source,
            atsSlug: job.companySlug,
            hqCountry: job.country,
            hqCity: job.city,
          },
        });

        // Calculate score
        const score = calculateJobScore({
          postedAt: job.postedAt,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          visaSponsorship: job.visaSponsorship,
          remote: job.remote,
          companyTier: company.tier,
          techStack: job.techStack,
        }).total;

        // Upsert job
        const result = await prisma.job.upsert({
          where: {
            source_sourceId: {
              source: job.source,
              sourceId: job.sourceId,
            },
          },
          update: {
            title: job.title,
            titleNormalized: job.titleNormalized,
            description: job.description,
            country: job.country,
            city: job.city,
            region: job.region,
            remote: job.remote,
            jobType: job.jobType,
            experienceLevel: job.experienceLevel,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryCurrency: job.salaryCurrency,
            techStack: job.techStack,
            visaSponsorship: job.visaSponsorship,
            score,
            status: 'ACTIVE',
          },
          create: {
            title: job.title,
            titleNormalized: job.titleNormalized,
            description: job.description,
            companyId: company.id,
            country: job.country,
            city: job.city,
            region: job.region,
            remote: job.remote,
            jobType: job.jobType,
            experienceLevel: job.experienceLevel,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryCurrency: job.salaryCurrency,
            techStack: job.techStack,
            visaSponsorship: job.visaSponsorship,
            applicationUrl: job.applicationUrl,
            source: job.source,
            sourceId: job.sourceId,
            score,
            postedAt: job.postedAt,
            status: 'ACTIVE',
          },
        });

        // Check if this was an insert or update
        if (result.crawledAt.getTime() > startTime - 1000) {
          jobsNew++;
        } else {
          jobsUpdated++;
        }
      } catch (error) {
        // Skip duplicates that hit the unique constraint
        if (error instanceof Error && error.message.includes('Unique constraint')) {
          jobsUpdated++;
        } else {
          errors.push(`DB error for ${job.title}: ${error}`);
        }
      }
    }

    const duration = Date.now() - startTime;

    // Update crawl log
    await prisma.crawlLog.update({
      where: { id: crawlLog.id },
      data: {
        status: errors.length > 0 ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED',
        jobsFound: uniqueJobs.length,
        jobsNew,
        jobsUpdated,
        errors,
        duration,
        finishedAt: new Date(),
      },
    });

    return {
      source,
      status: 'success',
      jobsFound: uniqueJobs.length,
      jobsNew,
      jobsUpdated,
      duration,
      errors,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(errorMsg);

    return {
      source,
      status: 'error',
      jobsFound: 0,
      jobsNew: 0,
      jobsUpdated: 0,
      duration,
      errors,
    };
  }
}

/**
 * Run all crawlers sequentially.
 * Sequential to avoid overwhelming ATS rate limits on Vercel's serverless functions.
 */
export async function runAllCrawlers(): Promise<CrawlResult[]> {
  const results: CrawlResult[] = [];

  for (const crawler of CRAWLERS) {
    console.log(`[Registry] Starting ${crawler.name}...`);
    const result = await runCrawler(crawler.source);
    results.push(result);
    console.log(`[Registry] ${crawler.name}: ${result.jobsFound} found, ${result.jobsNew} new (${result.duration}ms)`);
  }

  return results;
}
