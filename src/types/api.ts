// ============================================================
// API request/response types
// ============================================================

import type { JobListing, JobType, RemoteStatus, MarketStats, TechnologyInfo, CandidateFit } from './job';

/** Pagination metadata */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** Standard API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  error?: string;
  cached?: boolean;
}

/** Job list filters */
export interface JobFilters {
  page?: number;
  limit?: number;
  sort?: 'score' | 'salary' | 'date' | 'company';
  order?: 'asc' | 'desc';
  q?: string;
  type?: JobType | JobType[];
  remote?: RemoteStatus | RemoteStatus[];
  country?: string | string[];
  stack?: string | string[];
  visa?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  source?: string;
  companyId?: string;
}

/** Stats API response */
export type StatsResponse = ApiResponse<MarketStats>;

/** Trending stacks response */
export interface TrendingStacksResponse {
  mostRequested: Array<{ name: string; category: string; count: number; percentage: number }>;
  fastestGrowing: Array<{ name: string; growth: number; previousCount: number; currentCount: number }>;
  highestSalary: Array<{ name: string; avgSalary: number; jobCount: number }>;
  stackRankings: TechnologyInfo[];
}

/** Company list item */
export interface CompanyListItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  industry: string | null;
  size: string;
  tier: number;
  hqCountry: string | null;
  jobCount: number;
}

/** Single job detail (extends listing) */
export interface JobDetail extends JobListing {
  relatedJobs: JobListing[];
  candidateFit?: CandidateFit;
}

/** Cron crawl result */
export interface CrawlResult {
  source: string;
  status: 'success' | 'error';
  jobsFound: number;
  jobsNew: number;
  jobsUpdated: number;
  duration: number;
  errors: string[];
}
