'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Briefcase, Globe, Wifi, Shield, Filter, ChevronDown, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { formatSalary, timeAgo } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  company: { id: string; name: string; slug: string; logo: string | null; tier: number };
  country: string | null;
  city: string | null;
  remote: string;
  jobType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  techStack: string[];
  visaSponsorship: boolean | null;
  applicationUrl: string;
  score: number;
  postedAt: string | null;
  source: string;
}

interface Stats {
  totalJobs: number;
  totalCompanies: number;
  totalCountries: number;
  jobsByType: Record<string, number>;
}

const JOB_TYPES = ['INTERNSHIP', 'NEW_GRAD', 'FULL_TIME', 'APPRENTICESHIP'];
const REMOTE_OPTIONS = ['REMOTE', 'HYBRID', 'ONSITE'];

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedRemote, setSelectedRemote] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [visaOnly, setVisaOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '18');
      if (selectedType) params.set('type', selectedType);
      if (selectedRemote) params.set('remote', selectedRemote);
      if (selectedCountry) params.set('country', selectedCountry);
      if (visaOnly) params.set('visa', 'true');

      let url: string;
      if (searchQuery.trim()) {
        params.set('q', searchQuery.trim());
        url = `/api/jobs/search?${params}`;
      } else {
        url = `/api/jobs?${params}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setJobs(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedType, selectedRemote, selectedCountry, visaOnly]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch {
      // Stats are non-critical
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchJobs();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const getScoreClass = (score: number) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'INTERNSHIP': return '🎓 Intern';
      case 'NEW_GRAD': return '🚀 New Grad';
      case 'FULL_TIME': return '💼 Full Time';
      case 'APPRENTICESHIP': return '🔧 Apprentice';
      case 'CONTRACT': return '📋 Contract';
      default: return type;
    }
  };

  const getRemoteIcon = (remote: string) => {
    switch (remote) {
      case 'REMOTE': return <Wifi size={12} />;
      case 'HYBRID': return <Globe size={12} />;
      case 'ONSITE': return <MapPin size={12} />;
      default: return null;
    }
  };

  return (
    <div>
      {/* ── Hero Section ── */}
      <section className="hero-gradient" style={{ padding: '48px 24px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <Sparkles size={16} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-hover)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              AI-Powered Job Discovery
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 12, letterSpacing: '-1px' }}>
            Find Your Next
            <br />
            <span style={{ color: 'var(--accent)' }}>Engineering Role</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--foreground-secondary)', maxWidth: 600, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Real-time crawling from Greenhouse, Lever, Ashby, and 6 more sources.
            Discover internships, new grad roles, and remote opportunities across 20+ countries.
          </p>

          {/* Stats Counters */}
          {stats && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32, flexWrap: 'wrap' }}>
              {[
                { label: 'Jobs', value: stats.totalJobs },
                { label: 'Companies', value: stats.totalCompanies },
                { label: 'Countries', value: stats.totalCountries },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--foreground)' }}>{value.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Search Bar */}
          <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
            <Search
              size={18}
              strokeWidth={1.5}
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--foreground-muted)',
              }}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Search roles, companies, or technologies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px' }}>
        {/* Quick Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <button
            className="filter-chip"
            onClick={() => setShowFilters(!showFilters)}
            style={{ gap: 6 }}
          >
            <Filter size={14} strokeWidth={1.5} />
            Filters
            <ChevronDown size={12} strokeWidth={1.5} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {JOB_TYPES.map((type) => (
            <button
              key={type}
              className={`filter-chip ${selectedType === type ? 'active' : ''}`}
              onClick={() => { setSelectedType(selectedType === type ? '' : type); setPage(1); }}
            >
              {getJobTypeLabel(type)}
            </button>
          ))}

          <div style={{ borderLeft: '1px solid var(--border)', height: 20, margin: '0 4px' }} />

          {REMOTE_OPTIONS.map((r) => (
            <button
              key={r}
              className={`filter-chip ${selectedRemote === r ? 'active' : ''}`}
              onClick={() => { setSelectedRemote(selectedRemote === r ? '' : r); setPage(1); }}
            >
              {getRemoteIcon(r)}
              <span style={{ marginLeft: 4 }}>{r.charAt(0) + r.slice(1).toLowerCase()}</span>
            </button>
          ))}

          <button
            className={`filter-chip ${visaOnly ? 'active' : ''}`}
            onClick={() => { setVisaOnly(!visaOnly); setPage(1); }}
          >
            <Shield size={12} strokeWidth={1.5} />
            <span style={{ marginLeft: 4 }}>Visa</span>
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="glass-card animate-fadeIn" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => { setSelectedCountry(e.target.value); setPage(1); }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--foreground)',
                    fontSize: 14,
                  }}
                >
                  <option value="">All Countries</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="NL">Netherlands</option>
                  <option value="SE">Sweden</option>
                  <option value="CH">Switzerland</option>
                  <option value="IE">Ireland</option>
                  <option value="FR">France</option>
                  <option value="JP">Japan</option>
                  <option value="SG">Singapore</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div style={{ fontSize: 13, color: 'var(--foreground-muted)', marginBottom: 16 }}>
          {loading ? 'Searching...' : `${jobs.length} jobs on page ${page} of ${totalPages}`}
        </div>
      </section>

      {/* ── Job Grid ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 48px' }}>
        {loading ? (
          <div className="job-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 220 }} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <Briefcase size={48} strokeWidth={1.5} style={{ color: 'var(--foreground-muted)', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No jobs found</h3>
            <p style={{ color: 'var(--foreground-muted)', fontSize: 14 }}>
              Try adjusting your filters or search query. Jobs are crawled every 6 hours.
            </p>
          </div>
        ) : (
          <div className="job-grid">
            {jobs.map((job, index) => (
              <article
                key={job.id}
                className="glass-card animate-fadeIn"
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  animationDelay: `${index * 0.05}s`,
                  cursor: 'pointer',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <Link href={`/jobs/${job.id}`}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>
                        {job.title}
                      </h3>
                    </Link>
                    <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', fontWeight: 500 }}>
                      {job.company.name}
                    </p>
                  </div>
                  <span className={`score-badge ${getScoreClass(job.score)}`}>
                    {job.score}
                  </span>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: 'var(--foreground-muted)' }}>
                  {job.city && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} strokeWidth={1.5} /> {job.city}{job.country ? `, ${job.country}` : ''}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {getRemoteIcon(job.remote)} {job.remote.charAt(0) + job.remote.slice(1).toLowerCase()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Briefcase size={11} strokeWidth={1.5} /> {getJobTypeLabel(job.jobType)}
                  </span>
                </div>

                {/* Salary */}
                {(job.salaryMin || job.salaryMax) && (
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                  </div>
                )}

                {/* Tech Stack */}
                {job.techStack.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {job.techStack.slice(0, 5).map((tech) => (
                      <span key={tech} className="tech-badge">{tech}</span>
                    ))}
                    {job.techStack.length > 5 && (
                      <span style={{ fontSize: 11, color: 'var(--foreground-muted)', alignSelf: 'center' }}>
                        +{job.techStack.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {job.visaSponsorship && (
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(22, 163, 74, 0.1)', color: 'var(--success)', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
                        <Shield size={10} strokeWidth={1.5} style={{ marginRight: 3, verticalAlign: 'middle' }} />Visa
                      </span>
                    )}
                    {job.postedAt && (
                      <span style={{ fontSize: 11, color: 'var(--foreground-muted)' }}>
                        {timeAgo(job.postedAt)}
                      </span>
                    )}
                  </div>
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: 12 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Apply <ExternalLink size={11} strokeWidth={1.5} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            <button
              className="btn-secondary"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              style={{ opacity: page <= 1 ? 0.5 : 1 }}
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 14, color: 'var(--foreground-secondary)' }}>
              {page} / {totalPages}
            </span>
            <button
              className="btn-secondary"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              style={{ opacity: page >= totalPages ? 0.5 : 1 }}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
