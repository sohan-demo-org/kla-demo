import { useMemo, useRef, useState } from 'react';
import type { WaferDefect, WaferDetail, WaferSignature } from '../../types';
import { classColor, signatureColor } from './palette';

export interface MapLayers {
  dies: boolean;
  defects: boolean;
  missed: boolean;
}

const radiusFor = (sizeNm: number) => Math.min(3.2, Math.max(1, 0.9 + Math.sqrt(sizeNm) / 9));

export default function WaferMap({ wafer, layers, highlight }: { wafer: WaferDetail; layers: MapLayers; highlight: WaferSignature | null }) {
  const { waferRadius: R, dieSize, edgeBand, centerBand } = wafer.geometry;
  const [hover, setHover] = useState<{ defect: WaferDefect; left: number; top: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const members = useMemo(() => new Set(highlight?.type === 'Random' ? [] : highlight?.memberIds ?? []), [highlight]);
  const dimOthers = members.size > 0;

  const captured = wafer.defects.filter((d) => d.captured);
  const missed = wafer.defects.filter((d) => !d.captured);
  const ordered = dimOthers ? [...captured.filter((d) => !members.has(d.id)), ...captured.filter((d) => members.has(d.id))] : captured;

  const onHover = (defect: WaferDefect) => (e: React.MouseEvent) => {
    const rect = box.current?.getBoundingClientRect();
    if (rect) setHover({ defect, left: e.clientX - rect.left, top: e.clientY - rect.top });
  };

  return (
    <div ref={box} className="relative">
      <svg viewBox={`${-R - 6} ${-R - 6} ${2 * R + 12} ${2 * R + 12}`} className="w-full" role="img" aria-label={`Wafer map for slot ${wafer.slot}`} data-testid="wafer-map">
        <defs>
          <radialGradient id="wafer-sheen" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#DADDE8" />
          </radialGradient>
        </defs>
        <circle r={R} fill="url(#wafer-sheen)" stroke="#3D0A7F" strokeOpacity={0.35} strokeWidth={1} />
        {layers.dies &&
          wafer.dies.map((d) => (
            <rect
              key={`${d.col}-${d.row}`}
              x={d.x + 0.35}
              y={-(d.y + dieSize) + 0.35}
              width={dieSize - 0.7}
              height={dieSize - 0.7}
              fill={d.good ? '#F4F5F9' : '#F9C9CF'}
              stroke={d.good ? '#D9DCE6' : '#E8838F'}
              strokeWidth={0.35}
              data-die={d.good ? 'good' : 'bad'}
            />
          ))}
        {highlight?.type === 'Edge Ring' && <circle r={edgeBand} fill="none" stroke={signatureColor['Edge Ring']} strokeDasharray="3 3" strokeWidth={0.8} />}
        {highlight?.type === 'Center Cluster' && <circle r={centerBand} fill="none" stroke={signatureColor['Center Cluster']} strokeDasharray="3 3" strokeWidth={0.8} />}
        <path d={`M -4 ${R + 0.5} L 0 ${R - 5} L 4 ${R + 0.5} Z`} fill="white" stroke="#3D0A7F" strokeOpacity={0.35} strokeWidth={0.8} />
        {layers.missed &&
          missed.map((d) => (
            <circle
              key={`m${d.id}`}
              cx={d.x}
              cy={-d.y}
              r={radiusFor(d.sizeNm)}
              fill="none"
              stroke={d.killer ? '#C81E1E' : '#8A8FA0'}
              strokeWidth={0.45}
              strokeDasharray="1 0.8"
              onMouseMove={onHover(d)}
              onMouseLeave={() => setHover(null)}
              data-testid="missed-defect"
            />
          ))}
        {layers.defects &&
          ordered.map((d) => {
            const inSig = members.has(d.id);
            return (
              <circle
                key={d.id}
                cx={d.x}
                cy={-d.y}
                r={radiusFor(d.sizeNm) + (inSig ? 0.3 : 0)}
                fill={classColor[d.cls]}
                fillOpacity={dimOthers && !inSig ? 0.22 : 0.9}
                stroke={inSig ? signatureColor[highlight!.type] : 'white'}
                strokeWidth={inSig ? 0.7 : 0.3}
                onMouseMove={onHover(d)}
                onMouseLeave={() => setHover(null)}
                data-testid="defect"
              />
            );
          })}
      </svg>
      {hover && (
        <div
          className="pointer-events-none absolute z-10 w-48 -translate-x-1/2 bg-kla-ink/90 px-3 py-2 text-xs text-white shadow-xl"
          style={{ left: hover.left, top: hover.top + 16 }}
        >
          <p className="font-semibold">
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: classColor[hover.defect.cls] }} />
            {hover.defect.cls} · {hover.defect.sizeNm} nm
          </p>
          <p className="mt-1 text-white/70">
            ({hover.defect.x.toFixed(1)}, {hover.defect.y.toFixed(1)}) mm
          </p>
          <p className={hover.defect.killer ? 'text-red-300' : 'text-emerald-300'}>{hover.defect.killer ? 'Killer: die fails' : 'Nuisance: die still works'}</p>
          {!hover.defect.captured && <p className="text-amber-300">Below this tool&apos;s sensitivity</p>}
        </div>
      )}
    </div>
  );
}
