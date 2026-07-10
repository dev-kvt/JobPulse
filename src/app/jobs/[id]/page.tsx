'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Briefcase, Globe, Wifi, Shield, ExternalLink, ArrowLeft, Clock, Building2, Sparkles } from 'lucide-react';
import { formatSalary, timeAgo } from '@/lib/utils';

interface JobDetail {
  id: string;
  title: string;
  description: string | null;
  company: { id: string; name: string; slug: string; logo: string | null; tier: number; size: string; website: string | null; hqCountry: string | null };
  country: string | null;
  city: string | null;
  remote: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  techStack: string[];
  visaSponsorship: boolean | null;
  applicationUrl: string;
  score: number;
  source: string;
  postedAt: string | null;
  crawledAt: string;
  relatedJobs: Array<{
    id: string;
    title: string;
    company: { name: string; slug: string };
    score: number;
    remote: string;
    jobType: string;
  }>;
}

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setJob(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch job:', error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchJob();
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <div className="skeleton" style={{ height: 32, width: 200, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 400, marginBottom: 24 }} />
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Job not found</h2>
        <Link href="/" className="btn-secondary" style={{ marginTop: 16, display: 'inline-flex' }}>
          <ArrowLeft size={16} strokeWidth={1.5} /> Back to Jobs
        </Link>
      </div>
    );
  }

  const getScoreClass = (score: number) => score >= 70 ? 'score-high' : score >= 40 ? 'score-medium' : 'score-low';

  const decodeHtml = (html: string) => {
    return html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ');
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 64px' }}>
      {/* Back Button */}
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--foreground-muted)', marginBottom: 24, transition: 'color 0.2s' }}>
        <ArrowLeft size={14} strokeWidth={1.5} /> Back to Jobs
      </Link>

      {/* Job Header */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{job.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Building2 size={16} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--foreground-secondary)' }}>{job.company.name}</span>
            </div>

            {/* Meta Grid */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--foreground-secondary)' }}>
              {job.city && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} strokeWidth={1.5} /> {job.city}{job.country ? `, ${job.country}` : ''}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {job.remote === 'REMOTE' ? <Wifi size={13} strokeWidth={1.5} /> : job.remote === 'HYBRID' ? <Globe size={13} strokeWidth={1.5} /> : <MapPin size={13} strokeWidth={1.5} />}
                {job.remote.charAt(0) + job.remote.slice(1).toLowerCase()}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Briefcase size={13} strokeWidth={1.5} /> {job.jobType.replace('_', ' ')}
              </span>
              {job.postedAt && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} strokeWidth={1.5} /> {timeAgo(job.postedAt)}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
            <span className={`score-badge ${getScoreClass(job.score)}`} style={{ fontSize: 16, padding: '6px 14px', minWidth: 52 }}>
              {job.score}
            </span>
            {(job.salaryMin || job.salaryMax) && (
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
              </div>
            )}
          </div>
        </div>

        {/* Badges Row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          {job.visaSponsorship && (
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Shield size={12} strokeWidth={1.5} /> Visa Sponsorship
            </span>
          )}
          <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            Source: {job.source.replace('_', ' ')}
          </span>
        </div>

        {/* Tech Stack */}
        {job.techStack.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Tech Stack</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {job.techStack.map((tech) => (
                <span key={tech} className="tech-badge">{tech}</span>
              ))}
            </div>
          </div>
        )}

        {/* Apply Button */}
        <a
          href={job.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ marginTop: 20, width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 15 }}
        >
          Apply Now <ExternalLink size={15} strokeWidth={1.5} />
        </a>
      </div>

      {job.description && (
        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Job Description</h2>
          <div 
            className="job-description"
            style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--foreground-secondary)' }}
            dangerouslySetInnerHTML={{ __html: decodeHtml(job.description) }}
          />
        </div>
      )}

      {/* Related Jobs */}
      {job.relatedJobs && job.relatedJobs.length > 0 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} strokeWidth={1.5} style={{ color: 'var(--accent)' }} /> Similar Roles
          </h2>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {job.relatedJobs.map((related) => (
              <Link key={related.id} href={`/jobs/${related.id}`} className="glass-card" style={{ padding: 16, display: 'block' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{related.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--foreground-muted)' }}>{related.company.name}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--foreground-muted)' }}>{related.jobType.replace('_', ' ')}</span>
                  <span className={`score-badge ${getScoreClass(related.score)}`} style={{ height: 22, fontSize: 11 }}>{related.score}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
