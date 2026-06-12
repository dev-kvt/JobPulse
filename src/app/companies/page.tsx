'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Building2, MapPin, ExternalLink, Globe } from 'lucide-react';
import Link from 'next/link';

interface Company {
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

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('q', search);
      const res = await fetch(`/api/companies?${params}`);
      const data = await res.json();
      if (data.success) setCompanies(data.data || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchCompanies, 300);
    return () => clearTimeout(timeout);
  }, [fetchCompanies]);

  const getTierColor = (tier: number) => {
    if (tier >= 85) return 'var(--success)';
    if (tier >= 65) return 'var(--accent-hover)';
    return 'var(--foreground-muted)';
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          <Building2 size={28} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--accent)' }} />
          Companies
        </h1>
        <p style={{ color: 'var(--foreground-secondary)', fontSize: 15 }}>
          Browse companies actively hiring across 9 ATS platforms globally
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 480, marginBottom: 32 }}>
        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--foreground-muted)' }} />
        <input
          type="text"
          className="search-input"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Company Grid */}
      {loading ? (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 140 }} />)}
        </div>
      ) : companies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <Building2 size={48} style={{ color: 'var(--foreground-muted)', marginBottom: 16 }} />
          <p style={{ color: 'var(--foreground-muted)' }}>No companies found. Try a different search.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {companies.map((company, i) => (
            <Link
              key={company.id}
              href={`/?companyId=${company.id}`}
              className="glass-card animate-fadeIn"
              style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, animationDelay: `${i * 0.03}s` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{company.name}</h3>
                <span style={{ fontSize: 12, fontWeight: 700, color: getTierColor(company.tier), opacity: 0.8 }}>
                  T{company.tier}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--foreground-muted)' }}>
                {company.hqCountry && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={11} /> {company.hqCountry}
                  </span>
                )}
                {company.size !== 'UNKNOWN' && (
                  <span>{company.size.charAt(0) + company.size.slice(1).toLowerCase()}</span>
                )}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-hover)' }}>
                  {company.jobCount} open role{company.jobCount !== 1 ? 's' : ''}
                </span>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--foreground-muted)' }}>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
