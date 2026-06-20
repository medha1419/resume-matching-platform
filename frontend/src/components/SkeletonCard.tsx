import React from 'react';

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #f0f0eb 25%, #e8e8e2 50%, #f0f0eb 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: 'var(--radius-sm)',
};

const SkeletonCard: React.FC = () => (
  <div
    style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-sm)',
      padding: '20px',
    }}
  >
    <div style={{ ...shimmerStyle, height: '20px', width: '70%', marginBottom: '12px' }} />
    <div style={{ ...shimmerStyle, height: '14px', width: '50%', marginBottom: '8px' }} />
    <div style={{ ...shimmerStyle, height: '14px', width: '40%', marginBottom: '20px' }} />
    <div style={{ ...shimmerStyle, height: '12px', width: '100%', marginBottom: '6px' }} />
    <div style={{ ...shimmerStyle, height: '6px', width: '100%' }} />
  </div>
);

export default SkeletonCard;
