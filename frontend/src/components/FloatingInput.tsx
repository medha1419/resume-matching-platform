import React, { useState } from 'react';

interface FloatingInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const FloatingInput: React.FC<FloatingInputProps> = ({ label, type = 'text', value, onChange, placeholder }) => {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div style={{ position: 'relative', marginBottom: '22px' }}>
      <label
        style={{
          position: 'absolute',
          left: '16px',
          top: floated ? '-9px' : '14px',
          fontSize: floated ? '11px' : '14px',
          color: floated ? 'var(--blue)' : 'var(--muted)',
          background: floated ? 'var(--white)' : 'transparent',
          padding: floated ? '0 4px' : '0',
          transition: 'var(--transition)',
          pointerEvents: 'none',
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={focused ? placeholder : undefined}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          border: '1.5px solid var(--border)',
          borderRadius: '8px',
          padding: '14px 16px',
          fontSize: '14px',
          outline: 'none',
          transition: 'var(--transition)',
          borderColor: focused ? 'var(--blue)' : 'var(--border)',
        }}
      />
    </div>
  );
};

export default FloatingInput;
