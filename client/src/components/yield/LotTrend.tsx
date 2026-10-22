import type { ControlLimits, WaferSummary } from '../../types';
import { signatureColor } from './palette';

export default function LotTrend({ wafers, limits, selected, onSelect }: { wafers: WaferSummary[]; limits: ControlLimits; selected: number; onSelect: (slot: number) => void }) {
  const W = 960;
  const H = 250;
  const left = 48;
  const right = 92;
  const top = 18;
  const bottom = 210;
  const floor = Math.max(0, Math.floor((Math.min(limits.lower, ...wafers.map((w) => w.yield)) - 4) / 5) * 5);
  const y = (v: number) => bottom - ((v - floor) / (100 - floor)) * (bottom - top);
  const bw = (W - left - right) / wafers.length;
  const ticks = Array.from({ length: Math.floor((100 - floor) / 10) + 1 }, (_, i) => 100 - i * 10).filter((t) => t >= floor);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Die yield by wafer slot with control limits" data-testid="lot-trend">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={left} x2={W - right} y1={y(t)} y2={y(t)} stroke="#ECECF1" />
          <text x={left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#4B4B57">{t}%</text>
        </g>
      ))}
      {wafers.map((w, i) => {
        const x = left + i * bw;
        const isSel = w.slot === selected;
        const color = signatureColor[w.signature];
        return (
          <g
            key={w.slot}
            role="button"
            tabIndex={0}
            aria-label={`Slot ${w.slot}: ${w.yield}% yield, ${w.signature}${w.flagged ? ', flagged' : ''}`}
            aria-pressed={isSel}
            onClick={() => onSelect(w.slot)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(w.slot)}
            className="cursor-pointer outline-none"
            data-testid={`slot-${w.slot}`}
          >
            <rect x={x} y={top - 10} width={bw} height={bottom - top + 44} fill={isSel ? '#3D0A7F' : 'transparent'} fillOpacity={isSel ? 0.08 : 0} />
            <rect
              x={x + bw * 0.18}
              y={y(w.yield)}
              width={bw * 0.64}
              height={bottom - y(w.yield)}
              fill={color}
              fillOpacity={w.signature === 'Random' ? 0.45 : 0.95}
              stroke={isSel ? '#3D0A7F' : 'none'}
              strokeWidth={2}
              className="transition-all duration-500"
            >
              <title>{`Slot ${w.slot} · ${w.chamber}\nYield ${w.yield}% · ${w.defects} defects captured\n${w.signature}`}</title>
            </rect>
            {w.yieldAlarm && (
              <path d={`M ${x + bw / 2 - 5} ${y(w.yield) - 12} l 5 9 l 5 -9 Z`} fill="#C81E1E">
                <title>Below lower control limit</title>
              </path>
            )}
            <text x={x + bw / 2} y={bottom + 16} textAnchor="middle" fontSize="11" fontWeight={isSel ? 700 : 400} fill={isSel ? '#3D0A7F' : '#4B4B57'}>{w.slot}</text>
            <text x={x + bw / 2} y={bottom + 31} textAnchor="middle" fontSize="8.5" fill="#8A8FA0">{w.chamber.replace(/^(Platen|Chuck) /, '')}</text>
          </g>
        );
      })}
      <line x1={left} x2={W - right} y1={y(limits.center)} y2={y(limits.center)} stroke="#3D0A7F" strokeOpacity={0.5} strokeDasharray="2 4" />
      <text x={W - right + 6} y={y(limits.center) + 4} fontSize="11" fill="#3D0A7F">Mean {limits.center}%</text>
      <line x1={left} x2={W - right} y1={y(limits.lower)} y2={y(limits.lower)} stroke="#C81E1E" strokeDasharray="6 4" strokeWidth={1.5} />
      <text x={W - right + 6} y={y(limits.lower) + 4} fontSize="11" fill="#C81E1E" fontWeight={600}>LCL {limits.lower}%</text>
    </svg>
  );
}
