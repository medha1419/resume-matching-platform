import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import JobCard from '../components/JobCard';
import SkeletonCard from '../components/SkeletonCard';
import TypingText from '../components/TypingText';
import { getMe, likeJob, searchJobs, unlikeJob } from '../api';
import { Job, User } from '../types';

const LOCATION_PLACEHOLDERS = ['Remote', 'Bangalore', 'New York', 'London', 'Mumbai'];

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const CountUp: React.FC<{ value: number }> = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 600;
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.round(progress * value));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{count}</>;
};

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [location, setLocation] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getMe().then(setUser).catch(() => {});
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setError('');
    try {
      const results = await searchJobs({
        location: location || undefined,
        salary_min: minSalary ? Number(minSalary) : undefined,
        salary_max: maxSalary ? Number(maxSalary) : undefined,
      });
      setJobs(results);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not find matches. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setLocation('');
    setMinSalary('');
    setMaxSalary('');
    setJobs(null);
    setSearched(false);
    setError('');
  };

  const handleLike = async (job: Job) => {
    setJobs((prev) => prev?.map((j) => (j.id === job.id ? { ...j, is_liked: true } : j)) ?? prev);
    try {
      await likeJob(job.id);
    } catch {
      setJobs((prev) => prev?.map((j) => (j.id === job.id ? { ...j, is_liked: false } : j)) ?? prev);
    }
  };

  const handleUnlike = async (job: Job) => {
    setJobs((prev) => prev?.map((j) => (j.id === job.id ? { ...j, is_liked: false } : j)) ?? prev);
    try {
      await unlikeJob(job.id);
    } catch {
      setJobs((prev) => prev?.map((j) => (j.id === job.id ? { ...j, is_liked: true } : j)) ?? prev);
    }
  };

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const skills = (user?.skills_text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const visibleSkills = skills.slice(0, 6);
  const remaining = skills.length - visibleSkills.length;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar activeTab="search" userName={user?.full_name || ''} jobTitle={user?.job_title} />

      <div style={{ flex: 1, padding: '48px 56px', maxWidth: '1100px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>
          {greeting()}, {firstName}
        </h1>

        {skills.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '36px' }}>
            {visibleSkills.map((skill) => (
              <span
                key={skill}
                style={{
                  background: 'var(--cream-dark)',
                  color: 'var(--dark)',
                  fontSize: '10px',
                  padding: '5px 10px',
                  borderRadius: '999px',
                  fontWeight: 600,
                }}
              >
                {skill}
              </span>
            ))}
            {remaining > 0 && (
              <span
                style={{
                  background: 'var(--blue)',
                  color: 'var(--white)',
                  fontSize: '10px',
                  padding: '5px 10px',
                  borderRadius: '999px',
                  fontWeight: 600,
                }}
              >
                + {remaining} more
              </span>
            )}
          </div>
        )}

        <div
          style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-sm)',
            padding: '28px',
            marginBottom: '40px',
          }}
        >
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Find your matches</h2>

          <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '200px', position: 'relative' }}>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder=" "
                style={fieldStyle}
              />
              {location.length === 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '16px',
                    color: 'var(--muted)',
                    fontSize: '14px',
                    pointerEvents: 'none',
                  }}
                >
                  <TypingText strings={LOCATION_PLACEHOLDERS} speed={70} pause={2000} />
                </div>
              )}
            </div>
            <input
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              placeholder="Min salary"
              style={{ ...fieldStyle, flex: 1, minWidth: '140px' }}
            />
            <input
              type="number"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
              placeholder="Max salary"
              style={{ ...fieldStyle, flex: 1, minWidth: '140px' }}
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              width: '100%',
              height: '50px',
              background: 'var(--blue)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'var(--blue-dark)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--blue)')}
          >
            {loading ? '🔍 Finding your matches...' : 'Find Matches'}
          </button>

          {searched && (
            <div style={{ textAlign: 'center', marginTop: '14px' }}>
              <button
                onClick={handleClear}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '13px' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--blue)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {error && (
          <div style={{ color: 'var(--red)', fontSize: '14px', marginBottom: '20px', animation: 'fadeIn 0.3s ease' }}>
            {error}
          </div>
        )}

        {!searched && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '22px', marginBottom: '10px' }}>✨ Your personalized matches await</div>
            <div style={{ fontSize: '14px' }}>
              Click Find Matches to discover opportunities tailored to your skills
            </div>
          </div>
        )}

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {!loading && searched && jobs && (
          <>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '18px' }}>
              Showing <CountUp value={jobs.length} /> matches
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {jobs.map((job, i) => (
                <JobCard key={job.id} job={job} index={i} onLike={handleLike} onUnlike={handleUnlike} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid var(--border)',
  borderRadius: '8px',
  padding: '14px 16px',
  fontSize: '14px',
  outline: 'none',
  transition: 'var(--transition)',
};

export default DashboardPage;
