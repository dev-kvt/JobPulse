// ============================================================
// Market Analysis Engine
// ============================================================
// Provides pre-computed market data, stack rankings,
// and learning roadmap recommendations.
// ============================================================

import type { StackRanking, TechCategory } from '@/types/job';
import { getAllTechPatterns } from '@/lib/ranking/tech-detector';

/**
 * Get comprehensive stack rankings based on current market data.
 */
export function getStackRankings(): StackRanking[] {
  const patterns = getAllTechPatterns();

  return patterns.map((tech) => ({
    name: tech.displayName,
    category: tech.category as TechCategory,
    demandScore: tech.demandScore,
    salaryScore: tech.salaryScore,
    difficulty: tech.difficulty,
    futureScore: tech.futureScore,
    mobilityScore: tech.mobilityScore,
    overallScore: Math.round(
      (tech.demandScore * 0.25 +
        tech.salaryScore * 0.20 +
        tech.futureScore * 0.25 +
        tech.mobilityScore * 0.15 +
        (10 - tech.difficulty) * 0.15) // Inverse of difficulty (easier = better for entry)
    ),
  })).sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Get learning roadmap based on candidate profile.
 */
export function getLearningRoadmap(currentSkills: string[] = []) {
  return {
    threeMonth: {
      title: '0-3 Months: Foundation',
      goals: [
        'Master one backend language deeply (recommended: Go or Python)',
        'Build REST APIs with proper error handling and validation',
        'Learn SQL and PostgreSQL fundamentals',
        'Understand Git, Linux basics, and terminal proficiency',
        'Complete 50+ LeetCode problems (Easy + Medium)',
      ],
      projects: [
        'Build a URL shortener with Go/Python + PostgreSQL',
        'Create a CLI tool that solves a real problem',
        'Build a REST API with authentication and rate limiting',
      ],
      certifications: [
        'AWS Cloud Practitioner (if targeting cloud roles)',
      ],
    },
    sixMonth: {
      title: '3-6 Months: Infrastructure & Systems',
      goals: [
        'Containerize applications with Docker',
        'Deploy to AWS/GCP (use free tier)',
        'Set up CI/CD pipelines (GitHub Actions)',
        'Learn Redis for caching and session management',
        'Study system design fundamentals',
      ],
      projects: [
        'Deploy a microservices application with Docker Compose',
        'Build a real-time chat application with WebSockets',
        'Contribute to 2-3 open source projects',
        'Build a job board or similar data aggregation project',
      ],
      certifications: [
        'AWS Solutions Architect Associate',
      ],
    },
    twelveMonth: {
      title: '6-12 Months: Specialization',
      goals: [
        'Choose specialization: Backend at Scale, Platform/Infra, or AI Engineering',
        'Learn Kubernetes and Terraform for infrastructure track',
        'Study distributed systems patterns for backend track',
        'Learn LLM integration and RAG for AI track',
        'Complete 150+ LeetCode problems including Hard',
        'Practice system design interviews',
      ],
      projects: [
        'Build a distributed task queue from scratch',
        'Create a Kubernetes operator or Terraform provider',
        'Deploy a production application handling real traffic',
        'Build an AI-powered tool using LLMs and RAG',
      ],
      certifications: [
        'CKA (Certified Kubernetes Administrator) for infra track',
        'AWS Solutions Architect Professional',
      ],
      interview: [
        'Practice behavioral questions with STAR method',
        'Do mock system design interviews',
        'Maintain a technical blog documenting projects',
        'Network on LinkedIn — aim for 5+ referrals',
      ],
    },
  };
}

/**
 * Candidate path analysis — which stack gives the best outcomes.
 */
export function getCandidatePathAnalysis() {
  return {
    fastestToEmployment: {
      stack: 'Python + FastAPI + PostgreSQL + Docker',
      reason: 'Python has the broadest job market, lowest barrier to entry, and highest volume of intern/new-grad roles. FastAPI is modern and growing rapidly.',
      timeToFirstJob: '3-6 months',
      demandScore: 9,
    },
    bestLongTermCompensation: {
      stack: 'Go + Kubernetes + Terraform + Distributed Systems',
      reason: 'Go engineers specializing in infrastructure and distributed systems command premium salaries ($165K-200K+ in the US) due to talent scarcity.',
      timeToFirstJob: '6-9 months',
      salaryScore: 9,
    },
    highestInternationalMobility: {
      stack: 'Java + Spring Boot + AWS + Kubernetes',
      reason: 'Java/Spring is the global enterprise standard. Every country has massive demand, making it the easiest path for international relocation and visa sponsorship.',
      timeToFirstJob: '4-8 months',
      mobilityScore: 9,
    },
    bestForUndergraduates: {
      stack: 'Python + TypeScript + React + Node.js + PostgreSQL',
      reason: 'Full-stack proficiency maximizes internship opportunities. Most university recruiting pipelines favor candidates who can work across the stack.',
      timeToFirstJob: '2-4 months',
      accessibilityScore: 9,
    },
    highestGrowthCeiling: {
      stack: 'Rust + Go + Systems Programming + Distributed Systems',
      reason: 'Systems-level expertise with Rust/Go creates a differentiated career path. While harder to enter, it leads to Staff+ engineering roles and the highest compensation tiers.',
      timeToFirstJob: '8-12 months',
      ceilingScore: 10,
    },
  };
}

/**
 * Country analysis for software engineering jobs.
 */
export function getCountryAnalysis() {
  return [
    { country: 'United States', code: 'US', region: 'North America', avgSalary: 145000, jobVolume: 'Very High', visaDifficulty: 'Hard', topCities: ['San Francisco', 'New York', 'Seattle', 'Austin'], notes: 'Highest compensation globally. H-1B visa competitive but possible. Strong intern pipeline.' },
    { country: 'Canada', code: 'CA', region: 'North America', avgSalary: 95000, jobVolume: 'High', visaDifficulty: 'Medium', topCities: ['Toronto', 'Vancouver', 'Montreal'], notes: 'Express Entry makes immigration easier. Growing tech hub.' },
    { country: 'Germany', code: 'DE', region: 'Europe', avgSalary: 72000, jobVolume: 'High', visaDifficulty: 'Easy', topCities: ['Berlin', 'Munich', 'Hamburg'], notes: 'EU Blue Card with low salary threshold (€45K for tech). Strong startup scene in Berlin.' },
    { country: 'Netherlands', code: 'NL', region: 'Europe', avgSalary: 70000, jobVolume: 'Medium', visaDifficulty: 'Easy', topCities: ['Amsterdam', 'Eindhoven'], notes: '30% ruling tax benefit. Highly Skilled Migrant visa is streamlined.' },
    { country: 'United Kingdom', code: 'GB', region: 'Europe', avgSalary: 75000, jobVolume: 'High', visaDifficulty: 'Medium', topCities: ['London', 'Manchester', 'Edinburgh'], notes: 'Skilled Worker visa available. London is a major fintech hub.' },
    { country: 'Sweden', code: 'SE', region: 'Europe', avgSalary: 58000, jobVolume: 'Medium', visaDifficulty: 'Easy', topCities: ['Stockholm', 'Gothenburg'], notes: 'Home to Spotify, Klarna. Strong work-life balance.' },
    { country: 'Switzerland', code: 'CH', region: 'Europe', avgSalary: 110000, jobVolume: 'Medium', visaDifficulty: 'Hard', topCities: ['Zurich', 'Geneva'], notes: 'Highest European salaries. Google Zurich is major employer.' },
    { country: 'Ireland', code: 'IE', region: 'Europe', avgSalary: 68000, jobVolume: 'Medium', visaDifficulty: 'Medium', topCities: ['Dublin'], notes: 'EU HQ for many US tech companies (Google, Meta, Apple).' },
    { country: 'Singapore', code: 'SG', region: 'Asia', avgSalary: 65000, jobVolume: 'Medium', visaDifficulty: 'Medium', topCities: ['Singapore'], notes: 'Major Asian tech hub. Employment Pass available for skilled workers.' },
    { country: 'Japan', code: 'JP', region: 'Asia', avgSalary: 55000, jobVolume: 'Medium', visaDifficulty: 'Easy', topCities: ['Tokyo', 'Osaka'], notes: 'Engineering visa straightforward. Growing English-friendly tech scene.' },
    { country: 'Australia', code: 'AU', region: 'Oceania', avgSalary: 85000, jobVolume: 'High', visaDifficulty: 'Medium', topCities: ['Sydney', 'Melbourne'], notes: 'Software engineers on skilled occupation list. Post-study work visa available.' },
    { country: 'South Korea', code: 'KR', region: 'Asia', avgSalary: 50000, jobVolume: 'Medium', visaDifficulty: 'Medium', topCities: ['Seoul'], notes: 'Samsung, LG, Naver, Kakao. Korean language helps significantly.' },
  ];
}
