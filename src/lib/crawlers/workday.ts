// ============================================================
// Workday Crawler
// ============================================================
// Workday uses company-specific subdomains and GraphQL-like APIs.
// We target specific large employers known to use Workday.
// ============================================================

import { BaseCrawler } from './base';
import { normalizeJobData } from './normalizer';
import type { RawJob, NormalizedJob, JobSource } from '@/types/job';
import type { CompanyAtsEntry } from '@/types/crawler';

interface WorkdayJobResult {
  title: string;
  locationsText: string;
  postedOn: string;
  bulletFields: string[];
  externalPath: string;
}

interface WorkdaySearchResponse {
  jobPostings: WorkdayJobResult[];
  total: number;
}

export class WorkdayCrawler extends BaseCrawler {
  readonly source: JobSource = 'WORKDAY';
  readonly name = 'Workday';

  protected companies: CompanyAtsEntry[] = [
    { name: 'Salesforce', slug: 'salesforce', tier: 90, atsUrl: 'https://salesforce.wd12.myworkdayjobs.com/en-US/External_Career_Site' },
    { name: 'Adobe', slug: 'adobe', tier: 90, atsUrl: 'https://adobe.wd5.myworkdayjobs.com/en-US/external_experienced' },
    { name: 'Visa', slug: 'visa', tier: 88, atsUrl: 'https://visa.wd12.myworkdayjobs.com/en-US/Visa_Careers' },
    { name: 'ServiceNow', slug: 'servicenow', tier: 85, atsUrl: 'https://servicenow.wd1.myworkdayjobs.com/en-US/servicenow_careers' },
    { name: 'VMware', slug: 'vmware', tier: 82, atsUrl: 'https://broadcom.wd1.myworkdayjobs.com/en-US/vmware_jobs' },
  ];

  protected async crawlCompany(company: CompanyAtsEntry): Promise<RawJob[]> {
    // Workday has a complex API that requires session management.
    // For reliability, we use their search endpoint with predefined queries.
    if (!company.atsUrl) return [];

    try {
      // Workday's search API endpoint
      const searchUrl = `${company.atsUrl}/search?q=software+engineer&startDate=7daysago`;

      const response = await this.fetchWithRetry(searchUrl, {
        headers: { 'Accept': 'application/json' },
      });

      const html = await response.text();

      // Parse job listings from the response
      // Workday returns HTML — extract job data using patterns
      const jobs: RawJob[] = [];
      const jobPattern = /"title":"([^"]+)".*?"locationsText":"([^"]*)".*?"postedOn":"([^"]*)".*?"externalPath":"([^"]*)"/g;
      let match;

      while ((match = jobPattern.exec(html)) !== null) {
        jobs.push({
          externalId: match[4],
          title: match[1],
          description: '',
          companyName: company.name,
          companySlug: company.slug,
          location: match[2],
          applicationUrl: `${company.atsUrl}${match[4]}`,
          postedAt: match[3],
          metadata: { tier: company.tier },
        });
      }

      return jobs;
    } catch (error) {
      console.error(`[Workday] Failed to crawl ${company.name}: ${error}`);
      return [];
    }
  }

  normalize(raw: RawJob): NormalizedJob {
    return normalizeJobData(raw, this.source);
  }
}
