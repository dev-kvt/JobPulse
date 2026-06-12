// ============================================================
// SmartRecruiters Crawler
// ============================================================
// Public API: GET https://api.smartrecruiters.com/v1/companies/{id}/postings
// No authentication required for public postings.
// ============================================================

import { BaseCrawler } from './base';
import { normalizeJobData } from './normalizer';
import type { RawJob, NormalizedJob, JobSource } from '@/types/job';
import type { CompanyAtsEntry } from '@/types/crawler';

interface SmartRecruitersJob {
  id: string;
  name: string;
  department: { label: string };
  location: { city: string; region: string; country: string; remote: boolean };
  typeOfEmployment: { label: string };
  experienceLevel: { label: string };
  releasedDate: string;
  ref: string;
  company: { name: string; identifier: string };
}

interface SmartRecruitersResponse {
  content: SmartRecruitersJob[];
  totalFound: number;
}

export class SmartRecruitersCrawler extends BaseCrawler {
  readonly source: JobSource = 'SMARTRECRUITERS';
  readonly name = 'SmartRecruiters';

  protected companies: CompanyAtsEntry[] = [
    { name: 'Bosch', slug: 'bosch', tier: 80 },
    { name: 'Visa', slug: 'visa', tier: 88 },
    { name: 'Samsara', slug: 'samsara', tier: 78 },
    { name: 'IKEA', slug: 'ikea', tier: 75 },
    { name: 'Spotify', slug: 'spotify', tier: 88 },
  ];

  protected async crawlCompany(company: CompanyAtsEntry): Promise<RawJob[]> {
    const url = `https://api.smartrecruiters.com/v1/companies/${company.slug}/postings?limit=100`;

    try {
      const data = await this.fetchJson<SmartRecruitersResponse>(url);

      if (!data.content || !Array.isArray(data.content)) {
        return [];
      }

      return data.content.map((job) => ({
        externalId: job.id,
        title: job.name,
        description: '',
        companyName: company.name,
        companySlug: company.slug,
        location: [job.location?.city, job.location?.country].filter(Boolean).join(', '),
        applicationUrl: job.ref || `https://jobs.smartrecruiters.com/${company.slug}/${job.id}`,
        postedAt: job.releasedDate,
        tags: [job.department?.label, job.typeOfEmployment?.label].filter(Boolean),
        metadata: {
          tier: company.tier,
          isRemote: job.location?.remote,
          experienceLevel: job.experienceLevel?.label,
        },
      }));
    } catch (error) {
      console.error(`[SmartRecruiters] Failed to crawl ${company.name}: ${error}`);
      return [];
    }
  }

  normalize(raw: RawJob): NormalizedJob {
    const normalized = normalizeJobData(raw, this.source);
    if (raw.metadata?.isRemote === true && normalized.remote === 'UNKNOWN') {
      normalized.remote = 'REMOTE';
    }
    return normalized;
  }
}
