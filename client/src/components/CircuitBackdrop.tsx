import { useMemo } from 'react';

const COLORS = ['#FF8A3D', '#4AA3FF', '#9B6BFF', '#3ED0FF', '#FF5FA2', '#6E7BFF'];

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

interface Trace {
  d: string;
  color: string;
  width: number;
  pulse: boolean;
  delay: number;
}

function buildTraces(seed: number, count: number) {
  const rand = rng(seed);
  const traces: Trace[] = [];
  for (let i = 0; i < count; i++) {
    let x = Math.round(rand() * 60) * 20;
    let y = Math.round(rand() * 40) * 20;
    let d = `M${x} ${y}`;
    const steps = 3 + Math.floor(rand() * 5);
    for (let s = 0; s < steps; s++) {
      const len = (2 + Math.floor(rand() * 10)) * 20;
      const dir = Math.floor(rand() * 4);
      if (dir === 0) x += len;
      else if (dir === 1) y += len;
      else if (dir === 2) {
        x += len * 0.7;
        y += len * 0.7;
      } else x -= len;
      d += ` L${Math.round(x)} ${Math.round(y)}`;
    }
    traces.push({
      d,
      color: COLORS[Math.floor(rand() * COLORS.length)],
      width: rand() > 0.8 ? 2.4 : 1.1,
      pulse: rand() > 0.55,
      delay: -rand() * 7,
    });
  }
  const chips = Array.from({ length: 14 }, () => ({
    x: Math.round(rand() * 55) * 20,
    y: Math.round(rand() * 35) * 20,
    w: (2 + Math.floor(rand() * 5)) * 20,
    h: (2 + Math.floor(rand() * 4)) * 20,
    color: COLORS[Math.floor(rand() * COLORS.length)],
  }));
  return { traces, chips };
}

export default function CircuitBackdrop({ seed = 7, density = 70, className = '' }: { seed?: number; density?: number; className?: string }) {
  const { traces, chips } = useMemo(() => buildTraces(seed, density), [seed, density]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        className="absolute -right-[10%] top-[-25%] h-[150%] w-[85%] origin-center [transform:perspective(1100px)_rotateX(38deg)_rotateZ(-18deg)]"
      >
        <defs>
          <filter id={`glow-${seed}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id={`grid-${seed}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(120,140,255,0.12)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1200" height="800" fill={`url(#grid-${seed})`} />
        {chips.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill="rgba(40,30,90,0.35)" stroke={c.color} strokeOpacity="0.35" />
        ))}
        <g filter={`url(#glow-${seed})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {traces.map((t, i) => (
            <path key={i} d={t.d} stroke={t.color} strokeWidth={t.width} strokeOpacity="0.45" />
          ))}
          {traces
            .filter((t) => t.pulse)
            .map((t, i) => (
              <path key={`p${i}`} d={t.d} stroke="#fff" strokeWidth={t.width + 0.8} className="trace-pulse" style={{ animationDelay: `${t.delay}s` }} />
            ))}
        </g>
      </svg>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#000_0%,#000_38%,rgba(0,0,0,0.55)_58%,rgba(10,5,40,0.25)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_30%,rgba(120,60,220,0.35),transparent_55%),radial-gradient(ellipse_at_95%_90%,rgba(255,120,40,0.18),transparent_45%)]" />
    </div>
  );
}
