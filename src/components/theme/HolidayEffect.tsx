import { useMemo, type CSSProperties } from 'react';
import { useTheme } from '../../state/ThemeContext';

type ParticleStyle = CSSProperties & Record<string, string | number>;
type IconKind =
  | 'snowflake'
  | 'tree'
  | 'pumpkin'
  | 'heart'
  | 'flower'
  | 'leaf'
  | 'egg'
  | 'star'
  | 'sparkle';

function particleStyle(index: number, offset = 0): ParticleStyle {
  const x = (index * 37 + offset * 17) % 100;
  const y = (index * 29 + offset * 11) % 82;
  const delay = ((index * 13 + offset) % 24) / 10;
  const duration = 8 + ((index * 7 + offset) % 10);
  const size = 11 + ((index * 11 + offset) % 17);
  const drift = `${(index % 2 === 0 ? 1 : -1) * (12 + ((index * 9) % 44))}px`;
  const rotate = `${(index * 47) % 360}deg`;
  return {
    '--x': `${x}%`,
    '--y': `${y}%`,
    '--delay': `${delay}s`,
    '--duration': `${duration}s`,
    '--size': `${size}px`,
    '--drift': drift,
    '--rotate': rotate,
  };
}

function particles(count: number, offset = 0) {
  return Array.from({ length: count }, (_, index) => particleStyle(index, offset));
}

function stars(count: number, offset = 0) {
  return Array.from({ length: count }, (_, index) => {
    const style = particleStyle(index, offset);
    return {
      ...style,
      '--y': `${8 + ((index * 23 + offset * 7) % 80)}%`,
      '--x': `${4 + ((index * 31 + offset * 9) % 92)}%`,
    };
  });
}

