import { useMemo, type CSSProperties } from 'react';
import { Heart } from 'lucide-react';
import { useTheme } from '../../state/ThemeContext';

type ParticleStyle = CSSProperties & Record<string, string | number>;

function particleStyle(index: number, offset = 0): ParticleStyle {
  const x = (index * 37 + offset * 17) % 100;
  const y = (index * 29 + offset * 11) % 82;
  const delay = ((index * 13 + offset) % 24) / 10;
  const duration = 8 + ((index * 7 + offset) % 10);
  const size = 5 + ((index * 11 + offset) % 15);
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
          {falling.map((style, index) => (
            <span key={`snow-${index}`} className="holiday-effect__particle snowflake" style={style} />
          ))}
          {starsData.slice(0, 8).map((style, index) => (
            <span key={`snow-star-${index}`} className="sparkle-dot" style={style} />
          ))}
        </>
      )}

      {effect === 'hearts' && (
        <>
          {hearts.map((style, index) => (
            <Heart
              key={`heart-${index}`}
              className="holiday-effect__particle holiday-effect__particle--float heart-particle"
              style={style}
              fill="currentColor"
              strokeWidth={0}
            />
          ))}
          {sparkles.slice(0, 10).map((style, index) => (
            <span key={`heart-star-${index}`} className="sparkle-dot" style={style} />
          ))}
        </>
      )}

      {effect === 'petals' && (
        <>
          {petals.map((style, index) => (
            <span key={`petal-${index}`} className="holiday-effect__particle petal-particle" style={style} />
          ))}
        </>
      )}

      {effect === 'stars' && (
        <>
          {starsData.map((style, index) => (
            <span key={`star-${index}`} className="holiday-effect__particle star-particle" style={style} />
          ))}
        </>
      )}

      {effect === 'leaves' && (
        <>
          {leaves.map((style, index) => (
            <span key={`leaf-${index}`} className="holiday-effect__particle leaf-particle" style={style} />
          ))}
        </>
      )}

      {effect === 'eggs' && (
        <>
          {eggs.map((style, index) => (
            <span
              key={`egg-${index}`}
              className="holiday-effect__particle holiday-effect__particle--float egg-particle"
              style={style}
            />
          ))}
        </>
      )}

      {effect === 'pumpkins' && (
        <>
          {pumpkins.map((style, index) => (
            <span key={`pumpkin-${index}`} className="holiday-effect__particle pumpkin-particle" style={style} />
          ))}
          {sparkles.slice(0, 12).map((style, index) => (
            <span key={`pumpkin-star-${index}`} className="sparkle-dot" style={style} />
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
            <span key={`ribbon-star-${index}`} className="sparkle-dot" style={style} />
          ))}
        </>
      )}

      {effect === 'scan' && (
        <>
          <div className="scan-grid" />
          <div className="scanline" />
          {code.map((item, index) => (
            <span
              key={`code-${index}`}
              className="scan-code"
              style={item.style}
            >
              {item.text}
            </span>
          ))}
        </>
      )}

      {(effect === 'sparkles' || effect === 'fireworks') && (
        <>
          {sparkles.map((style, index) => (
            <span key={`sparkle-${index}`} className="sparkle-dot" style={style} />
          ))}
        </>
      )}
    </div>
  );
}

