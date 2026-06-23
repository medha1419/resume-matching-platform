import React, { useState } from 'react';
import JobCard from '../components/JobCard';
import TypingText from '../components/TypingText';
import { searchPublic } from '../api';
import { Job } from '../types';

const SKILL_PLACEHOLDERS = [
  'Python developer with 3 years of ML experience...',
  'HR business partner skilled in organizational design...',
  'Product manager with B2B SaaS background...',
  'Data scientist experienced in NLP and deep learning...',
  'Full stack engineer with React and Node.js...',
];

const SearchPage: React.FC = () => {
  const [skillsText, setSkillsText] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!skillsText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const results = await searchPublic({
        skills_text: skillsText,
        role_title: roleTitle || undefined,
        location: location || undefined,
        salary_min: salaryMin ? Number(salaryMin) : undefined,
        salary_max: salaryMax ? Number(salaryMax) : undefined,
      });
      setJobs(results);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not find matches. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setLocation('');
    setSalaryMin('');
    setSalaryMax('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          position: 'relative',
          padding: '90px 24px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'visible',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '0px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, #F4A869 0%, #E8845A 40%, transparent 70%)',
            filter: 'blur(60px)',
            opacity: 0.5,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '720px' }}>
          <div
            style={{
              fontSize: '11px',
              letterSpacing: '4px',
              color: 'var(--muted)',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}
          >
            Semantic Job Matching
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '60px',
              fontWeight: 400,
              lineHeight: 1.15,
              color: 'var(--dark)',
            }}
          >
            Find your
            <br />
            <em style={{ fontStyle: 'italic' }}>perfect role.</em>
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: 'var(--muted-dark)',
              marginTop: '20px',
            }}
          >
            Describe your skills and experience.
            <br />
            We'll match you to the right opportunities.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '680px', margin: '48px auto 0' }}>
          <input
            type="text"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="Target role title (e.g. Senior Backend Engineer)"
            style={{
              width: '100%',
              borderRadius: '16px',
              background: 'var(--white)',
              border: '1.5px solid var(--border)',
              padding: '14px 20px',
              fontSize: '15px',
              marginBottom: '12px',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              color: '#1A1A14',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#C4A882')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          <div style={{ position: 'relative' }}>
            <textarea
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              style={{
                width: '100%',
                borderRadius: '24px',
                background: 'var(--white)',
                border: '1.5px solid var(--border)',
                padding: '24px 28px',
                fontSize: '16px',
                minHeight: '120px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                resize: 'none',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                color: '#1A1A14',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#C4A882')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            {skillsText.length === 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '24px',
                  left: '28px',
                  right: '28px',
                  color: 'var(--muted)',
                  fontSize: '16px',
                  pointerEvents: 'none',
                }}
              >
                <TypingText strings={SKILL_PLACEHOLDERS} speed={60} pause={2000} />
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px',
              justifyContent: 'center',
              alignItems: 'flex-start',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowFilters((v) => !v)}
                style={{
                  background: 'var(--cream-dark)',
                  border: '1px solid #E0DFD0',
                  borderRadius: '99px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 400,
                  color: 'var(--dark)',
                }}
              >
                ⚙ Filters
              </button>

              {showFilters && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '320px',
                    background: 'var(--white)',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    zIndex: 100,
                    textAlign: 'left',
                  }}
                >
                  <input
                    type="text"
                    placeholder="e.g. Remote, Bangalore"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={filterFieldStyle}
                  />
                  <input
                    type="number"
                    placeholder="Min salary"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    style={filterFieldStyle}
                  />
                  <input
                    type="number"
                    placeholder="Max salary"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    style={{ ...filterFieldStyle, marginBottom: '16px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={handleClearFilters}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted)',
                        fontSize: '13px',
                        textDecoration: 'underline',
                      }}
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      style={{
                        background: 'var(--dark)',
                        color: 'var(--white)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 18px',
                        fontSize: '13px',
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSearch}
              disabled={loading || !skillsText.trim()}
              style={{
                background: 'var(--dark)',
                color: 'var(--white)',
                borderRadius: '99px',
                padding: '12px 32px',
                fontSize: '15px',
                border: 'none',
                transition: 'var(--transition)',
                animation: loading ? 'pulse 1.2s ease-in-out infinite' : undefined,
                opacity: !skillsText.trim() ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (loading) return;
                e.currentTarget.style.background = '#2D2D20';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--dark)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {loading ? 'Searching...' : 'Find Matches →'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '0 24px 60px', flex: 1 }}>
        {error && (
          <div style={{ color: 'var(--red)', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {!loading && jobs && (
          <>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
              Showing {jobs.length} matches for your profile
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '20px',
              }}
            >
              {jobs.map((job, i) => (
                <JobCard key={job.id} job={job} index={i} />
              ))}
            </div>
          </>
        )}
      </div>

      <footer
        style={{
          textAlign: 'center',
          padding: '40px 0',
          color: '#B8B8A8',
          fontSize: '12px',
        }}
      >
        RoleCall · Semantic job matching
      </footer>
    </div>
  );
};

const filterFieldStyle: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid var(--border)',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '14px',
  outline: 'none',
  marginBottom: '12px',
};

export default SearchPage;