function ParticleIcon({ kind }: { kind: IconKind }) {
  if (kind === 'snowflake') {
    return (
      <svg viewBox="0 0 24 24" className="holiday-effect__icon" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2v20M4.2 6.4l15.6 11.2M4.2 17.6 19.8 6.4" />
        <path d="m9 4 3 2 3-2M9 20l3-2 3 2M4.5 9.5 8 10l1-3.4M19.5 14.5 16 14l-1 3.4M4.5 14.5 8 14l1 3.4M19.5 9.5 16 10l-1-3.4" />
      </svg>
    );
  }

  if (kind === 'tree') {
    return (
      <svg viewBox="0 0 24 24" className="holiday-effect__icon" fill="currentColor">
        <path d="M12 1.6 7.1 8.5h2.6L5 15h4.3v3.2L12 22l2.7-3.8V15H19l-4.7-6.5h2.6L12 1.6Z" />
        <path d="M10.9 18.3h2.2V22h-2.2z" opacity=".7" />
      </svg>
    );
  }

  if (kind === 'pumpkin') {
    return (
      <svg viewBox="0 0 24 24" className="holiday-effect__icon" fill="currentColor">
        <path d="M12 6.7c-5.2 0-9.2 2.9-9.2 6.7s4 6.7 9.2 6.7 9.2-2.9 9.2-6.7-4-6.7-9.2-6.7Z" />
        <path d="M12 7.2c-1.8 0-3.2 2.7-3.2 6.2s1.4 6.2 3.2 6.2 3.2-2.7 3.2-6.2S13.8 7.2 12 7.2Z" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth=".8" />
        <path d="M11.2 6.5c0-1.2.4-2 1-2.6.7.4 1.2 1.3 1.2 2.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === 'heart') {
    return (
      <svg viewBox="0 0 24 24" className="holiday-effect__icon" fill="currentColor">
        <path d="M12 21s-7.6-4.7-9.5-9.2C1.2 8.3 3 4.8 6.7 4.8c2.1 0 3.5 1.2 4.5 2.5 1-1.3 2.4-2.5 4.5-2.5 3.7 0 5.5 3.5 4.2 7C19.6 16.3 12 21 12 21Z" />
      </svg>
    );
  }

  if (kind === 'flower') {
    return (
      <svg viewBox="0 0 24 24" className="holiday-effect__icon" fill="currentColor">
        <circle cx="12" cy="5.4" r="3.1" />
        <circle cx="17.6" cy="9.4" r="3.1" />
        <circle cx="15.8" cy="16" r="3.1" />
        <circle cx="8.2" cy="16" r="3.1" />
        <circle cx="6.4" cy="9.4" r="3.1" />
        <circle cx="12" cy="11.6" r="2.5" fill="var(--accent-2)" />
      </svg>
    );
  }

  if (kind === 'leaf') {
    return (
      <svg viewBox="0 0 24 24" className="holiday-effect__icon" fill="currentColor">
        <path d="M20.5 3.2C11.2 3.2 3.5 7 3.5 14.2c0 3.4 2.9 6.1 6.2 6.1 7.4 0 10.8-8.3 10.8-17.1Z" />
        <path d="M4.7 20.4c3.2-5.5 7.4-9 12.6-11.2" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === 'egg') {
    return (
      <svg viewBox="0 0 24 24" className="holiday-effect__icon" fill="currentColor">
        <ellipse cx="12" cy="12.5" rx="6.4" ry="8.8" />
        <path d="M7.7 10.2h8.6M7.5 13.4h9M7.9 16.2h8.2" fill="none" stroke="var(--accent)" strokeWidth="1.1" strokeLinecap="round" opacity=".7" />
        <circle cx="9.5" cy="7.2" r=".9" fill="rgba(255,255,255,.55)" />
        <circle cx="14.8" cy="7.8" r=".7" fill="rgba(255,255,255,.5)" />
      </svg>
    );
  }

  if (kind === 'star') {
    return (
      <svg viewBox="0 0 24 24" className="holiday-effect__icon" fill="currentColor">
        <path d="m12 2.4 2.9 6.5 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.6l7.1-.7L12 2.4Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="holiday-effect__icon" fill="currentColor">
      <path d="M12 1.8 14.4 9l7.2 2.4-7.2 2.4L12 22.2l-2.4-8.4L2.4 11.4 9.6 9 12 1.8Z" />
    </svg>
  );
}

export function HolidayEffect() {
  const { theme } = useTheme();
  const effect = theme.effect;

  const falling = useMemo(() => particles(26), []);
  const hearts = useMemo(() => particles(14, 3), []);
  const petals = useMemo(() => particles(18, 5), []);
  const starsData = useMemo(() => stars(16, 2), []);
  const leaves = useMemo(() => particles(16, 7), []);
  const eggs = useMemo(() => particles(12, 9), []);
  const sparkles = useMemo(() => stars(20, 4), []);
  const pumpkins = useMemo(() => stars(9, 11), []);
  const code = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        style: stars(1, index)[0],
        text: ['const', '=>', '{}', 'npm', 'git', '01', 'fn', '</>'][index % 8],
      })),
    [],
  );

  return (
    <div className="holiday-effect" aria-hidden="true">
      {effect === 'snow' && (
        <>
          {falling.map((style, index) => {
            const isTree = index % 3 === 0;
            return (
              <span
                key={`snow-${index}`}
                className={`holiday-effect__particle holiday-effect__particle--icon ${isTree ? 'tree-particle' : 'snowflake'}`}
                style={style}
              >
                <ParticleIcon kind={isTree ? 'tree' : 'snowflake'} />
              </span>
            );
          })}
          {starsData.slice(0, 8).map((style, index) => (
            <span key={`snow-star-${index}`} className="holiday-effect__particle holiday-effect__particle--icon sparkle-particle" style={style}>
              <ParticleIcon kind="sparkle" />
            </span>
          ))}
        </>
      )}

      {effect === 'hearts' && (
        <>
          {hearts.map((style, index) => (
            <span key={`heart-${index}`} className="holiday-effect__particle holiday-effect__particle--float holiday-effect__particle--icon heart-particle" style={style}>
              <ParticleIcon kind="heart" />
            </span>
          ))}
          {sparkles.slice(0, 10).map((style, index) => (
            <span key={`heart-star-${index}`} className="holiday-effect__particle holiday-effect__particle--icon sparkle-particle" style={style}>
              <ParticleIcon kind="sparkle" />
            </span>
          ))}
        </>
      )}

      {effect === 'petals' && (
        <>
          {petals.map((style, index) => (
            <span key={`petal-${index}`} className="holiday-effect__particle holiday-effect__particle--icon petal-particle" style={style}>
              <ParticleIcon kind="flower" />
            </span>
          ))}
        </>
      )}

      {effect === 'stars' && (
        <>
          {starsData.map((style, index) => (
            <span key={`star-${index}`} className="holiday-effect__particle holiday-effect__particle--icon star-particle" style={style}>
              <ParticleIcon kind="star" />
            </span>
          ))}
        </>
      )}

      {effect === 'leaves' && (
        <>
          {leaves.map((style, index) => (
            <span key={`leaf-${index}`} className="holiday-effect__particle holiday-effect__particle--icon leaf-particle" style={style}>
              <ParticleIcon kind="leaf" />
            </span>
          ))}
        </>
      )}

      {effect === 'eggs' && (
        <>
          {eggs.map((style, index) => (
            <span key={`egg-${index}`} className="holiday-effect__particle holiday-effect__particle--float holiday-effect__particle--icon egg-particle" style={style}>
              <ParticleIcon kind="egg" />
            </span>
          ))}
        </>
      )}

      {effect === 'pumpkins' && (
        <>
          {pumpkins.map((style, index) => (
            <span key={`pumpkin-${index}`} className="holiday-effect__particle holiday-effect__particle--icon pumpkin-particle" style={style}>
              <ParticleIcon kind="pumpkin" />
            </span>
          ))}
          {sparkles.slice(0, 12).map((style, index) => (
            <span key={`pumpkin-star-${index}`} className="holiday-effect__particle holiday-effect__particle--icon sparkle-particle" style={style}>
              <ParticleIcon kind="sparkle" />
            </span>
          ))}
        </>
      )}

      {effect === 'notebook' && (
        <>
          <div className="notebook-overlay" />
          {['А', 'Б', '1', '2', '√', '★'].map((mark, index) => (
            <span
              key={`mark-${mark}`}
              className="notebook-mark"
              style={
                {
                  '--x': `${10 + index * 15}%`,
                  '--y': `${16 + ((index * 19) % 60)}%`,
                  '--delay': `${index * 0.7}s`,
                } as ParticleStyle
              }
            >
              {mark}
            </span>
          ))}
        </>
      )}

      {effect === 'ribbon' && (
        <>
          <div className="ribbon-stripe" />
          {sparkles.slice(0, 14).map((style, index) => (
            <span key={`ribbon-star-${index}`} className="holiday-effect__particle holiday-effect__particle--icon sparkle-particle" style={style}>
              <ParticleIcon kind="sparkle" />
            </span>
          ))}
        </>
      )}

      {effect === 'scan' && (
        <>
          <div className="scan-grid" />
          <div className="scanline" />
          {code.map((item, index) => (
            <span key={`code-${index}`} className="scan-code" style={item.style}>
              {item.text}
            </span>
          ))}
        </>
      )}

      {(effect === 'sparkles' || effect === 'fireworks') && (
        <>
          {sparkles.map((style, index) => (
            <span key={`sparkle-${index}`} className="holiday-effect__particle holiday-effect__particle--icon sparkle-particle" style={style}>
              <ParticleIcon kind="sparkle" />
            </span>
          ))}
        </>
      )}
    </div>
  );
}
