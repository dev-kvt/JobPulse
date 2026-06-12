'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Globe, DollarSign, Zap } from 'lucide-react';
import { getStackRankings, getCandidatePathAnalysis, getCountryAnalysis, getLearningRoadmap } from '@/lib/analysis/market';

export default function TrendingPage() {
  const [stackRankings] = useState(getStackRankings());
  const [paths] = useState(getCandidatePathAnalysis());
  const [countries] = useState(getCountryAnalysis());
  const [roadmap] = useState(getLearningRoadmap());
  const [apiData, setApiData] = useState<{ mostRequested?: Array<{ name: string; count: number; percentage: number }>; highestSalary?: Array<{ name: string; avgSalary: number; jobCount: number }> } | null>(null);

  useEffect(() => {
    fetch('/api/trending-stacks')
      .then((r) => r.json())
      .then((d) => { if (d.success) setApiData(d.data); })
      .catch(() => {});
  }, []);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'LANGUAGE': return '#7c3aed';
      case 'FRAMEWORK': return '#3b82f6';
      case 'CLOUD': return '#f59e0b';
      case 'DATABASE': return '#22c55e';
      case 'INFRASTRUCTURE': return '#ef4444';
      case 'AI_ML': return '#ec4899';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          <TrendingUp size={28} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--accent)' }} />
          Market Trends & Analytics
        </h1>
        <p style={{ color: 'var(--foreground-secondary)', fontSize: 15 }}>
          Data-driven insights on technology demand, salaries, and career paths
        </p>
      </div>

      {/* Tech Stack Rankings */}
      <section className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={20} style={{ color: 'var(--accent)' }} /> Technology Stack Rankings
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--foreground-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>#</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--foreground-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Technology</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--foreground-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--foreground-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Demand</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--foreground-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Salary</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--foreground-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Difficulty</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--foreground-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Future</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--foreground-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mobility</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--foreground-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall</th>
              </tr>
            </thead>
            <tbody>
              {stackRankings.slice(0, 25).map((tech, i) => (
                <tr key={tech.name} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--background-hover)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--foreground-muted)' }}>{i + 1}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{tech.name}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: `${getCategoryColor(tech.category)}15`, color: getCategoryColor(tech.category), border: `1px solid ${getCategoryColor(tech.category)}30` }}>
                      {tech.category.replace('_', '/')}
                    </span>
                  </td>
                  {[tech.demandScore, tech.salaryScore, tech.difficulty, tech.futureScore, tech.mobilityScore].map((score, j) => (
                    <td key={j} style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <div style={{ width: 32, height: 6, borderRadius: 3, background: 'var(--background)', overflow: 'hidden' }}>
                          <div style={{ width: `${score * 10}%`, height: '100%', borderRadius: 3, background: score >= 8 ? 'var(--success)' : score >= 5 ? 'var(--warning)' : 'var(--danger)' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, minWidth: 16 }}>{score}</span>
                      </div>
                    </td>
                  ))}
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: tech.overallScore >= 7 ? 'var(--success)' : 'var(--foreground)' }}>{tech.overallScore}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Career Paths */}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={20} style={{ color: 'var(--warning)' }} /> Recommended Career Paths
        </h2>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {Object.entries(paths).map(([key, path]) => (
            <div key={key} className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--accent-hover)' }}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
              </h3>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>{path.stack}</p>
              <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{path.reason}</p>
              <span style={{ fontSize: 12, color: 'var(--foreground-muted)' }}>⏱ {path.timeToFirstJob}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Top Countries */}
      <section className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={20} style={{ color: 'var(--info)' }} /> Top Countries for Software Engineers
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Country', 'Region', 'Avg Salary', 'Job Volume', 'Visa', 'Top Cities', 'Notes'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--foreground-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {countries.map((c) => (
                <tr key={c.code} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{c.country}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--foreground-muted)' }}>{c.region}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--success)', fontWeight: 600 }}>${(c.avgSalary / 1000).toFixed(0)}K</td>
                  <td style={{ padding: '10px 12px' }}>{c.jobVolume}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: c.visaDifficulty === 'Easy' ? 'rgba(34,197,94,0.1)' : c.visaDifficulty === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: c.visaDifficulty === 'Easy' ? 'var(--success)' : c.visaDifficulty === 'Medium' ? 'var(--warning)' : 'var(--danger)' }}>
                      {c.visaDifficulty}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--foreground-secondary)' }}>{c.topCities.join(', ')}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--foreground-muted)', maxWidth: 200 }}>{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Learning Roadmap */}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <DollarSign size={20} style={{ color: 'var(--success)' }} /> Learning Roadmap
        </h2>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {Object.entries(roadmap).map(([key, phase]) => (
            <div key={key} className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--accent-hover)' }}>{phase.title}</h3>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Goals</h4>
              <ul style={{ fontSize: 13, color: 'var(--foreground-secondary)', lineHeight: 1.8, paddingLeft: 16, marginBottom: 12 }}>
                {phase.goals.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Projects</h4>
              <ul style={{ fontSize: 13, color: 'var(--foreground-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                {phase.projects.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
