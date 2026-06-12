// ============================================================
// RemoteOK Crawler
// ============================================================
// Public API: GET https://remoteok.com/api
// Returns JSON array of remote job listings.
// ============================================================

import { BaseCrawler } from './base';
import { normalizeJobData } from './normalizer';
import type { RawJob, NormalizedJob, JobSource } from '@/types/job';
import type { CompanyAtsEntry, RemoteOKJob } from '@/types/crawler';

export class RemoteOKCrawler extends BaseCrawler {
  readonly source: JobSource = 'REMOTEOK';
  readonly name = 'RemoteOK';

  // RemoteOK is a single-source crawler — no company list needed
  protected companies: CompanyAtsEntry[] = [{ name: 'RemoteOK', slug: 'remoteok', tier: 50 }];

  protected async crawlCompany(): Promise<RawJob[]> {
    const url = 'https://remoteok.com/api';

    try {
      const data = await this.fetchJson<RemoteOKJob[]>(url);

      if (!Array.isArray(data)) {
        return [];
      }

      // First element is metadata — skip it
      const jobs = data.filter((item) => item.id && item.position);

      return jobs.map((job) => ({
        externalId: String(job.id),
        title: job.position,
        description: job.description || '',
        companyName: job.company || 'Unknown',
        companySlug: (job.company || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        location: job.location || 'Remote',
        applicationUrl: job.apply_url || job.url || `https://remoteok.com/l/${job.id}`,
        postedAt: job.date || new Date(parseInt(job.epoch) * 1000).toISOString(),
        salary: job.salary_min && job.salary_max ? `$${job.salary_min} - $${job.salary_max}` : undefined,
        tags: job.tags || [],
        metadata: {
          salary_min: job.salary_min,
          salary_max: job.salary_max,
        },
      }));
    } catch (error) {
      console.error(`[RemoteOK] Failed to crawl: ${error}`);
      return [];
    }
  }

  normalize(raw: RawJob): NormalizedJob {
    const normalized = normalizeJobData(raw, this.source);
    // All RemoteOK jobs are remote by definition
    normalized.remote = 'REMOTE';

    // Use explicit salary data from API if available
    if (raw.metadata?.salary_min) {
      normalized.salaryMin = raw.metadata.salary_min as number;
    }
    if (raw.metadata?.salary_max) {
      normalized.salaryMax = raw.metadata.salary_max as number;
    }

    return normalized;
  }
}
