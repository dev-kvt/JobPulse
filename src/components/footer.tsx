import { Code, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 24px',
        background: 'var(--background-secondary)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 13, color: 'var(--foreground-muted)' }}>
            JobPulse — Crawling {'>'}50 companies across 9 ATS platforms globally
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--foreground-muted)' }}>
            Data refreshed every 6 hours
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--foreground-muted)', transition: 'color 0.2s' }}
          >
            <Code size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
