// ============================================================
// Greenhouse Crawler
// ============================================================
// Public API: GET https://api.greenhouse.io/v1/boards/{slug}/jobs?content=true
// No authentication required.
// ============================================================

import { BaseCrawler } from './base';
import { normalizeJobData } from './normalizer';
import type { RawJob, NormalizedJob, JobSource } from '@/types/job';
import type { CompanyAtsEntry, GreenhouseResponse } from '@/types/crawler';

export class GreenhouseCrawler extends BaseCrawler {
  readonly source: JobSource = 'GREENHOUSE';
  readonly name = 'Greenhouse';

  protected companies: CompanyAtsEntry[] = [
    // Tier 1: Big Tech & Unicorns
    { name: 'Stripe', slug: 'stripe', tier: 95 },
    { name: 'Cloudflare', slug: 'cloudflare', tier: 90 },
    { name: 'Datadog', slug: 'datadog', tier: 88 },
    { name: 'Notion', slug: 'notion', tier: 85 },
    { name: 'Figma', slug: 'figma', tier: 85 },
    { name: 'Discord', slug: 'discord', tier: 85 },
    { name: 'Vercel', slug: 'vercel', tier: 82 },
    { name: 'HashiCorp', slug: 'hashicorp', tier: 85 },
    { name: 'Databricks', slug: 'databricks', tier: 90 },
    { name: 'Supabase', slug: 'supabase', tier: 78 },
    { name: 'GitLab', slug: 'gitlab', tier: 85 },
    { name: 'Grafana Labs', slug: 'grafanalabs', tier: 82 },
    { name: 'Confluent', slug: 'confluent', tier: 80 },
    { name: 'Elastic', slug: 'elastic', tier: 80 },
    { name: 'PlanetScale', slug: 'planetscale', tier: 78 },
    { name: 'Airtable', slug: 'airtable', tier: 78 },
    { name: 'Plaid', slug: 'plaid', tier: 82 },
    { name: 'Twilio', slug: 'twilio', tier: 80 },
    { name: 'Snyk', slug: 'snyk', tier: 78 },
    { name: 'Cockroach Labs', slug: 'cockroachlabs', tier: 78 },
    // Tier 2: Growth Stage
    { name: 'Fly.io', slug: 'flyio', tier: 72 },
    { name: 'Railway', slug: 'railway', tier: 68 },
    { name: 'Neon', slug: 'neondatabase', tier: 70 },
    { name: 'Turso', slug: 'turso', tier: 65 },
    { name: 'Resend', slug: 'resend', tier: 65 },
    { name: 'Cal.com', slug: 'calcom', tier: 65 },
  ];

  protected async crawlCompany(company: CompanyAtsEntry): Promise<RawJob[]> {
    const url = `https://api.greenhouse.io/v1/boards/${company.slug}/jobs?content=true`;

    try {
      const data = await this.fetchJson<GreenhouseResponse>(url);

      if (!data.jobs || !Array.isArray(data.jobs)) {
        return [];
      }

      return data.jobs.map((job) => ({
        externalId: String(job.id),
        title: job.title,
        description: job.content || '',
        companyName: company.name,
        companySlug: company.slug,
        location: job.location?.name || '',
        applicationUrl: job.absolute_url,
        postedAt: job.updated_at,
        tags: job.departments?.map((d) => d.name) || [],
        metadata: { tier: company.tier },
      }));
    } catch (error) {
      console.error(`[Greenhouse] Failed to crawl ${company.name}: ${error}`);
      return [];
    }
  }

  normalize(raw: RawJob): NormalizedJob {
    return normalizeJobData(raw, this.source);
  }
}
