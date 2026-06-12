// ============================================================
// Lever Crawler
// ============================================================
// Public API: GET https://api.lever.co/v0/postings/{slug}?mode=json
// No authentication required.
// ============================================================

import { BaseCrawler } from './base';
import { normalizeJobData } from './normalizer';
import type { RawJob, NormalizedJob, JobSource } from '@/types/job';
import type { CompanyAtsEntry, LeverJob } from '@/types/crawler';

export class LeverCrawler extends BaseCrawler {
  readonly source: JobSource = 'LEVER';
  readonly name = 'Lever';

  protected companies: CompanyAtsEntry[] = [
    { name: 'Netflix', slug: 'netflix', tier: 95 },
    { name: 'Anthropic', slug: 'anthropic', tier: 92 },
    { name: 'Anduril', slug: 'anduril', tier: 85 },
    { name: 'Block', slug: 'block', tier: 88 },
    { name: 'Scale AI', slug: 'scaleai', tier: 85 },
    { name: 'Retool', slug: 'retool', tier: 78 },
    { name: 'Vanta', slug: 'vanta', tier: 75 },
    { name: 'Sourcegraph', slug: 'sourcegraph', tier: 78 },
    { name: 'PostHog', slug: 'posthog', tier: 72 },
    { name: 'Temporal', slug: 'temporal', tier: 75 },
    { name: 'Airbyte', slug: 'airbyte', tier: 72 },
    { name: 'Liveblocks', slug: 'liveblocks', tier: 68 },
    { name: 'Tinybird', slug: 'tinybird', tier: 68 },
    { name: 'Convex', slug: 'convex', tier: 68 },
    { name: 'Upstash', slug: 'upstash', tier: 65 },
  ];

  protected async crawlCompany(company: CompanyAtsEntry): Promise<RawJob[]> {
    const url = `https://api.lever.co/v0/postings/${company.slug}?mode=json`;

    try {
      const data = await this.fetchJson<LeverJob[]>(url);

      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((job) => ({
        externalId: job.id,
        title: job.text,
        description: job.descriptionPlain || job.additional || '',
        companyName: company.name,
        companySlug: company.slug,
        location: job.categories?.location || '',
        applicationUrl: job.hostedUrl,
        postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : undefined,
        tags: [job.categories?.department, job.categories?.team, job.categories?.commitment].filter(Boolean) as string[],
        metadata: { tier: company.tier },
      }));
    } catch (error) {
      console.error(`[Lever] Failed to crawl ${company.name}: ${error}`);
      return [];
    }
  }

  normalize(raw: RawJob): NormalizedJob {
    return normalizeJobData(raw, this.source);
  }
}
