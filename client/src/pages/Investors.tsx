import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, useApi } from '../api';
import PageHeader from '../components/PageHeader';
import { ErrorNotice, Loading } from '../components/StateMessage';
import type { InvestorSnapshot, Quarter } from '../types';

type Series = 'revenue' | 'freeCashFlow' | 'grossMargin';
const seriesMeta: Record<Series, { label: string; format: (v: number) => string }> = {
  revenue: { label: 'Revenue', format: (v) => `$${v.toFixed(2)}B` },
  freeCashFlow: { label: 'Free Cash Flow', format: (v) => `$${v.toFixed(2)}B` },
  grossMargin: { label: 'Gross Margin', format: (v) => `${v.toFixed(1)}%` },
};

function QuarterChart({ quarters, series }: { quarters: Quarter[]; series: Series }) {
  const [hover, setHover] = useState<number | null>(null);
  const values = quarters.map((q) => q[series]);
  const max = Math.max(...values) * 1.15;
  const W = 720;
  const H = 300;
  const pad = 40;
  const bw = (W - pad * 2) / quarters.length;
  const { format } = seriesMeta[series];

  return (
    <svg viewBox={`0 0 ${W} ${H + 40}`} className="w-full" role="img" aria-label={`${seriesMeta[series].label} by quarter`}>
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1={pad} x2={W - pad} y1={H - (H - 30) * t} y2={H - (H - 30) * t} stroke="#E5E5EA" />
      ))}
      {quarters.map((q, i) => {
        const h = ((H - 30) * q[series]) / max;
        const x = pad + i * bw + bw * 0.18;
        const latest = i === quarters.length - 1;
        return (
          <g key={q.quarter} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect x={x} y={H - h} width={bw * 0.64} height={h} fill={latest ? '#48A9E0' : hover === i ? '#5B2A9B' : '#3D0A7F'} className="transition-all duration-500" />
            <text x={x + bw * 0.32} y={H - h - 8} textAnchor="middle" fontSize="13" fill="#3D0A7F" fontWeight={latest || hover === i ? 700 : 400}>
              {format(q[series])}
            </text>
            <text x={x + bw * 0.32} y={H + 22} textAnchor="middle" fontSize="12" fill="#4B4B57">
              {q.quarter}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Investors() {
  const { data, error, loading } = useApi<InvestorSnapshot>('/investors');
  const [series, setSeries] = useState<Series>('revenue');

  return (
    <>
      <PageHeader eyebrow="Investors" title={data?.headline ?? 'Investor Relations'} seed={61}>
        {data && (
          <div className="mt-10 grid max-w-3xl grid-cols-3 border-y border-white/60 py-6">
            {data.metrics.map((m, i) => (
              <div key={m.label} className={`text-center ${i > 0 ? 'border-l border-white/50' : ''}`}>
                <p className="text-3xl font-semibold text-white md:text-5xl">{m.value}</p>
                <p className="mt-1 text-sm text-white/80">{m.label}</p>
              </div>
            ))}
          </div>
        )}
      </PageHeader>
      <section className="section">
        {loading && <Loading label="Loading investor data" />}
        {error && <ErrorNotice message={error} />}
        {data && (
          <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="heading">Quarterly performance</h2>
                <div className="flex gap-2" role="group" aria-label="Chart series">
                  {(Object.keys(seriesMeta) as Series[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeries(s)}
                      aria-pressed={series === s}
                      className={`chip ${series === s ? 'border-kla-purple bg-kla-purple text-white' : 'border-kla-purple/25 text-kla-purple'}`}
                    >
                      {seriesMeta[s].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-8 border border-black/5 p-4 shadow-sm">
                <QuarterChart quarters={data.quarters} series={series} />
              </div>
              <table className="mt-8 w-full text-left text-sm">
                <thead className="border-b-2 border-kla-purple text-kla-purple">
                  <tr>
                    <th className="py-3">Quarter</th>
                    <th className="py-3 text-right">Revenue</th>
                    <th className="py-3 text-right">Gross Margin</th>
                    <th className="py-3 text-right">Free Cash Flow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {[...data.quarters].reverse().map((q) => (
                    <tr key={q.quarter}>
                      <td className="py-3 font-semibold text-kla-purple">{q.quarter}</td>
                      <td className="py-3 text-right">${q.revenue.toFixed(2)}B</td>
                      <td className="py-3 text-right">{q.grossMargin.toFixed(1)}%</td>
                      <td className="py-3 text-right">${q.freeCashFlow.toFixed(2)}B</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <aside className="space-y-8">
              <div className="bg-kla-purple p-6 text-white">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Quarterly dividend</p>
                <p className="mt-2 text-5xl font-light">{data.dividend.quarterly}</p>
                <p className="mt-2 text-sm text-white/70">per share, payable {formatDate(data.dividend.payableOn)}</p>
              </div>
              <div className="border-t-4 border-kla-sky bg-kla-mist p-6">
                <h3 className="text-lg font-semibold text-kla-purple">Upcoming events</h3>
                <ul className="mt-4 space-y-4">
                  {data.events.map((e) => (
                    <li key={e.title} className="flex gap-4">
                      <div className="w-14 shrink-0 bg-white py-1 text-center text-kla-purple shadow-sm">
                        <p className="text-xs uppercase">{formatDate(e.date, { month: 'short' })}</p>
                        <p className="text-xl font-semibold">{formatDate(e.date, { day: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-kla-purple">{e.title}</p>
                        <p className="text-xs uppercase tracking-widest text-kla-blue">{e.kind}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/newsroom?category=Earnings" className="btn-outline w-full">Earnings releases</Link>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
