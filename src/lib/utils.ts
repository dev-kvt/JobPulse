import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with conflict resolution */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Slugify a string for URL-safe identifiers */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Normalize a job title for deduplication — lowercase, remove extra spaces, trim common suffixes */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*[-–—]\s*(remote|hybrid|onsite|on-site|full[- ]?time|part[- ]?time|contract)$/i, '')
    .replace(/\s*\([^)]*\)\s*$/, '') // Remove trailing parentheticals
    .trim();
}

/** Format salary for display */
export function formatSalary(min?: number | null, max?: number | null, currency: string = 'USD'): string {
  if (!min && !max) return 'Not disclosed';
  const fmt = (n: number) => {
    if (n >= 1000) return `${Math.round(n / 1000)}K`;
    return n.toString();
  };
  const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
  if (min && max) return `${sym}${fmt(min)} - ${sym}${fmt(max)}`;
  if (min) return `${sym}${fmt(min)}+`;
  if (max) return `Up to ${sym}${fmt(max)}`;
  return 'Not disclosed';
}

/** Format a date as relative time (e.g., "2 days ago") */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

/** Parse search params into typed filters */
export function parseArrayParam(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

/** Delay execution (for rate limiting) */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Strip HTML tags from a string */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Truncate text to a maximum length */
export function truncate(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/** Map country codes to full names */
export const COUNTRY_MAP: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  UK: 'United Kingdom',
  DE: 'Germany',
  NL: 'Netherlands',
  SE: 'Sweden',
  DK: 'Denmark',
  NO: 'Norway',
  FI: 'Finland',
  CH: 'Switzerland',
  AT: 'Austria',
  IE: 'Ireland',
  FR: 'France',
  PL: 'Poland',
  CZ: 'Czech Republic',
  JP: 'Japan',
  SG: 'Singapore',
  KR: 'South Korea',
  CN: 'China',
  TW: 'Taiwan',
  HK: 'Hong Kong',
  AU: 'Australia',
  NZ: 'New Zealand',
};

/** Map country to region */
export function getRegion(country: string | null): string | null {
  if (!country) return null;
  const c = country.toUpperCase();
  if (['US', 'CA'].includes(c) || country.toLowerCase().includes('united states') || country.toLowerCase().includes('canada')) return 'North America';
  if (['GB', 'UK', 'DE', 'NL', 'SE', 'DK', 'NO', 'FI', 'CH', 'AT', 'IE', 'FR', 'PL', 'CZ'].includes(c)) return 'Europe';
  if (['JP', 'SG', 'KR', 'CN', 'TW', 'HK'].includes(c)) return 'Asia';
  if (['AU', 'NZ'].includes(c)) return 'Oceania';
  // Try by name
  if (/europe|german|dutch|french|swedish|danish|norw|finn|swiss|austri|irish|brit|polish|czech/i.test(country)) return 'Europe';
  if (/japan|singap|korea|chin|taiwan|hong kong/i.test(country)) return 'Asia';
  if (/austral|zealand/i.test(country)) return 'Oceania';
  if (/united states|america|canada/i.test(country)) return 'North America';
  return 'Other';
}

/** Detect country from location string */
export function detectCountry(location: string): string | null {
  const loc = location.toLowerCase();
  // Direct country matches
  for (const [code, name] of Object.entries(COUNTRY_MAP)) {
    if (loc.includes(name.toLowerCase()) || loc.includes(code.toLowerCase())) {
      return code;
    }
  }
  // City-based detection
  const cityCountry: Record<string, string> = {
    'san francisco': 'US', 'new york': 'US', 'seattle': 'US', 'austin': 'US', 'boston': 'US',
    'chicago': 'US', 'los angeles': 'US', 'denver': 'US', 'atlanta': 'US', 'miami': 'US',
    'washington': 'US', 'portland': 'US', 'dallas': 'US', 'houston': 'US', 'phoenix': 'US',
    'toronto': 'CA', 'vancouver': 'CA', 'montreal': 'CA', 'ottawa': 'CA',
    'london': 'GB', 'manchester': 'GB', 'edinburgh': 'GB', 'cambridge': 'GB', 'bristol': 'GB',
    'berlin': 'DE', 'munich': 'DE', 'hamburg': 'DE', 'frankfurt': 'DE', 'cologne': 'DE',
    'amsterdam': 'NL', 'rotterdam': 'NL', 'eindhoven': 'NL', 'the hague': 'NL',
    'stockholm': 'SE', 'gothenburg': 'SE', 'malmö': 'SE',
    'copenhagen': 'DK', 'aarhus': 'DK',
    'oslo': 'NO', 'helsinki': 'FI', 'zurich': 'CH', 'geneva': 'CH', 'bern': 'CH',
    'vienna': 'AT', 'dublin': 'IE', 'paris': 'FR', 'lyon': 'FR',
    'warsaw': 'PL', 'krakow': 'PL', 'wroclaw': 'PL',
    'prague': 'CZ', 'brno': 'CZ',
    'tokyo': 'JP', 'osaka': 'JP', 'kyoto': 'JP',
    'singapore': 'SG',
    'seoul': 'KR', 'busan': 'KR',
    'beijing': 'CN', 'shanghai': 'CN', 'shenzhen': 'CN', 'hangzhou': 'CN',
    'taipei': 'TW',
    'hong kong': 'HK',
    'sydney': 'AU', 'melbourne': 'AU', 'brisbane': 'AU', 'perth': 'AU',
    'auckland': 'NZ', 'wellington': 'NZ',
  };
  for (const [city, code] of Object.entries(cityCountry)) {
    if (loc.includes(city)) return code;
  }
  return null;
}

/** Extract city from location string */
export function extractCity(location: string): string | null {
  // Remove country suffixes and clean up
  const cleaned = location
    .replace(/,?\s*(remote|hybrid|onsite|on-site)$/i, '')
    .replace(/,?\s*(United States|USA|US|Canada|UK|Germany|Netherlands|Japan|Singapore|Australia)$/i, '')
    .trim();
  // Get the first part before comma (usually the city)
  const parts = cleaned.split(',').map((p) => p.trim());
  if (parts[0] && parts[0].length > 1 && parts[0].length < 50) return parts[0];
  return null;
}

/** Detect remote status from location/title text */
export function detectRemoteStatus(text: string): 'REMOTE' | 'HYBRID' | 'ONSITE' | 'UNKNOWN' {
  const lower = text.toLowerCase();
  if (/\bremote\b/.test(lower) && /\bhybrid\b/.test(lower)) return 'HYBRID';
  if (/\bfully\s+remote\b|\b100%\s*remote\b|\bremote[\s-]*(only|first|friendly)\b/.test(lower)) return 'REMOTE';
  if (/\bremote\b/.test(lower)) return 'REMOTE';
  if (/\bhybrid\b/.test(lower)) return 'HYBRID';
  if (/\bon[- ]?site\b|\bin[- ]?office\b|\bin[- ]?person\b/.test(lower)) return 'ONSITE';
  return 'UNKNOWN';
}
