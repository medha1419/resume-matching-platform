import React, { useEffect, useState } from 'react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  index?: number;
  onLike?: (job: Job) => void;
  onUnlike?: (job: Job) => void;
  showMatch?: boolean;
  footer?: React.ReactNode;
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

const JobCard: React.FC<JobCardProps> = ({ job, index = 0, onLike, onUnlike, showMatch = true, footer }) => {
  const [barWidth, setBarWidth] = useState(0);
  const [justLiked, setJustLiked] = useState(false);
  const salary = formatSalary(job);
  const matchPct = job.match_score != null ? Math.round(job.match_score * 100) : null;

  useEffect(() => {
    if (matchPct == null) return;
    const timeout = setTimeout(() => setBarWidth(matchPct), 100);
    return () => clearTimeout(timeout);
  }, [matchPct]);

  const handleHeartClick = () => {
    if (job.is_liked) {
      onUnlike?.(job);
    } else {
      setJustLiked(true);
      onLike?.(job);
      setTimeout(() => setJustLiked(false), 400);
    }
  };

  return (
    <div
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-sm)',
        padding: '20px',
        transition: 'var(--transition)',
        animation: 'fadeUp 0.5s ease-out both',
        animationDelay: `${index * 80}ms`,
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: '17px', color: 'var(--dark)', fontWeight: 600, paddingRight: '12px' }}>
          {job.job_title}
        </h3>
        {onLike && (
          <button
            onClick={handleHeartClick}
            aria-label={job.is_liked ? 'Unlike job' : 'Like job'}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              flexShrink: 0,
              animation: justLiked ? 'heartPop 0.4s ease' : undefined,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={job.is_liked ? 'var(--red)' : 'none'} stroke={job.is_liked ? 'var(--red)' : '#B0B0A8'} strokeWidth="2">
              <path d="M12 21s-7.5-4.6-10-9.2C0.5 8.4 2 4.5 6 4.5c2.2 0 3.6 1.4 4.5 2.7.9-1.3 2.3-2.7 4.5-2.7 4 0 5.5 3.9 4 7.3-2.5 4.6-10 9.2-10 9.2z" />
            </svg>
          </button>
        )}
      </div>

      <div style={{ marginTop: '8px', color: 'var(--muted)', fontSize: '14px' }}>
        📍 {job.location || 'Location not specified'}
      </div>

      {salary && (
        <div style={{ marginTop: '4px', color: 'var(--muted)', fontSize: '14px' }}>
          💰 {salary}
        </div>
      )}

      {showMatch && matchPct != null && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--muted)' }}>Match</span>
            <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{matchPct}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--cream-dark)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                borderRadius: '3px',
                width: `${barWidth}%`,
                background: 'linear-gradient(90deg, var(--blue), #6B8FF0)',
                transition: 'width 0.8s ease-out',
              }}
            />
          </div>
        </div>
      )}

      {footer && <div style={{ marginTop: '14px' }}>{footer}</div>}
    </div>
  );
};

export default JobCard;
