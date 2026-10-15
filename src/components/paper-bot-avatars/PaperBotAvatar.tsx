import React, { CSSProperties, useMemo, useState } from 'react';
import './paper-bot-avatars.css';

export type BotType =
  | 'clover' | 'flower' | 'triangle' | 'square' | 'blob' | 'ghost'
  | 'circle' | 'drop' | 'star' | 'droid' | 'mech' | 'alien'
  | 'hexagon' | 'cat' | 'cloud' | 'pill' | 'pebble' | 'puddle';
export type BotState = 'default' | 'working' | 'sleeping';
export type BotAvatarProps = {
  type?: BotType;
  state?: BotState;
  size?: number | string;
  color?: string;
  face?: 'eyes' | 'mouth';
  seed?: number;
  paused?: boolean;
  interactive?: boolean;
  className?: string;
  label?: string;
};

const COLORS: Record<BotType, string> = {
  clover: '#b6ef88', flower: '#ff8fa3', triangle: '#ff9b42', square: '#a8d9ff',
  blob: '#d9c3ff', ghost: '#fffef8', circle: '#ff8f85', drop: '#82caff',
  star: '#ffd84d', droid: '#6ed7c4', mech: '#b8b9b6', alien: '#c995ff',
  hexagon: '#ff9b42', cat: '#777875', cloud: '#a8d9ff', pill: '#ff8f85',
  pebble: '#d8d5c9', puddle: '#82caff'
};

const SHAPES: Record<BotType, React.ReactNode> = {
  clover: <path d="M50 13C39-1 20 8 22 25 4 18-4 39 11 50-2 63 12 82 29 74 35 95 61 95 68 76 88 86 103 65 88 51 103 35 85 16 69 25 68 8 53 3 50 13Z" />,
  flower: <path d="M50 12C58-1 73 7 72 22 89 13 101 29 88 42 104 54 93 72 77 69 80 89 60 96 50 80 39 96 20 87 24 70 5 75-3 55 13 45-1 30 13 13 29 23 28 7 44 2 50 12Z" />,
  triangle: <path d="M50 8Q53 5 56 11L94 78Q98 86 88 87H12Q3 86 8 77L45 12Q47 8 50 8Z" />,
  square: <path d="M23 9 82 8Q91 8 92 18L94 79Q94 89 84 90L20 92Q10 92 10 82L8 20Q8 10 18 10Z" />,
  blob: <path d="M20 78C4 70 9 52 22 44 17 24 31 10 47 18 63 1 81 15 79 34 100 43 98 64 80 72 68 91 40 91 20 78Z" />,
  ghost: <path d="M18 76C9 61 15 31 27 18 39 5 60 7 72 20 85 34 88 58 81 76L78 88 65 80 53 89 42 81 29 89Z" />,
  circle: <path d="M50 7C74 7 92 25 92 50S74 92 50 92 8 74 8 50 26 7 50 7Z" />,
  drop: <path d="M50 7C42 24 17 47 17 65A33 33 0 0 0 83 65C83 47 58 24 50 7Z" />,
  star: <path d="M50 7 62 34 92 37 70 57 76 87 50 72 24 87 30 57 8 37 38 34Z" />,
  droid: <><path d="M50 17V8" /><circle cx="50" cy="7" r="4" /><rect x="17" y="23" width="66" height="57" rx="18" /><rect x="7" y="40" width="12" height="24" rx="5" /><rect x="81" y="40" width="12" height="24" rx="5" /></>,
  mech: <><path d="M28 17 40 9 59 12 71 23 83 30 80 69 69 83 31 83 20 70 17 32Z" /><rect x="24" y="29" width="52" height="33" rx="8" /></>,
  alien: <><path d="M35 24 23 9M65 24 77 9" /><circle cx="22" cy="8" r="6" /><circle cx="78" cy="8" r="6" /><path d="M50 18C73 18 88 34 87 57 86 78 69 89 50 89S14 78 13 57C12 34 27 18 50 18Z" /></>,
  hexagon: <path d="M29 8H71L94 50 71 91H29L6 50Z" />,
  cat: <path d="M15 43 18 12 40 28Q50 24 60 28L82 12 85 43Q94 60 80 77 66 91 50 88 31 91 19 75 7 60 15 43Z" />,
  cloud: <path d="M24 75C8 75 4 61 12 50 16 43 23 41 29 43 31 24 50 17 64 29 73 24 88 31 87 44 103 49 99 69 84 73Z" />,
  pill: <><rect x="9" y="25" width="82" height="50" rx="25" /><path d="M50 26V74" /></>,
  pebble: <path d="M12 64C16 43 34 17 52 15 72 14 90 40 89 58 88 77 67 86 47 85 27 85 8 81 12 64Z" />,
  puddle: <path d="M10 65C2 53 14 43 27 45 31 27 48 21 60 33 72 25 87 34 86 47 101 48 102 65 88 71 74 80 28 83 10 65Z" />
};

