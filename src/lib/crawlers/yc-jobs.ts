// ============================================================
// Y Combinator / Work at a Startup Crawler
// ============================================================
// Crawls the Algolia-powered search API behind workatastartup.com
// ============================================================

import { BaseCrawler } from './base';
import { normalizeJobData } from './normalizer';
import type { RawJob, NormalizedJob, JobSource } from '@/types/job';
import type { CompanyAtsEntry } from '@/types/crawler';

interface YCJob {
  id: number;
  title: string;
  description: string;
  company_name: string;
  company_slug: string;
  location: string;
  remote: boolean;
  salary_min?: number;
  salary_max?: number;
  equity_min?: number;
  equity_max?: number;
  url: string;
  created_at: string;
  experience?: string;
  role_type?: string;
}

export class YCJobsCrawler extends BaseCrawler {
  readonly source: JobSource = 'YC_JOBS';
  readonly name = 'YC Jobs';

  // Single source — we query the aggregate API
  protected companies: CompanyAtsEntry[] = [{ name: 'Y Combinator', slug: 'yc', tier: 75 }];

  protected async crawlCompany(): Promise<RawJob[]> {
    // The YC jobs site uses Algolia search — we'll use their public search endpoint
    // Alternatively, we can scrape their JSON API
    const categories = [
      'software-engineer',
      'backend-engineer',
      'full-stack-engineer',
      'infrastructure-engineer',
      'devops-engineer',
      'platform-engineer',
      'ai-engineer',
    ];

    const allJobs: RawJob[] = [];

    for (const category of categories) {
      try {
        const url = `https://www.workatastartup.com/api/companies/search?query=${category}&page=1&per_page=50`;

        const response = await this.fetchWithRetry(url, {
          headers: {
            'Accept': 'application/json',
            'Referer': 'https://www.workatastartup.com/',
          },
        });

        const text = await response.text();

        // Try to parse as JSON
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data.companies)) {
            for (const company of data.companies) {
              if (company.jobs && Array.isArray(company.jobs)) {
                for (const job of company.jobs) {
                  allJobs.push({
                    externalId: String(job.id || `${company.slug}-${job.title}`),
                    title: job.title,
                    description: job.description || '',
                    companyName: company.name || 'YC Startup',
                    companySlug: company.slug || 'yc-startup',
                    location: job.location || (job.remote ? 'Remote' : 'San Francisco, CA'),
                    applicationUrl: job.url || `https://www.workatastartup.com/companies/${company.slug}`,
                    postedAt: job.created_at,
                    salary: job.salary_min && job.salary_max ? `$${job.salary_min} - $${job.salary_max}` : undefined,
                    tags: [category],
                    metadata: {
                      isRemote: job.remote,
                      salary_min: job.salary_min,
                      salary_max: job.salary_max,
                    },
                  });
                }
              }
            }
          }
        } catch {
          // If JSON parsing fails, that's okay — the API format may have changed
          console.warn(`[YC Jobs] Could not parse response for ${category}`);
        }
      } catch (error) {
        console.error(`[YC Jobs] Failed to crawl category ${category}: ${error}`);
      }
    }

    console.log(`[YC Jobs] Crawled ${allJobs.length} jobs across ${categories.length} categories`);
    return allJobs;
  }

  normalize(raw: RawJob): NormalizedJob {
    const normalized = normalizeJobData(raw, this.source);
    if (raw.metadata?.isRemote === true) {
      normalized.remote = 'REMOTE';
    }
    if (raw.metadata?.salary_min) {
      normalized.salaryMin = raw.metadata.salary_min as number;
    }
    if (raw.metadata?.salary_max) {
      normalized.salaryMax = raw.metadata.salary_max as number;
    }
    return normalized;
  }
}
