import React, { useEffect, useState } from 'react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  index?: number;
}

const formatSalary = (job: Job) => {
  if (job.salary_min == null && job.salary_max == null) return null;
  const currency = job.currency || '';
  if (job.salary_min != null && job.salary_max != null) {
    return `${currency} ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}`;
  }
  const value = job.salary_min ?? job.salary_max;
  return `${currency} ${value!.toLocaleString()}`;
};

const JobCard: React.FC<JobCardProps> = ({ job, index = 0 }) => {
  const [barWidth, setBarWidth] = useState(0);
  const salary = formatSalary(job);
  const matchPct = job.match_score;

  useEffect(() => {
    const timeout = setTimeout(() => setBarWidth(matchPct), 100);
    return () => clearTimeout(timeout);
  }, [matchPct]);

  return (
    <div
      style={{
        background: 'var(--white)',
        border: '1px solid #EEEEE4',
        borderRadius: 'var(--radius)',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.25s ease',
        animation: 'fadeUp 0.5s ease-out both',
        animationDelay: `${index * 60}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <h3
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '18px',
            fontWeight: 500,
            color: 'var(--dark)',
          }}
        >
          {job.job_title}
        </h3>
        <span
          style={{
            background: 'var(--cream-dark)',
            color: '#5C5C4A',
            borderRadius: '999px',
            padding: '4px 10px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {matchPct}% match
        </span>
      </div>

      <div style={{ marginTop: '8px', color: 'var(--muted)', fontSize: '13px' }}>
        📍 {job.location || 'Location not specified'}
      </div>

      {salary && (
        <div style={{ marginTop: '4px', color: 'var(--muted)', fontSize: '13px' }}>
          💰 {salary}
        </div>
      )}

      <div style={{ height: '1px', background: '#F0EFE6', margin: '18px 0 14px' }} />

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
          <span style={{ color: 'var(--muted)' }}>Relevance</span>
          <span style={{ color: 'var(--muted-dark)' }}>{matchPct}%</span>
        </div>
        <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--cream-dark)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              borderRadius: '3px',
              width: `${barWidth}%`,
              background: 'linear-gradient(90deg, var(--tan), var(--tan-dark))',
              transition: 'width 0.8s ease-out',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default JobCard;
