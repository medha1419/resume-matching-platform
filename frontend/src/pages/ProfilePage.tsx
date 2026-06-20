import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getMe, updateSkills } from '../api';
import { User } from '../types';

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    getMe().then((u) => {
      setUser(u);
      setJobTitle(u.job_title || '');
      setSkillsText(u.skills_text || '');
    });
  }, []);

  const skills = (user?.skills_text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSkills(skillsText, jobTitle);
      setUser((prev) => (prev ? { ...prev, job_title: jobTitle, skills_text: skillsText } : prev));
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar activeTab="profile" userName={user.full_name || ''} jobTitle={user.job_title} />

      <div style={{ flex: 1, padding: '48px 56px', maxWidth: '900px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '36px' }}>Your Profile</h1>

        <div
          style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-sm)',
            padding: '32px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--blue)',
              color: 'var(--white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials(user.full_name || 'U')}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px' }}>{user.full_name}</div>
            <div style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '8px' }}>{user.job_title}</div>
            {user.user_id_original && (
              <span
                style={{
                  background: 'var(--cream-dark)',
                  color: 'var(--muted)',
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                }}
              >
                {user.user_id_original}
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-sm)',
            padding: '32px',
          }}
        >
          <h2 style={{ fontSize: '20px', marginBottom: '18px' }}>Your Skills</h2>

          {skills.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {skills.map((skill, i) => (
                <span
                  key={skill + i}
                  style={{
                    background: 'var(--cream-dark)',
                    color: 'var(--dark)',
                    fontSize: '12px',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontWeight: 600,
                    animation: 'slideIn 0.3s ease both',
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: '6px' }}>
            Job Title
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            style={{
              width: '100%',
              border: '1.5px solid var(--border)',
              borderRadius: '8px',
              padding: '14px 16px',
              fontSize: '14px',
              outline: 'none',
              marginBottom: '20px',
              transition: 'var(--transition)',
            }}
          />

          <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: '6px' }}>
            Skills
          </label>
          <textarea
            rows={5}
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            style={{
              width: '100%',
              border: '1.5px solid var(--border)',
              borderRadius: '8px',
              padding: '14px 16px',
              fontSize: '14px',
              outline: 'none',
              marginBottom: '20px',
              resize: 'vertical',
            }}
          />

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: 'var(--blue)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 28px',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--blue-dark)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--blue)')}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {savedMessage && (
            <span
              style={{
                marginLeft: '16px',
                color: 'var(--success)',
                fontSize: '14px',
                animation: 'fadeIn 0.3s ease',
              }}
            >
              ✓ Profile updated!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