// Each face is positioned for its silhouette instead of forcing every avatar to use the same eyes.
const FACE: Record<BotType, { y: number; gap: number; rx: number; ry: number; glint?: boolean }> = {
  clover: { y: 45, gap: 13, rx: 5.8, ry: 7.4 }, flower: { y: 46, gap: 13, rx: 5.8, ry: 7.2 },
  triangle: { y: 54, gap: 12, rx: 5.6, ry: 6.8 }, square: { y: 44, gap: 13, rx: 5.8, ry: 7.2 },
  blob: { y: 46, gap: 13, rx: 6, ry: 7.7 }, ghost: { y: 44, gap: 13, rx: 5.8, ry: 7.4 },
  circle: { y: 44, gap: 13, rx: 6.2, ry: 7.7 }, drop: { y: 54, gap: 11, rx: 5.5, ry: 6.8 },
  star: { y: 51, gap: 12, rx: 5.2, ry: 6.4 }, droid: { y: 45, gap: 13, rx: 5.8, ry: 6.2 },
  mech: { y: 43, gap: 12, rx: 6, ry: 4.2 }, alien: { y: 49, gap: 12, rx: 7.4, ry: 10, glint: false },
  hexagon: { y: 46, gap: 13, rx: 5.8, ry: 7.2 }, cat: { y: 49, gap: 12, rx: 5.4, ry: 6.7 },
  cloud: { y: 50, gap: 12, rx: 5.8, ry: 7.2 }, pill: { y: 48, gap: 12, rx: 5.8, ry: 6.8 },
  pebble: { y: 48, gap: 12, rx: 5.8, ry: 7.1 }, puddle: { y: 52, gap: 12, rx: 5.8, ry: 6.8 }
};

export function PaperBotAvatar({
  type = 'clover', state = 'default', size = 64, color, face = 'eyes', seed = 0,
  paused = false, interactive = true, className = '', label
}: BotAvatarProps) {
  const [clicked, setClicked] = useState(false);
  const bodyColor = color || COLORS[type];
  const delay = `${Math.max(0, Math.min(1, seed)) * -1.7}s`;
  const style = {
    '--bot-size': typeof size === 'number' ? `${size}px` : size,
    '--bot-color': bodyColor,
    '--bot-delay': delay,
    animationPlayState: paused ? 'paused' : 'running'
  } as CSSProperties;
  const aria = label || `${type} bot avatar, ${state}`;
  const layout = FACE[type];

  const faceBits = useMemo(() => {
    const isSleeping = state === 'sleeping';
    return <g className={`pb-face ${isSleeping ? 'pb-eyes-closed' : ''}`}>
      {type === 'mech' ? (
        <>
          <rect x={50 - layout.gap - layout.rx} y={layout.y - layout.ry} width={layout.rx * 2} height={layout.ry * 2} rx="2.5" className="pb-eye pb-eye--mech" />
          <rect x={50 + layout.gap - layout.rx} y={layout.y - layout.ry} width={layout.rx * 2} height={layout.ry * 2} rx="2.5" className="pb-eye pb-eye--mech" />
        </>
      ) : (
        <>
          <ellipse className="pb-eye" cx={50 - layout.gap} cy={layout.y} rx={layout.rx} ry={layout.ry} />
          <ellipse className="pb-eye" cx={50 + layout.gap} cy={layout.y} rx={layout.rx} ry={layout.ry} />
          {layout.glint !== false && <>
            <ellipse className="pb-glint" cx={51 - layout.gap} cy={layout.y - layout.ry * 0.38} rx={Math.max(1.3, layout.rx * 0.3)} ry={Math.max(1.7, layout.ry * 0.3)} />
            <ellipse className="pb-glint" cx={51 + layout.gap} cy={layout.y - layout.ry * 0.38} rx={Math.max(1.3, layout.rx * 0.3)} ry={Math.max(1.7, layout.ry * 0.3)} />
          </>}
        </>
      )}
      {face === 'mouth' && <path className="pb-mouth" d={`M42 ${layout.y + 12}Q50 ${layout.y + 20} 58 ${layout.y + 12}`} />}
      {isSleeping && <g className="pb-zzz"><path d="M75 17h10l-10 9h10" /><text x="80" y="12">z</text></g>}
    </g>;
  }, [face, layout, state, type]);

  return (
    <button
      type="button"
      className={`paper-bot paper-bot--${type} paper-bot--${state} ${clicked ? 'is-clicked' : ''} ${className}`}
      style={style}
      aria-label={aria}
      onClick={() => {
        if (!interactive) return;
        setClicked(true);
        window.setTimeout(() => setClicked(false), 680);
      }}
      tabIndex={interactive ? 0 : -1}
    >
      <svg className="pb-svg" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <filter id={`pb-paper-${type}-${seed}`} x="-25%" y="-25%" width="160%" height="170%">
            <feTurbulence type="fractalNoise" baseFrequency=".055" numOctaves="2" seed={Math.round(seed * 100) + 4} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.05" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g className="pb-art">
          <g className="pb-shadow" transform="translate(3 5)">{SHAPES[type]}</g>
          <g className="pb-body" filter={`url(#pb-paper-${type}-${seed})`}>{SHAPES[type]}</g>
          <path className="pb-paper-fleck" d="M25 22l5-2M68 76l4-2M18 60l3-1" />
        </g>
        <g className="pb-face-wrap">{faceBits}</g>
      </svg>
      <span className="pb-sr-only">{aria}</span>
    </button>
  );
}

export default PaperBotAvatar;
