// ============================================================
// Crawler-specific types
// ============================================================

import type { RawJob, NormalizedJob, JobSource } from './job';

/** Abstract crawler interface — all crawlers must implement this */
export interface JobCrawler {
  /** Which ATS/source this crawler targets */
  readonly source: JobSource;
  /** Human-readable name */
  readonly name: string;
  /** Crawl all jobs from this source. Returns raw, un-normalized data. */
  crawl(): Promise<RawJob[]>;
  /** Normalize a single raw job into the unified schema */
  normalize(raw: RawJob): NormalizedJob;
}

/** Company entry for a specific ATS — maps company name to its ATS slug */
export interface CompanyAtsEntry {
  name: string;
  slug: string;
  tier?: number; // 0-100 company reputation
  atsUrl?: string;
}

/** Crawl execution context — passed to crawlers for logging/config */
export interface CrawlContext {
  startedAt: Date;
  dryRun: boolean;
  maxJobsPerSource: number;
  rateLimitMs: number;
}

/** Result from a single crawler execution */
export interface CrawlerResult {
  source: JobSource;
  jobs: NormalizedJob[];
  errors: string[];
  duration: number;
}

/** Greenhouse API response shape */
export interface GreenhouseJob {
  id: number;
  title: string;
  content: string;
  updated_at: string;
  absolute_url: string;
  location: { name: string };
  departments: Array<{ name: string }>;
  metadata?: Array<{ name: string; value: string | string[] | null }>;
}

export interface GreenhouseResponse {
  jobs: GreenhouseJob[];
  meta: { total: number };
}

/** Lever API response shape */
export interface LeverJob {
  id: string;
  text: string;
  descriptionPlain: string;
  categories: {
    commitment: string;
    department: string;
    location: string;
    team: string;
    allLocations: string[];
  };
  hostedUrl: string;
  applyUrl: string;
  createdAt: number;
  lists: Array<{ text: string; content: string }>;
  additional: string;
  additionalPlain: string;
}

/** Ashby API response shape */
export interface AshbyJob {
  id: string;
  title: string;
  departmentName: string;
  teamName: string;
  locationName: string;
  employmentType: string;
  isRemote: boolean;
  publishedDate: string;
  applicationUrl: string;
  descriptionHtml: string;
  descriptionPlain: string;
  compensation?: {
    compensationTierSummary: string;
  };
}

export interface AshbyResponse {
  jobs: AshbyJob[];
}

/** RemoteOK API response shape */
export interface RemoteOKJob {
  id: string;
  epoch: string;
  date: string;
  company: string;
  company_logo: string;
  position: string;
  tags: string[];
  description: string;
  location: string;
  salary_min: number;
  salary_max: number;
  url: string;
  apply_url: string;
}
