'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, Activity, Globe, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface Stats {
  totalJobs: number;
  totalCompanies: number;
  totalCountries: number;
  jobsByType: Record<string, number>;
  jobsByCountry: Record<string, number>;
  jobsByRemote: Record<string, number>;
  topCompanies: Array<{ name: string; jobCount: number }>;
  recentCrawls: Array<{ source: string; status: string; jobsFound: number; jobsNew: number; startedAt: string; duration: number }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [crawlResult, setCrawlResult] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const triggerCrawl = async () => {
    setCrawling(true);
    setCrawlResult(null);
    try {
      const res = await fetch('/api/cron/crawl');
      const data = await res.json();
      if (data.success) {
        setCrawlResult(`✅ Crawl complete: ${data.data.summary.totalJobsFound} found, ${data.data.summary.totalNewJobs} new`);
        // Refresh stats
        const statsRes = await fetch('/api/stats');
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.data);
      } else {
        setCrawlResult(`❌ Crawl failed: ${data.error}`);
      }
    } catch (error) {
      setCrawlResult(`❌ Error: ${error}`);
    } finally {
      setCrawling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        <div className="skeleton" style={{ height: 32, width: 200, marginBottom: 24 }} />
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            <LayoutDashboard size={28} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--accent)' }} />
            Dashboard
          </h1>
          <p style={{ color: 'var(--foreground-secondary)', fontSize: 15 }}>System overview and crawler management</p>
        </div>
        <button
          className="btn-primary"
          onClick={triggerCrawl}
          disabled={crawling}
          style={{ opacity: crawling ? 0.7 : 1 }}
        >
          <Activity size={16} />
          {crawling ? 'Crawling...' : 'Run Crawlers'}
        </button>
      </div>

      {crawlResult && (
        <div className="glass-card animate-fadeIn" style={{ padding: 16, marginBottom: 24, borderLeft: `3px solid ${crawlResult.startsWith('✅') ? 'var(--success)' : 'var(--danger)'}` }}>
          <p style={{ fontSize: 14 }}>{crawlResult}</p>
        </div>
      )}

      {/* Overview Cards */}
      {stats && (
        <>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', marginBottom: 32 }}>
            {[
              { label: 'Total Jobs', value: stats.totalJobs, icon: Activity, color: 'var(--accent)' },
              { label: 'Companies', value: stats.totalCompanies, icon: Globe, color: 'var(--info)' },
              { label: 'Countries', value: stats.totalCountries, icon: Globe, color: 'var(--success)' },
              { label: 'Sources', value: 9, icon: Activity, color: 'var(--warning)' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
                <Icon size={24} style={{ color, marginBottom: 8 }} />
                <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{value.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Two Column Layout */}
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', marginBottom: 24 }}>
            {/* Jobs by Type */}
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Jobs by Type</h3>
              {Object.entries(stats.jobsByType).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                const pct = stats.totalJobs > 0 ? (count / stats.totalJobs * 100) : 0;
                return (
                  <div key={type} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>{type.replace('_', ' ')}</span>
                      <span style={{ color: 'var(--foreground-muted)' }}>{count} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--background)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: 'var(--accent-gradient)', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top Companies */}
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Top Companies</h3>
              {stats.topCompanies.map((company, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{company.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-hover)' }}>{company.jobCount} jobs</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Crawls */}
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} style={{ color: 'var(--foreground-muted)' }} /> Recent Crawls
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Source', 'Status', 'Found', 'New', 'Duration', 'Time'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--foreground-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentCrawls.map((crawl, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{crawl.source}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {crawl.status === 'COMPLETED' ? <CheckCircle size={12} color="var(--success)" /> : crawl.status === 'RUNNING' ? <Activity size={12} color="var(--warning)" /> : <XCircle size={12} color="var(--danger)" />}
                          {crawl.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>{crawl.jobsFound}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--success)', fontWeight: 600 }}>+{crawl.jobsNew}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--foreground-muted)' }}>{crawl.duration ? `${(crawl.duration / 1000).toFixed(1)}s` : '-'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--foreground-muted)' }}>{new Date(crawl.startedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
