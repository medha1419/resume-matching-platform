import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TOKEN_KEY } from '../api';

type Tab = 'search' | 'liked' | 'profile';

interface SidebarProps {
  activeTab: Tab;
  userName: string;
  jobTitle?: string | null;
}

const navItems: { tab: Tab; label: string; icon: string; to: string }[] = [
  { tab: 'search', label: 'Search', icon: '🔍', to: '/dashboard' },
  { tab: 'liked', label: 'Liked Jobs', icon: '❤️', to: '/liked' },
  { tab: 'profile', label: 'Profile', icon: '👤', to: '/profile' },
];

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const Sidebar: React.FC<SidebarProps> = ({ activeTab, userName, jobTitle }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    navigate('/login');
  };

  return (
    <div
      style={{
        width: '260px',
        minWidth: '260px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'var(--white)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 20px',
      }}
    >
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--blue)' }}>
        RoleCall
      </div>
      <div style={{ height: '1px', background: 'var(--border)', margin: '20px 0' }} />

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const isActive = item.tab === activeTab;
          return (
            <Link
              key={item.tab}
              to={item.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--white)' : 'var(--dark)',
                background: isActive ? 'var(--blue)' : 'transparent',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--cream)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--blue)',
              color: 'var(--white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials(userName || 'U')}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {jobTitle || ''}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            fontSize: '13px',
            padding: 0,
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--red)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
