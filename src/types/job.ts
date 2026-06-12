// ============================================================
// Core domain types for the Job Aggregation Platform
// ============================================================

export type JobType = 'INTERNSHIP' | 'NEW_GRAD' | 'FULL_TIME' | 'APPRENTICESHIP' | 'CONTRACT';
export type JobStatus = 'ACTIVE' | 'EXPIRED' | 'DUPLICATE' | 'REMOVED';
export type RemoteStatus = 'REMOTE' | 'HYBRID' | 'ONSITE' | 'UNKNOWN';
export type ExperienceLevel = 'INTERN' | 'ENTRY' | 'MID' | 'SENIOR' | 'STAFF' | 'UNKNOWN';
export type TechCategory = 'LANGUAGE' | 'FRAMEWORK' | 'CLOUD' | 'DATABASE' | 'INFRASTRUCTURE' | 'AI_ML' | 'TOOL' | 'OTHER';
export type CompanySize = 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE' | 'UNKNOWN';

export type JobSource =
  | 'GREENHOUSE'
  | 'LEVER'
  | 'ASHBY'
  | 'WORKDAY'
  | 'SMARTRECRUITERS'
  | 'YC_JOBS'
  | 'WELLFOUND'
  | 'REMOTEOK'
  | 'WEWORKREMOTELY'
  | 'MANUAL';

/** Raw job data before normalization — each crawler returns this */
export interface RawJob {
  externalId: string;
  title: string;
  description?: string;
  companyName: string;
  companySlug?: string;
  location?: string;
  applicationUrl: string;
  salary?: string;
  postedAt?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/** Normalized job data after processing */
export interface NormalizedJob {
  title: string;
  titleNormalized: string;
  description: string | null;
  companyName: string;
  companySlug: string;
  country: string | null;
  city: string | null;
  region: string | null;
  remote: RemoteStatus;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  techStack: string[];
  visaSponsorship: boolean | null;
  applicationUrl: string;
  source: JobSource;
  sourceId: string;
  postedAt: Date | null;
}

/** Full job with computed fields — returned by API */
export interface JobListing {
  id: string;
  title: string;
  description: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    size: CompanySize;
    tier: number;
  };
  country: string | null;
  city: string | null;
  region: string | null;
  remote: RemoteStatus;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  techStack: string[];
  visaSponsorship: boolean | null;
  applicationUrl: string;
  source: JobSource;
  score: number;
  postedAt: string | null;
  crawledAt: string;
}

/** Technology with scoring */
export interface TechnologyInfo {
  id: string;
  name: string;
  displayName: string;
  category: TechCategory;
  demandScore: number;
  salaryScore: number;
  difficulty: number;
  futureScore: number;
  mobilityScore: number;
}

/** Candidate profile for fit analysis */
export interface CandidateProfile {
  skills: string[];
  preferredJobTypes: JobType[];
  preferredLocations: string[];
  openToRemote: boolean;
  openToRelocation: boolean;
  experienceLevel: ExperienceLevel;
}

/** Candidate fit result */
export interface CandidateFit {
  matchScore: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  preparationTime: string; // e.g., "2-4 weeks"
  recommendation: string;
}

/** Stack ranking entry */
export interface StackRanking {
  name: string;
  category: TechCategory;
  demandScore: number;
  salaryScore: number;
  difficulty: number;
  futureScore: number;
  mobilityScore: number;
  overallScore: number;
}

/** Market analytics */
export interface MarketStats {
  totalJobs: number;
  totalCompanies: number;
  totalCountries: number;
  jobsByType: Record<JobType, number>;
  jobsByCountry: Record<string, number>;
  jobsByRemote: Record<RemoteStatus, number>;
  avgSalaryByRegion: Record<string, number>;
  topTechnologies: Array<{ name: string; count: number; growth: number }>;
  topCompanies: Array<{ name: string; jobCount: number; avgScore: number }>;
}
