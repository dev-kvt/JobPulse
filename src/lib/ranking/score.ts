// ============================================================
// Job Ranking / Scoring Engine
// ============================================================
// Computes a composite score (0-100) for each job based on
// recency, compensation, visa, remote status, company tier,
// and candidate skill match.
// ============================================================

import type { NormalizedJob, CandidateFit, CandidateProfile } from '@/types/job';
import { calculateSkillMatch, getTechInfo } from './tech-detector';

interface ScoringInput {
  postedAt: Date | null;
  salaryMin: number | null;
  salaryMax: number | null;
  visaSponsorship: boolean | null;
  remote: string;
  companyTier: number;
  techStack: string[];
  candidateSkills?: string[];
}

interface ScoreBreakdown {
  total: number;
  recency: number;
  compensation: number;
  visa: number;
  remote: number;
  companyReputation: number;
  candidateMatch: number;
}

// Weights for each scoring factor (must sum to 1.0)
const WEIGHTS = {
  recency: 0.20,
  compensation: 0.25,
  visa: 0.15,
  remote: 0.10,
  companyReputation: 0.15,
  candidateMatch: 0.15,
};

/**
 * Calculate the composite score for a job.
 * Returns a value between 0-100.
 */
export function calculateJobScore(input: ScoringInput): ScoreBreakdown {
  const recency = scoreRecency(input.postedAt);
  const compensation = scoreCompensation(input.salaryMin, input.salaryMax);
  const visa = scoreVisa(input.visaSponsorship);
  const remote = scoreRemote(input.remote);
  const companyReputation = input.companyTier;
  const candidateMatch = input.candidateSkills
    ? calculateSkillMatch(input.candidateSkills, input.techStack)
    : 50;

  const total = Math.round(
    recency * WEIGHTS.recency +
    compensation * WEIGHTS.compensation +
    visa * WEIGHTS.visa +
    remote * WEIGHTS.remote +
    companyReputation * WEIGHTS.companyReputation +
    candidateMatch * WEIGHTS.candidateMatch
  );

  return {
    total: Math.min(100, Math.max(0, total)),
    recency,
    compensation,
    visa,
    remote,
    companyReputation,
    candidateMatch,
  };
}

/**
 * Score recency using exponential decay.
 * Fresh jobs get 100, jobs from 30+ days ago approach 0.
 */
function scoreRecency(postedAt: Date | null): number {
  if (!postedAt) return 40; // Unknown date gets moderate score
  const daysSincePosted = (Date.now() - new Date(postedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePosted < 0) return 100; // Future-dated (likely just posted)
  return Math.round(100 * Math.exp(-0.05 * daysSincePosted));
}

/**
 * Score compensation normalized against global median.
 * Uses the midpoint of salary range if both provided.
 */
function scoreCompensation(min: number | null, max: number | null): number {
  if (!min && !max) return 35; // Unknown salary

  const salary = min && max ? (min + max) / 2 : min || max || 0;

  // Normalize against median ranges for early-career roles
  // Intern: ~$40K-80K, New Grad: ~$70K-150K globally
  if (salary <= 0) return 35;
  if (salary < 30000) return 20;
  if (salary < 50000) return 35;
  if (salary < 75000) return 50;
  if (salary < 100000) return 65;
  if (salary < 130000) return 75;
  if (salary < 160000) return 85;
  if (salary < 200000) return 92;
  return 100;
}

/**
 * Score visa sponsorship availability.
 */
function scoreVisa(visa: boolean | null): number {
  if (visa === true) return 100;
  if (visa === null) return 30; // Unknown
  return 0; // Explicitly no visa
}

/**
 * Score remote work availability.
 */
function scoreRemote(remote: string): number {
  switch (remote) {
    case 'REMOTE': return 100;
    case 'HYBRID': return 60;
    case 'ONSITE': return 30;
    default: return 40;
  }
}

/**
 * Perform candidate fit analysis for a specific job.
 */
export function analyzeCandidateFit(
  jobTechStack: string[],
  candidateProfile: CandidateProfile
): CandidateFit {
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const tech of jobTechStack) {
    if (candidateProfile.skills.some((s) => s.toLowerCase() === tech.toLowerCase())) {
      matchedSkills.push(tech);
    } else {
      missingSkills.push(tech);
    }
  }

  const matchScore = jobTechStack.length > 0
    ? Math.round((matchedSkills.length / jobTechStack.length) * 100)
    : 50;

  // Estimate preparation time based on missing skills difficulty
  let totalDifficulty = 0;
  for (const skill of missingSkills) {
    const info = getTechInfo(skill);
    totalDifficulty += info?.difficulty ?? 5;
  }

  let preparationTime: string;
  if (totalDifficulty === 0) preparationTime = 'Ready to apply';
  else if (totalDifficulty <= 5) preparationTime = '1-2 weeks';
  else if (totalDifficulty <= 10) preparationTime = '2-4 weeks';
  else if (totalDifficulty <= 20) preparationTime = '1-2 months';
  else if (totalDifficulty <= 35) preparationTime = '2-4 months';
  else preparationTime = '4-6 months';

  let recommendation: string;
  if (matchScore >= 80) recommendation = 'Excellent fit — apply immediately';
  else if (matchScore >= 60) recommendation = 'Good fit — apply and highlight transferable skills';
  else if (matchScore >= 40) recommendation = 'Moderate fit — consider after filling skill gaps';
  else if (matchScore >= 20) recommendation = 'Stretch role — significant preparation needed';
  else recommendation = 'Low fit — focus on building foundational skills first';

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    preparationTime,
    recommendation,
  };
}

/**
 * Batch score multiple jobs. Used after crawling to update scores in DB.
 */
export function batchScoreJobs(
  jobs: Array<{ techStack: string[]; postedAt: Date | null; salaryMin: number | null; salaryMax: number | null; visaSponsorship: boolean | null; remote: string; companyTier: number }>
): number[] {
  return jobs.map((job) => calculateJobScore(job).total);
}
