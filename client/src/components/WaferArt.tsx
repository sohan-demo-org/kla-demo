import { useMemo } from 'react';

const PALETTES: Record<string, string[]> = {
  Inspection: ['#3D0A7F', '#5B2A9B', '#48A9E0'],
  Metrology: ['#1E3A8A', '#3B82C8', '#7DD3FC'],
  'Data Analytics': ['#4C1D95', '#8B5CF6', '#F0ABFC'],
  Packaging: ['#3D0A7F', '#FF8A3D', '#FDBA74'],
  'PCB & Display': ['#064E3B', '#10B981', '#A7F3D0'],
  Instruments: ['#1F2937', '#48A9E0', '#E0F2FE'],
};

function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export default function WaferArt({ name, category, className = 'h-40' }: { name: string; category: string; className?: string }) {
  const palette = PALETTES[category] ?? PALETTES.Inspection;
  const dies = useMemo(() => {
    let h = hash(name);
    const out: { x: number; y: number; fill: string; o: number }[] = [];
    for (let x = 0; x < 12; x++) {
      for (let y = 0; y < 12; y++) {
        const cx = x * 10 + 5 - 60;
        const cy = y * 10 + 5 - 60;
        if (cx * cx + cy * cy > 52 * 52) continue;
        h = Math.imul(h ^ (x * 31 + y), 2654435761) >>> 0;
        const r = (h % 100) / 100;
        out.push({ x: x * 10, y: y * 10, fill: r > 0.93 ? '#FF8A3D' : palette[r > 0.6 ? 2 : 1], o: 0.35 + r * 0.65 });
      }
    }
    return out;
  }, [name, palette]);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${palette[0]}, #0b0618)` }}>
      <svg viewBox="-10 -10 140 140" className="h-[85%] w-auto drop-shadow-[0_0_20px_rgba(72,169,224,0.35)]">
        <circle cx="60" cy="60" r="62" fill="#0b0618" stroke="rgba(255,255,255,0.35)" />
        {dies.map((d, i) => (
          <rect key={i} x={d.x + 1} y={d.y + 1} width="8" height="8" fill={d.fill} opacity={d.o} />
        ))}
        <path d="M52 121h16" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
      </svg>
    </div>
  );
}
