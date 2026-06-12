// ============================================================
// Deduplication Engine
// ============================================================
// Three-pass deduplication:
// 1. Exact URL match
// 2. Composite key (company + normalized title + city)
// 3. Fuzzy title match within same company
// ============================================================

import type { NormalizedJob } from '@/types/job';

/**
 * Levenshtein distance between two strings.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity ratio between two strings (0.0 to 1.0).
 */
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/**
 * Generate composite dedup key for a job.
 */
function compositeKey(job: NormalizedJob): string {
  return `${job.companySlug}::${job.titleNormalized}::${(job.city || 'remote').toLowerCase()}`;
}

/**
 * Deduplicate a list of normalized jobs.
 * Returns only unique jobs, preserving the first occurrence.
 */
export function deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const seenUrls = new Set<string>();
  const seenKeys = new Set<string>();
  const result: NormalizedJob[] = [];

  // Group by company for fuzzy matching
  const byCompany = new Map<string, NormalizedJob[]>();

  for (const job of jobs) {
    // Pass 1: Exact URL dedup
    const urlKey = job.applicationUrl.toLowerCase().replace(/[?#].*$/, '').replace(/\/+$/, '');
    if (seenUrls.has(urlKey)) continue;
    seenUrls.add(urlKey);

    // Pass 2: Composite key dedup
    const key = compositeKey(job);
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    // Collect for pass 3
    if (!byCompany.has(job.companySlug)) {
      byCompany.set(job.companySlug, []);
    }
    byCompany.get(job.companySlug)!.push(job);
  }

  // Pass 3: Fuzzy matching within each company
  const SIMILARITY_THRESHOLD = 0.85;

  for (const [, companyJobs] of byCompany) {
    const unique: NormalizedJob[] = [];

    for (const job of companyJobs) {
      let isDuplicate = false;

      for (const existing of unique) {
        // Only compare jobs in the same city/location
        if ((job.city || 'remote').toLowerCase() !== (existing.city || 'remote').toLowerCase()) {
          continue;
        }

        const sim = similarity(job.titleNormalized, existing.titleNormalized);
        if (sim >= SIMILARITY_THRESHOLD) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        unique.push(job);
      }
    }

    result.push(...unique);
  }

  return result;
}

/**
 * Check if a single job is a duplicate of any existing job.
 * Used for incremental dedup when adding individual jobs.
 */
export function isDuplicate(
  job: NormalizedJob,
  existing: { applicationUrl: string; titleNormalized: string; companySlug: string; city: string | null }[]
): boolean {
  const urlKey = job.applicationUrl.toLowerCase().replace(/[?#].*$/, '').replace(/\/+$/, '');

  for (const ex of existing) {
    // URL match
    const exUrlKey = ex.applicationUrl.toLowerCase().replace(/[?#].*$/, '').replace(/\/+$/, '');
    if (urlKey === exUrlKey) return true;

    // Composite key match
    if (
      job.companySlug === ex.companySlug &&
      job.titleNormalized === ex.titleNormalized &&
      (job.city || 'remote').toLowerCase() === (ex.city || 'remote').toLowerCase()
    ) {
      return true;
    }

    // Fuzzy match within same company
    if (
      job.companySlug === ex.companySlug &&
      (job.city || 'remote').toLowerCase() === (ex.city || 'remote').toLowerCase() &&
      similarity(job.titleNormalized, ex.titleNormalized) >= 0.85
    ) {
      return true;
    }
  }

  return false;
}
