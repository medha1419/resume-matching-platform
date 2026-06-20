import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import JobCard from '../components/JobCard';
import { getLikedJobs, getMe, unlikeJob } from '../api';
import { Job, User } from '../types';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const LikedJobsPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then(setUser).catch(() => {});
    getLikedJobs()
      .then(setJobs)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (job: Job) => {
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
    try {
      await unlikeJob(job.id);
    } catch {
      setJobs((prev) => [...prev, job]);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar activeTab="liked" userName={user?.full_name || ''} jobTitle={user?.job_title} />

      <div style={{ flex: 1, padding: '48px 56px', maxWidth: '1100px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '6px' }}>Liked Jobs</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '36px' }}>
          {jobs.length} saved opportunities
        </p>

        {!loading && jobs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤍</div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>No liked jobs yet</div>
            <div style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
              Find matches and heart the ones you love
            </div>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-block',
                background: 'var(--blue)',
                color: 'var(--white)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'var(--transition)',
              }}
            >
              Find Matches →
            </Link>
          </div>
        )}

        {jobs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {jobs.map((job, i) => (
              <JobCard
                key={job.id}
                job={job}
                index={i}
                showMatch={false}
                footer={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      Liked {formatDate(job.liked_at)}
                    </span>
                    <button
                      onClick={() => handleRemove(job)}
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '13px' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--red)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                    >
                      Remove
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedJobsPage;
