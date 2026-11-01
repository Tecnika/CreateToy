import { useId } from 'react';
import type { ProductArt } from '../../core/domain/types';

interface SouvenirArtProps {
  art: ProductArt;
  label?: string;
  className?: string;
}

export function SouvenirArt({ art, label, className = '' }: SouvenirArtProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const gradientId = `art-gradient-${rawId}`;
  const glowId = `art-glow-${rawId}`;
  const shadowId = `art-shadow-${rawId}`;
  const [main, secondary, tertiary] = art.colors;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 400 400"
        role="img"
        aria-label={label ?? '3D-сувенир CreateToy'}
        className="h-full w-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={main} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
          <radialGradient id={glowId} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor={tertiary} stopOpacity="0.9" />
            <stop offset="100%" stopColor={tertiary} stopOpacity="0" />
          </radialGradient>
          <filter id={shadowId} x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.18" />
          </filter>
        </defs>

        <circle cx="200" cy="195" r="165" fill={`url(#${glowId})`} opacity="0.95" />
        <ellipse cx="200" cy="337" rx="105" ry="17" fill="#000000" opacity="0.13" />
        <circle cx="68" cy="82" r="7" fill={tertiary} opacity="0.55" />
        <circle cx="330" cy="112" r="5" fill={secondary} opacity="0.55" />
        <path d="M320 290l7 14 15 2-11 11 3 15-14-7-14 7 3-15-11-11 15-2 7-14Z" fill={tertiary} opacity="0.4" />

        <g filter={`url(#${shadowId})`}>{renderShape(art.kind, main, secondary, tertiary, gradientId)}</g>
      </svg>
    </div>
  );
}

