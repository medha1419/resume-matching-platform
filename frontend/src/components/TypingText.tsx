import React, { useEffect, useState } from 'react';

interface TypingTextProps {
  strings: string[];
  speed?: number;
  pause?: number;
  className?: string;
  style?: React.CSSProperties;
}

const TypingText: React.FC<TypingTextProps> = ({
  strings,
  speed = 80,
  pause = 2500,
  className,
  style,
}) => {
  const [stringIndex, setStringIndex] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing');

  useEffect(() => {
    if (strings.length === 0) return;
    const current = strings[stringIndex];

    if (phase === 'typing') {
      if (text.length < current.length) {
        const timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), speed);
        return () => clearTimeout(timeout);
      }
      const timeout = setTimeout(() => setPhase('pausing'), pause);
      return () => clearTimeout(timeout);
    }

    if (phase === 'pausing') {
      const timeout = setTimeout(() => setPhase('deleting'), pause);
      return () => clearTimeout(timeout);
    }

    if (phase === 'deleting') {
      if (text.length > 0) {
        const timeout = setTimeout(() => setText(text.slice(0, -1)), speed / 2);
        return () => clearTimeout(timeout);
      }
      setStringIndex((stringIndex + 1) % strings.length);
      setPhase('typing');
    }
  }, [text, phase, stringIndex, strings, speed, pause]);

  return (
    <span className={className} style={style}>
      {text}
      <span
        style={{
          display: 'inline-block',
          width: '2px',
          height: '1em',
          marginLeft: '2px',
          background: 'currentColor',
          verticalAlign: 'middle',
          animation: 'typingCursor 1s step-end infinite',
        }}
      />
    </span>
  );
};

export default TypingText;
