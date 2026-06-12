// ============================================================
// Ashby Crawler
// ============================================================
// Public API: GET https://api.ashbyhq.com/posting-api/job-board/{slug}
// No authentication required.
// ============================================================

import { BaseCrawler } from './base';
import { normalizeJobData } from './normalizer';
import type { RawJob, NormalizedJob, JobSource } from '@/types/job';
import type { CompanyAtsEntry, AshbyResponse } from '@/types/crawler';

export class AshbyCrawler extends BaseCrawler {
  readonly source: JobSource = 'ASHBY';
  readonly name = 'Ashby';

  protected companies: CompanyAtsEntry[] = [
    { name: 'Ramp', slug: 'ramp', tier: 85 },
    { name: 'Linear', slug: 'linear', tier: 82 },
    { name: 'Livekit', slug: 'livekit', tier: 72 },
    { name: 'Raycast', slug: 'raycast', tier: 72 },
    { name: 'Perplexity', slug: 'perplexityai', tier: 80 },
    { name: 'Cursor', slug: 'cursor', tier: 78 },
    { name: 'ElevenLabs', slug: 'elevenlabs', tier: 78 },
    { name: 'Warp', slug: 'warp', tier: 72 },
    { name: 'Replit', slug: 'replit', tier: 75 },
    { name: 'Coder', slug: 'coder', tier: 70 },
    { name: 'Pieces', slug: 'pieces', tier: 65 },
    { name: 'Airplane', slug: 'airplane', tier: 68 },
  ];

  protected async crawlCompany(company: CompanyAtsEntry): Promise<RawJob[]> {
    const url = `https://api.ashbyhq.com/posting-api/job-board/${company.slug}?includeCompensation=true`;

    try {
      const data = await this.fetchJson<AshbyResponse>(url);

      if (!data.jobs || !Array.isArray(data.jobs)) {
        return [];
      }

      return data.jobs.map((job) => ({
        externalId: job.id,
        title: job.title,
        description: job.descriptionPlain || job.descriptionHtml || '',
        companyName: company.name,
        companySlug: company.slug,
        location: job.locationName || '',
        applicationUrl: job.applicationUrl || `https://jobs.ashbyhq.com/${company.slug}/${job.id}`,
        postedAt: job.publishedDate,
        salary: job.compensation?.compensationTierSummary,
        tags: [job.departmentName, job.teamName, job.employmentType].filter(Boolean),
        metadata: {
          tier: company.tier,
          isRemote: job.isRemote,
        },
      }));
    } catch (error) {
      console.error(`[Ashby] Failed to crawl ${company.name}: ${error}`);
      return [];
    }
  }

  normalize(raw: RawJob): NormalizedJob {
    const normalized = normalizeJobData(raw, this.source);
    // Ashby provides explicit remote flag
    if (raw.metadata?.isRemote === true && normalized.remote === 'UNKNOWN') {
      normalized.remote = 'REMOTE';
    }
    return normalized;
  }
}