function renderShape(
  kind: ProductArt['kind'],
  main: string,
  secondary: string,
  tertiary: string,
  gradientId: string,
) {
  const gradient = `url(#${gradientId})`;

  switch (kind) {
    case 'snowman':
      return (
        <g>
          <circle cx="200" cy="272" r="72" fill={gradient} />
          <circle cx="200" cy="190" r="50" fill={gradient} />
          <path d="M150 175h100l-10-34h-80l-10 34Z" fill={secondary} />
          <rect x="168" y="115" width="64" height="20" rx="8" fill={tertiary} />
          <path d="M168 118h64v-20c0-11-9-20-20-20h-24c-11 0-20 9-20 20v20Z" fill={secondary} />
          <path d="M152 211c18 14 78 14 96 0v17c-20 14-76 14-96 0v-17Z" fill={secondary} />
          <circle cx="183" cy="185" r="4.5" fill={tertiary} />
          <circle cx="217" cy="185" r="4.5" fill={tertiary} />
          <path d="M200 195l12 7-12 7-12-7 12-7Z" fill={tertiary} />
          <circle cx="200" cy="245" r="5" fill={tertiary} opacity="0.8" />
          <circle cx="200" cy="270" r="5" fill={tertiary} opacity="0.8" />
          <path d="M130 235l-35-20M270 235l35-20" stroke={secondary} strokeWidth="6" strokeLinecap="round" />
        </g>
      );
    case 'tree':
      return (
        <g>
          <rect x="184" y="285" width="32" height="38" rx="8" fill={secondary} />
          <path d="M200 90l75 100h-45l55 70h-65l50 55H130l50-55h-65l55-70h-45L200 90Z" fill={gradient} />
          <path d="M200 90l20 28h-40l20-28Z" fill={tertiary} />
          <circle cx="165" cy="218" r="6" fill={tertiary} />
          <circle cx="238" cy="240" r="5" fill={tertiary} />
          <circle cx="190" cy="265" r="5" fill={tertiary} />
          <circle cx="220" cy="180" r="5" fill={tertiary} />
        </g>
      );
    case 'pumpkin':
      return (
        <g>
          <ellipse cx="200" cy="240" rx="88" ry="72" fill={gradient} />
          <ellipse cx="137" cy="240" rx="42" ry="68" fill={secondary} opacity="0.7" />
          <ellipse cx="263" cy="240" rx="42" ry="68" fill={secondary} opacity="0.7" />
          <path d="M193 178c-4-25 10-40 24-48 2 19-3 33-13 48h-11Z" fill={tertiary} />
          <path d="M155 238l26-22 16 28-42-6Z" fill={tertiary} />
          <path d="M245 238l-26-22-16 28 42-6Z" fill={tertiary} />
          <path d="M172 276c17 17 39 17 56 0" stroke={tertiary} strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M200 190c14 0 23 12 23 25" stroke={secondary} strokeWidth="4" opacity="0.5" fill="none" />
        </g>
      );
    case 'heart':
      return (
        <g>
          <path
            d="M200 310C135 266 90 226 90 172c0-38 29-66 64-66 22 0 38 10 46 28 8-18 24-28 46-28 35 0 64 28 64 66 0 54-45 94-110 138Z"
            fill={gradient}
          />
          <path d="M143 155c10-21 31-28 48-15" stroke={tertiary} strokeWidth="8" strokeLinecap="round" opacity="0.6" fill="none" />
          <path d="M200 280c-42-30-74-60-74-102" stroke={secondary} strokeWidth="5" opacity="0.4" fill="none" />
          <circle cx="292" cy="120" r="8" fill={tertiary} opacity="0.6" />
        </g>
      );
    case 'rocket':
      return (
        <g>
          <path d="M200 86c48 40 61 92 44 152l-44 42-44-42c-17-60-4-112 44-152Z" fill={gradient} />
          <path d="M156 206l-32 55 50-17M244 206l32 55-50-17" fill={secondary} />
          <circle cx="200" cy="176" r="24" fill={tertiary} />
          <circle cx="200" cy="176" r="14" fill={main} opacity="0.45" />
          <path d="M200 286l-16 35 16-9 16 9-16-35Z" fill={tertiary} />
          <path d="M200 305l-8 22 8-5 8 5-8-22Z" fill={secondary} />
          <path d="M184 225h32" stroke={tertiary} strokeWidth="5" strokeLinecap="round" opacity="0.6" />
        </g>
      );
    case 'bouquet':
      return (
        <g>
          <path d="M200 300V190M200 230l-40-50M200 220l42-46M200 250l-55-35M200 245l58-32" stroke={tertiary} strokeWidth="7" strokeLinecap="round" />
          <circle cx="160" cy="135" r="32" fill={gradient} />
          <circle cx="242" cy="128" r="28" fill={secondary} />
          <circle cx="145" cy="215" r="24" fill={secondary} />
          <circle cx="258" cy="213" r="25" fill={gradient} />
          <circle cx="200" cy="108" r="26" fill={tertiary} />
          <circle cx="160" cy="135" r="10" fill={tertiary} opacity="0.6" />
          <circle cx="242" cy="128" r="9" fill={tertiary} opacity="0.6" />
          <path d="M158 278h84l-14 52h-56l-14-52Z" fill={main} opacity="0.9" />
        </g>
      );
    case 'egg':
      return (
        <g>
          <path d="M200 95c54 0 88 76 88 132 0 55-39 88-88 88s-88-33-88-88c0-56 34-132 88-132Z" fill={gradient} />
          <path d="M140 185c38 18 82 18 120 0M130 235c45 18 95 18 140 0M150 275c32 12 68 12 100 0" stroke={tertiary} strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.7" />
          <circle cx="166" cy="158" r="7" fill={secondary} opacity="0.55" />
          <circle cx="232" cy="210" r="5" fill={secondary} opacity="0.55" />
        </g>
      );
    case 'organizer':
      return (
        <g>
          <rect x="92" y="180" width="216" height="130" rx="28" fill={gradient} />
          <rect x="112" y="200" width="78" height="38" rx="12" fill={tertiary} opacity="0.8" />
          <rect x="202" y="200" width="86" height="38" rx="12" fill={secondary} opacity="0.65" />
          <rect x="112" y="250" width="176" height="40" rx="12" fill={main} opacity="0.5" />
          <rect x="132" y="128" width="15" height="80" rx="7" fill={tertiary} />
          <rect x="158" y="112" width="15" height="96" rx="7" fill={secondary} />
          <rect x="184" y="138" width="15" height="70" rx="7" fill={tertiary} />
          <path d="M132 128l7-18 8 18" fill={tertiary} />
        </g>
      );
    case 'badge':
      return (
        <g>
          <circle cx="200" cy="190" r="96" fill={gradient} />
          <path d="M200 128l20 42 46 6-34 32 9 46-41-22-41 22 9-46-34-32 46-6 20-42Z" fill={tertiary} />
          <path d="M160 270l-20 70 60-28 60 28-20-70" fill={secondary} />
          <circle cx="200" cy="190" r="76" fill="none" stroke={tertiary} strokeWidth="3" opacity="0.55" />
        </g>
      );
    case 'leaf':
      return (
        <g>
          <path d="M200 300C132 260 102 202 128 140c62-18 122 4 146 66-12 52-40 80-74 94Z" fill={gradient} />
          <path d="M200 300V150M200 220l-44-34M200 250l-54-28M200 190l38-34M200 235l48-30" stroke={tertiary} strokeWidth="5" strokeLinecap="round" opacity="0.65" />
          <path d="M200 300c24 8 38 24 40 42" stroke={secondary} strokeWidth="8" strokeLinecap="round" fill="none" />
        </g>
      );
    case 'vase':
      return (
        <g>
          <path d="M150 215c8 44 20 78 50 92 30-14 42-48 50-92h-100Z" fill={gradient} />
          <path d="M150 215h100l-8-30H158l-8 30Z" fill={secondary} />
          <path d="M200 185V120M200 150l-38-30M200 145l40-26" stroke={tertiary} strokeWidth="6" strokeLinecap="round" />
          <circle cx="160" cy="118" r="24" fill={secondary} />
          <circle cx="242" cy="118" r="22" fill={tertiary} />
          <circle cx="200" cy="92" r="20" fill={gradient} />
          <circle cx="160" cy="118" r="8" fill={tertiary} opacity="0.65" />
          <path d="M168 260h64" stroke={tertiary} strokeWidth="5" strokeLinecap="round" opacity="0.5" />
        </g>
      );
    case 'box':
    case 'gift':
      return (
        <g>
          <rect x="105" y="178" width="190" height="130" rx="20" fill={gradient} />
          <rect x="92" y="150" width="216" height="52" rx="18" fill={secondary} />
          <rect x="188" y="150" width="24" height="158" fill={tertiary} />
          <path d="M200 150c-34-42-76-42-78-8-1 16 17 26 36 24 17-2 30-9 42-16Z" fill={tertiary} />
          <path d="M200 150c34-42 76-42 78-8 1 16-17 26-36 24-17-2-30-9-42-16Z" fill={tertiary} />
          <circle cx="200" cy="150" r="14" fill={main} />
        </g>
      );
    case 'keychain':
      return (
        <g>
          <circle cx="200" cy="126" r="30" fill="none" stroke={tertiary} strokeWidth="10" />
          <rect x="136" y="156" width="128" height="142" rx="34" fill={gradient} />
          <rect x="154" y="180" width="92" height="74" rx="18" fill={tertiary} opacity="0.9" />
          <text x="200" y="228" textAnchor="middle" fontFamily="Unbounded, sans-serif" fontSize="26" fontWeight="700" fill={main}>CT</text>
          <path d="M170 276h60" stroke={secondary} strokeWidth="7" strokeLinecap="round" />
          <circle cx="200" cy="300" r="8" fill={secondary} />
        </g>
      );
    case 'cat':
      return (
        <g>
          <path d="M128 176l-6-70 58 28M272 176l6-70-58 28" fill={secondary} />
          <path d="M124 190c0-62 34-96 76-96s76 34 76 96c0 64-32 104-76 104s-76-40-76-104Z" fill={gradient} />
          <ellipse cx="200" cy="238" rx="54" ry="44" fill={tertiary} opacity="0.35" />
          <circle cx="172" cy="194" r="7" fill={tertiary} />
          <circle cx="228" cy="194" r="7" fill={tertiary} />
          <path d="M200 210l10 8-10 8-10-8 10-8Z" fill={tertiary} />
          <path d="M200 226v10M200 236c-10 12-24 12-32 2M200 236c10 12 24 12 32 2" stroke={tertiary} strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M160 220l-42-8M160 234l-44 4M240 220l42-8M240 234l44 4" stroke={tertiary} strokeWidth="3" strokeLinecap="round" opacity="0.65" />
        </g>
      );
    case 'bunny':
      return (
        <g>
          <ellipse cx="166" cy="130" rx="24" ry="66" fill={secondary} transform="rotate(-12 166 130)" />
          <ellipse cx="234" cy="130" rx="24" ry="66" fill={secondary} transform="rotate(12 234 130)" />
          <ellipse cx="166" cy="132" rx="11" ry="44" fill={tertiary} transform="rotate(-12 166 132)" opacity="0.55" />
          <ellipse cx="234" cy="132" rx="11" ry="44" fill={tertiary} transform="rotate(12 234 132)" opacity="0.55" />
          <ellipse cx="200" cy="225" rx="86" ry="80" fill={gradient} />
          <circle cx="172" cy="215" r="7" fill={tertiary} />
          <circle cx="228" cy="215" r="7" fill={tertiary} />
          <path d="M200 232l9 7-9 7-9-7 9-7Z" fill={tertiary} />
          <path d="M200 246c-8 12-20 12-28 2M200 246c8 12 20 12 28 2" stroke={tertiary} strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M132 275c18 24 118 24 136 0" stroke={secondary} strokeWidth="6" strokeLinecap="round" opacity="0.55" fill="none" />
        </g>
      );
    default:
      return (
        <g>
          <rect x="108" y="168" width="184" height="142" rx="26" fill={gradient} />
          <rect x="96" y="145" width="208" height="46" rx="16" fill={secondary} />
          <rect x="188" y="145" width="24" height="165" fill={tertiary} />
          <path d="M200 145c-30-38-68-38-70-6-1 14 15 23 32 21 16-1 27-8 38-15Z" fill={tertiary} />
          <path d="M200 145c30-38 68-38 70-6 1 14-15 23-32 21-16-1-27-8-38-15Z" fill={tertiary} />
        </g>
      );
  }
}
