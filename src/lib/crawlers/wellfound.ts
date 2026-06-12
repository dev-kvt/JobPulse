// ============================================================
// Wellfound (formerly AngelList) Crawler
// ============================================================
// Uses Wellfound's public API/search endpoints.
// ============================================================

import { BaseCrawler } from './base';
import { normalizeJobData } from './normalizer';
import type { RawJob, NormalizedJob, JobSource } from '@/types/job';
import type { CompanyAtsEntry } from '@/types/crawler';

export class WellfoundCrawler extends BaseCrawler {
  readonly source: JobSource = 'WELLFOUND';
  readonly name = 'Wellfound';

  // Single source
  protected companies: CompanyAtsEntry[] = [{ name: 'Wellfound', slug: 'wellfound', tier: 50 }];

  protected async crawlCompany(): Promise<RawJob[]> {
    const roles = [
      'software-engineer',
      'backend-engineer',
      'infrastructure-engineer',
      'devops-engineer',
      'platform-engineer',
    ];

    const allJobs: RawJob[] = [];

    for (const role of roles) {
      try {
        // Wellfound uses GraphQL — we query their public search endpoint
        const url = `https://wellfound.com/role/r/${role}`;

        const response = await this.fetchWithRetry(url, {
          headers: {
            'Accept': 'text/html,application/json',
            'Referer': 'https://wellfound.com/',
          },
        });

        const html = await response.text();

        // Extract JSON data from Next.js __NEXT_DATA__ script tag
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (nextDataMatch) {
          try {
            const nextData = JSON.parse(nextDataMatch[1]);
            const jobListings = nextData?.props?.pageProps?.listings || [];

            for (const listing of jobListings) {
              allJobs.push({
                externalId: String(listing.id || listing.slug),
                title: listing.title || listing.jobTitle || role,
                description: listing.description || '',
                companyName: listing.startup?.name || listing.companyName || 'Startup',
                companySlug: listing.startup?.slug || 'startup',
                location: listing.locations?.join(', ') || listing.location || 'Remote',
                applicationUrl: listing.url || `https://wellfound.com/l/${listing.slug}`,
                postedAt: listing.postedAt || listing.createdAt,
                salary: listing.compensation ? `$${listing.compensation.min} - $${listing.compensation.max}` : undefined,
                tags: [role],
                metadata: {
                  isRemote: listing.remote,
                  salary_min: listing.compensation?.min,
                  salary_max: listing.compensation?.max,
                },
              });
            }
          } catch {
            console.warn(`[Wellfound] Could not parse __NEXT_DATA__ for ${role}`);
          }
        }
      } catch (error) {
        console.error(`[Wellfound] Failed to crawl role ${role}: ${error}`);
      }
    }

    console.log(`[Wellfound] Crawled ${allJobs.length} jobs`);
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
