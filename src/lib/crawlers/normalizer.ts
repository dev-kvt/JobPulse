// ============================================================
// Data Normalizer
// ============================================================
// Common normalization functions used by all crawlers to map
// raw ATS data into the unified NormalizedJob schema.
// ============================================================

import type { JobType, ExperienceLevel } from '@/types/job';
import { detectRemoteStatus, detectCountry, extractCity, getRegion, normalizeTitle, stripHtml } from '@/lib/utils';
import { detectTechStack } from '@/lib/ranking/tech-detector';

/**
 * Detect job type from title and description.
 */
export function detectJobType(title: string, description?: string): JobType {
  const text = `${title} ${description || ''}`.toLowerCase();

  if (/\bintern(?:ship)?\b/.test(text)) return 'INTERNSHIP';
  if (/\bnew\s*grad(?:uate)?\b|\bentry[\s-]*level\b|\bjunior\b|\bgraduate\s*(?:program|role|engineer)\b/.test(text)) return 'NEW_GRAD';
  if (/\bapprentice(?:ship)?\b/.test(text)) return 'APPRENTICESHIP';
  if (/\bcontract\b|\bfreelance\b/.test(text)) return 'CONTRACT';
  return 'FULL_TIME';
}

/**
 * Detect experience level from title and description.
 */
export function detectExperienceLevel(title: string, description?: string): ExperienceLevel {
  const text = `${title} ${description || ''}`.toLowerCase();

  if (/\bintern\b/.test(text)) return 'INTERN';
  if (/\bnew\s*grad|\bentry[\s-]*level|\bjunior\b|\bassociate\b|\b0[\s-]*(?:to|\-)[\s-]*[12]\s*years?\b/.test(text)) return 'ENTRY';
  if (/\bstaff\b|\bprincipal\b|\bdistinguished\b/.test(text)) return 'STAFF';
  if (/\bsenior\b|\bsr\.?\b|\blead\b/.test(text)) return 'SENIOR';
  if (/\b[3-5]\+?\s*years?\b|\bmid[\s-]*level\b/.test(text)) return 'MID';
  return 'UNKNOWN';
}

/**
 * Extract salary information from text.
 * Returns [min, max] or [null, null] if not found.
 */
export function extractSalary(text: string): { min: number | null; max: number | null; currency: string } {
  // Match patterns like: $100,000 - $150,000, $120K-180K, €50,000-€70,000
  const patterns = [
    // Range: $100,000 - $150,000
    /(?:[\$€£])\s*([\d,]+(?:\.\d+)?)\s*[kK]?\s*[-–—to]+\s*(?:[\$€£])?\s*([\d,]+(?:\.\d+)?)\s*[kK]?/,
    // Range with K: $100K - $150K
    /(?:[\$€£])\s*([\d]+)\s*[kK]\s*[-–—to]+\s*(?:[\$€£])?\s*([\d]+)\s*[kK]/,
    // Single: $150,000
    /(?:[\$€£])\s*([\d,]+(?:\.\d+)?)\s*(?:per\s*year|\/yr|annually|p\.a\.)/i,
  ];

  // Detect currency
  let currency = 'USD';
  if (/€/.test(text)) currency = 'EUR';
  else if (/£/.test(text)) currency = 'GBP';

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let min = parseFloat(match[1].replace(/,/g, ''));
      let max = match[2] ? parseFloat(match[2].replace(/,/g, '')) : null;

      // Handle K suffix
      if (/[kK]/.test(match[0])) {
        if (min < 1000) min *= 1000;
        if (max && max < 1000) max *= 1000;
      }

      return { min, max, currency };
    }
  }

  return { min: null, max: null, currency };
}

/**
 * Detect visa sponsorship from text.
 */
export function detectVisaSponsorship(text: string): boolean | null {
  const lower = text.toLowerCase();

  if (/\bvisa\s*(?:sponsor(?:ship|ed)?|support(?:ed)?)\b/i.test(lower)) return true;
  if (/\bwill\s*sponsor\b/i.test(lower)) return true;
  if (/\bsponsorship\s*(?:available|provided|offered)\b/i.test(lower)) return true;
  if (/\bno\s*visa\s*sponsor/i.test(lower)) return false;
  if (/\bnot\s*(?:able|willing)\s*to\s*sponsor/i.test(lower)) return false;
  if (/\bmust\s*be\s*(?:authorized|eligible)\b/i.test(lower)) return false;
  if (/\bwork\s*authorization\s*required\b/i.test(lower)) return false;

  return null; // Unknown
}

/**
 * Full normalization pipeline — used by concrete crawlers.
 */
export function normalizeJobData(
  raw: { title: string; description?: string; location?: string; companyName: string; companySlug?: string; applicationUrl: string; externalId: string; postedAt?: string; salary?: string },
  source: import('@/types/job').JobSource
): import('@/types/job').NormalizedJob {
  const description = raw.description ? stripHtml(raw.description) : null;
  const fullText = `${raw.title} ${description || ''} ${raw.location || ''}`;

  const country = raw.location ? detectCountry(raw.location) : null;
  const city = raw.location ? extractCity(raw.location) : null;
  const remoteFromLocation = raw.location ? detectRemoteStatus(raw.location) : 'UNKNOWN';
  const remoteFromTitle = detectRemoteStatus(raw.title);
  const remote = remoteFromTitle !== 'UNKNOWN' ? remoteFromTitle : remoteFromLocation;

  const salary = raw.salary
    ? extractSalary(raw.salary)
    : description
      ? extractSalary(description)
      : { min: null, max: null, currency: 'USD' };

  return {
    title: raw.title.trim(),
    titleNormalized: normalizeTitle(raw.title),
    description,
    companyName: raw.companyName.trim(),
    companySlug: raw.companySlug || raw.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    country,
    city,
    region: getRegion(country),
    remote,
    jobType: detectJobType(raw.title, description || undefined),
    experienceLevel: detectExperienceLevel(raw.title, description || undefined),
    salaryMin: salary.min,
    salaryMax: salary.max,
    salaryCurrency: salary.currency,
    techStack: detectTechStack(fullText),
    visaSponsorship: description ? detectVisaSponsorship(description) : null,
    applicationUrl: raw.applicationUrl,
    source,
    sourceId: raw.externalId,
    postedAt: raw.postedAt ? new Date(raw.postedAt) : null,
  };
}
