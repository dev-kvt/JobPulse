// ============================================================
// Abstract Crawler Base Class
// ============================================================
// All crawlers extend this base class which provides common
// functionality: rate limiting, error handling, and logging.
// ============================================================

import type { JobCrawler, CompanyAtsEntry } from '@/types/crawler';
import type { RawJob, NormalizedJob, JobSource } from '@/types/job';
import { sleep } from '@/lib/utils';

export abstract class BaseCrawler implements JobCrawler {
  abstract readonly source: JobSource;
  abstract readonly name: string;

  /** Companies to crawl on this ATS */
  protected companies: CompanyAtsEntry[] = [];

  /** Rate limit delay between requests in ms */
  protected rateLimitMs: number = 500;

  /** Max retries per request */
  protected maxRetries: number = 2;

  /** Request timeout in ms */
  protected timeoutMs: number = 8000;

  /**
   * Crawl all configured companies and aggregate results.
   */
  async crawl(): Promise<RawJob[]> {
    const allJobs: RawJob[] = [];
    const errors: string[] = [];

    for (const company of this.companies) {
      try {
        const jobs = await this.crawlCompany(company);
        allJobs.push(...jobs);
        // Rate limit between companies
        if (this.rateLimitMs > 0) {
          await sleep(this.rateLimitMs);
        }
      } catch (error) {
        const msg = `[${this.name}] Error crawling ${company.name}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(msg);
        errors.push(msg);
      }
    }

    console.log(`[${this.name}] Crawled ${allJobs.length} jobs from ${this.companies.length} companies (${errors.length} errors)`);
    return allJobs;
  }

  /**
   * Crawl a single company. Must be implemented by each crawler.
   */
  protected abstract crawlCompany(company: CompanyAtsEntry): Promise<RawJob[]>;

  /**
   * Normalize a raw job into the unified schema. Must be implemented by each crawler.
   */
  abstract normalize(raw: RawJob): NormalizedJob;

  /**
   * Make an HTTP request with retries and timeout.
   */
  protected async fetchWithRetry(url: string, options?: RequestInit): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'User-Agent': 'JobCrawler/1.0 (https://github.com/job-crawler)',
            'Accept': 'application/json',
            ...options?.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < this.maxRetries) {
          const backoff = Math.pow(2, attempt) * 1000;
          console.warn(`[${this.name}] Retry ${attempt + 1}/${this.maxRetries} for ${url} (waiting ${backoff}ms)`);
          await sleep(backoff);
        }
      }
    }

    throw lastError ?? new Error(`Failed to fetch ${url}`);
  }

  /**
   * Fetch and parse JSON with retries.
   */
  protected async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await this.fetchWithRetry(url, options);
    return response.json() as Promise<T>;
  }
}
