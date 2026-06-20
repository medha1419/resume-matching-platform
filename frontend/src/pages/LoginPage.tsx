import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, TOKEN_KEY } from '../api';
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

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(username, password);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid credentials. Please try again.');
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
        <div style={{ position: 'absolute', bottom: '40px', left: '60px', fontSize: '13px', color: 'var(--muted)' }}>
          143 professionals matched
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
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-serif)', color: 'var(--blue)', fontSize: '24px', marginBottom: '32px' }}>
            RoleCall
          </div>
          <h2 style={{ fontSize: '32px', marginBottom: '6px' }}>Welcome back</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '28px' }}>
            Sign in to see your matches
          </p>

          <form onSubmit={handleSubmit}>
            <FloatingInput label="User ID or Email" value={username} onChange={setUsername} />
            <FloatingInput label="Password" type="password" value={password} onChange={setPassword} />

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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--blue-dark)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--blue)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? (
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'var(--white)',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '28px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ color: 'var(--muted)', fontSize: '13px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/register" style={{ color: 'var(--blue)', fontSize: '14px', fontWeight: 600 }}>
              Create an account →
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
