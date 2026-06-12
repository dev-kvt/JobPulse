// ============================================================
// WeWorkRemotely Crawler
// ============================================================
// Parses the WeWorkRemotely RSS/JSON feed for remote jobs.
// ============================================================

import { BaseCrawler } from './base';
import { normalizeJobData } from './normalizer';
import type { RawJob, NormalizedJob, JobSource } from '@/types/job';
import type { CompanyAtsEntry } from '@/types/crawler';
import { stripHtml } from '@/lib/utils';

interface WWRCategory {
  name: string;
  url: string;
}

const WWR_CATEGORIES: WWRCategory[] = [
  { name: 'Programming', url: 'https://weworkremotely.com/categories/remote-programming-jobs.json' },
  { name: 'DevOps & SysAdmin', url: 'https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.json' },
  { name: 'Back-End', url: 'https://weworkremotely.com/categories/remote-back-end-programming-jobs.json' },
  { name: 'Full-Stack', url: 'https://weworkremotely.com/categories/remote-full-stack-programming-jobs.json' },
];

interface WWRJob {
  id: number;
  title: string;
  company_name: string;
  company_logo_url?: string;
  url: string;
  category: string;
  description: string;
  published_at: string;
  region?: string;
}

interface WWRResponse {
  jobs: WWRJob[];
}

export class WeWorkRemotelyCrawler extends BaseCrawler {
  readonly source: JobSource = 'WEWORKREMOTELY';
  readonly name = 'WeWorkRemotely';

  protected companies: CompanyAtsEntry[] = [{ name: 'WeWorkRemotely', slug: 'weworkremotely', tier: 50 }];

  async crawl(): Promise<RawJob[]> {
    const allJobs: RawJob[] = [];

    for (const category of WWR_CATEGORIES) {
      try {
        const data = await this.fetchJson<WWRResponse>(category.url);

        if (!data.jobs || !Array.isArray(data.jobs)) continue;

        for (const job of data.jobs) {
          allJobs.push({
            externalId: String(job.id),
            title: job.title,
            description: job.description ? stripHtml(job.description) : '',
            companyName: job.company_name || 'Unknown',
            companySlug: (job.company_name || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            location: job.region || 'Remote',
            applicationUrl: job.url || `https://weworkremotely.com/remote-jobs/${job.id}`,
            postedAt: job.published_at,
            tags: [category.name],
          });
        }
      } catch (error) {
        console.error(`[WWR] Failed to crawl category ${category.name}: ${error}`);
      }
    }

    console.log(`[WeWorkRemotely] Crawled ${allJobs.length} jobs across ${WWR_CATEGORIES.length} categories`);
    return allJobs;
  }

  protected async crawlCompany(): Promise<RawJob[]> {
    // Not used — we override crawl() directly
    return [];
  }

  normalize(raw: RawJob): NormalizedJob {
    const normalized = normalizeJobData(raw, this.source);
    normalized.remote = 'REMOTE';
    return normalized;
  }
}
