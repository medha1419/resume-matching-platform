import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, TOKEN_KEY } from '../api';
import TypingText from '../components/TypingText';
import FloatingInput from '../components/FloatingInput';

const ROLE_PHRASES = [
  'as a Data Scientist.',
  'as a Product Manager.',
  'as a Software Engineer.',
  'as an HR Business Partner.',
  'as a Marketing Lead.',
  'as a DevOps Engineer.',
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid var(--border)',
  borderRadius: '8px',
  padding: '14px 16px',
  fontSize: '14px',
  outline: 'none',
  transition: 'var(--transition)',
  marginBottom: '22px',
  fontFamily: 'var(--font-sans)',
};

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register({
        email,
        password,
        full_name: fullName,
        job_title: jobTitle,
        skills_text: skillsText,
      });
      localStorage.setItem(TOKEN_KEY, res.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div
        style={{
          flex: 1,
          background: 'var(--cream)',
          padding: '60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '480px' }}>
          <h1 style={{ fontSize: '48px', lineHeight: 1.15, marginBottom: '8px' }}>
            Find your role
          </h1>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              color: 'var(--blue)',
              fontSize: '32px',
              minHeight: '44px',
            }}
          >
            <TypingText strings={ROLE_PHRASES} speed={70} pause={2500} />
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '16px', marginTop: '24px', maxWidth: '420px' }}>
            RoleCall matches your unique skills to the right opportunities. No applications.
            Just matches.
          </p>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: 'var(--white)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-serif)', color: 'var(--blue)', fontSize: '24px', marginBottom: '24px' }}>
            RoleCall
          </div>
          <h2 style={{ fontSize: '32px', marginBottom: '6px' }}>Join RoleCall</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '28px' }}>
            Create your profile to start matching
          </p>

          <form onSubmit={handleSubmit}>
            <FloatingInput label="Full Name" value={fullName} onChange={setFullName} />
            <FloatingInput label="Email" type="email" value={email} onChange={setEmail} />
            <FloatingInput label="Password" type="password" value={password} onChange={setPassword} />

            <input
              type="text"
              placeholder="Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--blue)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />

            <textarea
              rows={5}
              placeholder="e.g. Python, machine learning, data analysis, statistical modeling, SQL..."
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--blue)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />

            {error && (
              <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '16px', animation: 'fadeIn 0.3s ease' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                background: 'var(--blue)',
                color: 'var(--white)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                transition: 'var(--transition)',
                opacity: loading ? 0.8 : 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--blue-dark)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--blue)')}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link to="/login" style={{ color: 'var(--blue)', fontSize: '14px', fontWeight: 600 }}>
              Already have an account? Sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
