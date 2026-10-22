import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiPost, formatDate, issuesByField, useApi } from '../api';
import PageHeader from '../components/PageHeader';
import { ErrorNotice, Loading } from '../components/StateMessage';
import LotTrend from '../components/yield/LotTrend';
import { classColor, signatureColor, signatureLabel } from '../components/yield/palette';
import WaferMap, { type MapLayers } from '../components/yield/WaferMap';
import type { DefectClass, Excursion, InspectionTool, LotDetail, LotSummary, SignatureType, WaferDetail } from '../types';

const signatureOptions: SignatureType[] = ['Scratch', 'Reticle Repeater', 'Edge Ring', 'Center Cluster', 'Random'];
const excursionRef = (id: number) => `EXC-${String(id).padStart(5, '0')}`;
const pct = (v: number) => `${Math.round(v * 100)}%`;

function Stat({ label, value, sub, tone = 'text-kla-purple' }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div>
      <p className={`text-3xl font-light ${tone}`}>{value}</p>
      <p className="text-xs uppercase tracking-widest text-kla-slate">{label}</p>
      {sub && <p className="mt-1 text-xs text-kla-slate">{sub}</p>}
    </div>
  );
}

function Pareto({ counts }: { counts: Partial<Record<DefectClass, number>> }) {
  const rows = (Object.entries(counts) as [DefectClass, number][]).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <ul className="space-y-2">
      {rows.map(([cls, n]) => (
        <li key={cls} className="grid grid-cols-[72px_1fr_36px] items-center gap-3 text-sm">
          <span className="text-kla-slate">{cls}</span>
          <span className="h-3 bg-kla-mist">
            <span className="block h-3 transition-all duration-500" style={{ width: `${(n / max) * 100}%`, background: classColor[cls] }} />
          </span>
          <span className="text-right font-semibold text-kla-purple">{n}</span>
        </li>
      ))}
      {rows.length === 0 && <li className="text-sm text-kla-slate">No defects captured at this sensitivity.</li>}
    </ul>
  );
}

function ExcursionForm({ lot, onCreated }: { lot: LotDetail; onCreated: () => void }) {
  const flagged = lot.wafers.filter((w) => w.flagged).map((w) => w.slot);
  const topSignature = (Object.entries(lot.summary.signatures) as [SignatureType, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Random';
  const [slots, setSlots] = useState<number[]>(flagged);
  const [signature, setSignature] = useState<SignatureType>(topSignature);
  const [owner, setOwner] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [created, setCreated] = useState<Excursion | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (slot: number) => setSlots((s) => (s.includes(slot) ? s.filter((x) => x !== slot) : [...s, slot].sort((a, b) => a - b)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFailure(null);
    try {
      const exc = await apiPost<Excursion>('/yield/excursions', { lotId: lot.id, slots, signature, owner, note });
      setCreated(exc);
      onCreated();
    } catch (err) {
      const fields = issuesByField(err);
      setErrors(fields);
      if (!Object.keys(fields).length) setFailure((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <div className="border-l-4 border-emerald-500 bg-emerald-50 p-6" role="status">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Excursion opened</p>
        <p className="mt-2 text-3xl font-light text-kla-purple" data-testid="excursion-ref">{excursionRef(created.id)}</p>
        <p className="mt-2 text-sm text-kla-slate">
          {signatureLabel(created.signature)} on lot {created.lotId}, slots {created.slots.join(', ')}. Owner: {created.owner}.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/admin?tab=excursions" className="btn-primary">View in demo console</Link>
          <button type="button" className="btn-outline" onClick={() => setCreated(null)}>Open another</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <p className="label">Affected wafers</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Affected wafers">
          {lot.wafers.map((w) => (
            <button
              key={w.slot}
              type="button"
              onClick={() => toggle(w.slot)}
              aria-pressed={slots.includes(w.slot)}
              className={`h-8 w-8 border text-xs font-semibold transition ${
                slots.includes(w.slot) ? 'border-kla-purple bg-kla-purple text-white' : w.flagged ? 'border-red-300 text-red-700' : 'border-black/10 text-kla-slate'
              }`}
            >
              {w.slot}
            </button>
          ))}
        </div>
        {errors.slots && <p className="field-error">{errors.slots}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">Signature</span>
          <select className="input" value={signature} onChange={(e) => setSignature(e.target.value as SignatureType)}>
            {signatureOptions.map((s) => (
              <option key={s} value={s}>{signatureLabel(s)}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Owner</span>
          <input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="e.g. CMP module team" />
          {errors.owner && <span className="field-error block">{errors.owner}</span>}
        </label>
      </div>
      <label className="block">
        <span className="label">Containment note</span>
        <textarea className="input min-h-[84px]" value={note} onChange={(e) => setNote(e.target.value)} placeholder={`e.g. Hold ${lot.processTool} and disposition affected wafers`} />
        {errors.note && <span className="field-error block">{errors.note}</span>}
      </label>
      {failure && <ErrorNotice message={failure} />}
      <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Opening…' : 'Open excursion'}</button>
    </form>
  );
}

export default function YieldLab() {
  const [params, setParams] = useSearchParams();
  const update = (next: Record<string, string | null>) =>
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(next)) {
          if (v === null) p.delete(k);
          else p.set(k, v);
        }
        return p;
      },
      { replace: true },
    );

  const { data: tools } = useApi<InspectionTool[]>('/yield/tools');
  const toolId = params.get('tool') ?? '39xx';
  const preset = tools?.find((t) => t.id === toolId);
  const minSize = preset?.minSizeNm ?? (Number(params.get('nm')) || 25);

  const { data: lots, error: lotsError } = useApi<LotSummary[]>(tools ? `/yield/lots?minSize=${minSize}` : null);
  const lotId = params.get('lot') ?? lots?.[0]?.id ?? null;
  const { data: lot, error: lotError, refetch: refetchLot } = useApi<LotDetail>(lotId && tools ? `/yield/lots/${lotId}?minSize=${minSize}` : null);
  const lotReady = lot && lot.id === lotId;
  const slot = Number(params.get('slot')) || (lotReady ? lot.wafers.find((w) => w.signature !== 'Random')?.slot ?? lot.wafers.find((w) => w.flagged)?.slot ?? 1 : null);
  const { data: wafer, error: waferError } = useApi<WaferDetail>(lotId && slot && tools ? `/yield/lots/${lotId}/wafers/${slot}?minSize=${minSize}` : null);

  const [draft, setDraft] = useState(minSize);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => setDraft(minSize), [minSize]);
  const onSlide = (value: number) => {
    setDraft(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => update({ tool: 'custom', nm: String(value) }), 250);
  };

  const [layers, setLayers] = useState<MapLayers>({ dies: true, defects: true, missed: false });
  const [highlightIdx, setHighlightIdx] = useState(0);
  useEffect(() => setHighlightIdx(0), [wafer?.slot, wafer?.lot.id, wafer?.minSizeNm]);
  const highlight = wafer?.signatures[highlightIdx] ?? wafer?.signatures[0] ?? null;
  const top = wafer?.signatures[0];
  const waferSummary = useMemo(() => lot?.wafers.find((w) => w.slot === slot), [lot, slot]);

  const error = lotsError ?? lotError ?? waferError;

  return (
    <>
      <PageHeader
        eyebrow="Klarity Yield Lab · Interactive demo"
        title="Find the signature behind every yield loss"
        intro="Pick a lot, choose an inspection tool and watch spatial signature analysis trace yield excursions back to a root cause, then open an excursion to contain it."
        seed={37}
      />

      <section className="section pb-10" aria-label="Lot selection">
        {error && <ErrorNotice message={error} />}
        {!lots && !error && <Loading label="Loading lots" />}
        {lots && (
          <div className="grid gap-6 md:grid-cols-3">
            {lots.map((l) => {
              const active = l.id === lotId;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => update({ lot: l.id, slot: null })}
                  aria-pressed={active}
                  className={`border-t-4 p-6 text-left transition ${active ? 'border-kla-sky bg-kla-purple text-white shadow-xl' : 'border-kla-purple bg-kla-mist text-kla-ink hover:-translate-y-1 hover:shadow-lg'}`}
                  data-testid={`lot-${l.id}`}
                >
                  <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${active ? 'text-kla-sky' : 'text-kla-blue'}`}>{l.product} · {l.layer}</p>
                  <p className={`mt-2 text-2xl font-light ${active ? 'text-white' : 'text-kla-purple'}`}>Lot {l.id}</p>
                  <p className={`mt-2 text-sm ${active ? 'text-white/80' : 'text-kla-slate'}`}>{l.story}</p>
                  <div className={`mt-5 flex gap-6 border-t pt-4 text-sm ${active ? 'border-white/20' : 'border-black/10'}`}>
                    <span><strong className="text-lg font-semibold">{l.meanYield}%</strong> mean yield</span>
                    <span><strong className="text-lg font-semibold">{l.flagged}</strong> flagged</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {tools && (
        <section className="sticky top-[92px] z-30 border-y border-black/5 bg-white/95 backdrop-blur" aria-label="Inspection tool">
          <div className="container-kla flex flex-wrap items-center gap-x-8 gap-y-3 py-4">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-kla-blue">Inspection tool</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Inspection tool">
              {tools.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  title={t.description}
                  onClick={() => update({ tool: t.id, nm: null })}
                  aria-pressed={toolId === t.id}
                  className={`chip ${toolId === t.id ? 'border-kla-purple bg-kla-purple text-white' : 'border-kla-purple/25 text-kla-purple hover:border-kla-purple'}`}
                >
                  {t.name} <span className="opacity-70">· {t.minSizeNm} nm</span>
                </button>
              ))}
            </div>
            <label className="flex flex-1 items-center gap-3 text-sm text-kla-slate">
              <span className="whitespace-nowrap">Detection threshold</span>
              <input
                type="range"
                min={10}
                max={150}
                step={5}
                value={draft}
                onChange={(e) => onSlide(Number(e.target.value))}
                className="min-w-[140px] flex-1 accent-kla-purple"
                aria-label="Detection threshold in nanometers"
              />
              <span className="w-16 font-semibold text-kla-purple" data-testid="threshold">{draft} nm</span>
            </label>
          </div>
        </section>
      )}

      {lotReady && (
        <section className="section pt-10" aria-label="Lot trend">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Lot {lot.id} · {lot.processTool}</p>
              <h2 className="heading">Die yield by wafer</h2>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              {signatureOptions.map((s) => (
                <span key={s} className="flex items-center gap-1.5 text-kla-slate">
                  <span className="h-3 w-3" style={{ background: signatureColor[s], opacity: s === 'Random' ? 0.45 : 1 }} /> {signatureLabel(s)}
                </span>
              ))}
              <span className="flex items-center gap-1.5 text-kla-slate"><span className="text-red-700">▼</span> below LCL</span>
            </div>
          </div>
          {lot.summary.unexplained > 0 && (
            <div className="mt-6 border-l-4 border-red-500 bg-red-50 px-5 py-4 text-sm text-red-800" role="alert" data-testid="unexplained-alert">
              <strong>{lot.summary.unexplained} wafers fell below the yield control limit with no signature captured.</strong> The defects killing these dies are smaller
              than {minSize} nm, so this tool can&apos;t see them. Try a more sensitive inspection tool.
            </div>
          )}
          <div className="mt-6 border border-black/5 p-4 shadow-sm">
            <LotTrend wafers={lot.wafers} limits={lot.limits.yield} selected={slot ?? 0} onSelect={(s) => update({ slot: String(s) })} />
          </div>
          <p className="mt-2 text-xs text-kla-slate">
            Control limits come from {lot.layer} history: mean {lot.limits.yield.center}% ± 3σ ({lot.limits.yield.sigma}). Click a wafer to inspect it.
          </p>
        </section>
      )}

      {wafer && lotReady && top && (
        <section className="bg-kla-mist" aria-label="Wafer analysis">
          <div className="section grid gap-10 pt-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div className="bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-light text-kla-purple" data-testid="wafer-title">
                  Slot {wafer.slot} <span className="text-kla-slate">· {wafer.chamber}</span>
                </h2>
                <div className="flex flex-wrap gap-4 text-sm text-kla-slate">
                  {([['dies', 'Die pass/fail'], ['defects', 'Captured defects'], ['missed', 'Missed defects']] as [keyof MapLayers, string][]).map(([k, label]) => (
                    <label key={k} className="flex items-center gap-1.5">
                      <input type="checkbox" checked={layers[k]} onChange={(e) => setLayers((l) => ({ ...l, [k]: e.target.checked }))} className="accent-kla-purple" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <WaferMap wafer={wafer} layers={layers} highlight={highlight} />
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-kla-slate">
                {(Object.keys(classColor) as DefectClass[]).map((c) => (
                  <span key={c} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: classColor[c] }} />{c}</span>
                ))}
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 border border-[#E8838F] bg-[#F9C9CF]" />Failed die</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-t-4 bg-white p-6 shadow-sm" style={{ borderColor: signatureColor[top.type] }} data-testid="signature-card">
                <p className="eyebrow">Spatial signature analysis</p>
                <div className="mt-2 flex items-baseline justify-between gap-4">
                  <h3 className="text-3xl font-light" style={{ color: top.type === 'Random' ? '#3D0A7F' : signatureColor[top.type] }} data-testid="signature-name">
                    {signatureLabel(top.type)}
                  </h3>
                  <span className="text-sm font-semibold text-kla-purple">{pct(top.confidence)} confidence</span>
                </div>
                <div className="mt-2 h-1.5 bg-kla-mist">
                  <div className="h-1.5 transition-all duration-500" style={{ width: pct(top.confidence), background: signatureColor[top.type] }} />
                </div>
                <p className="mt-3 text-sm text-kla-slate">{top.evidence}</p>
                {wafer.signatures.length > 1 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-kla-slate">Also found:</span>
                    {wafer.signatures.map((s, i) => (
                      <button
                        key={s.type}
                        type="button"
                        onClick={() => setHighlightIdx(i)}
                        aria-pressed={highlightIdx === i}
                        className={`chip ${highlightIdx === i ? 'text-white' : 'text-kla-ink'}`}
                        style={{ borderColor: signatureColor[s.type], background: highlightIdx === i ? signatureColor[s.type] : undefined }}
                      >
                        {s.type} {pct(s.confidence)}
                      </button>
                    ))}
                  </div>
                )}
                <dl className="mt-5 space-y-3 border-t border-black/5 pt-4 text-sm">
                  <div>
                    <dt className="font-semibold text-kla-purple">Likely root cause</dt>
                    <dd className="text-kla-slate">{top.rootCause}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-kla-purple">Recommended action</dt>
                    <dd className="text-kla-slate">{top.action}</dd>
                  </div>
                </dl>
                {top.product && (
                  <Link to={`/products/${top.product.slug}`} className="mt-5 flex items-center justify-between bg-kla-purple px-5 py-3 text-sm text-white hover:bg-kla-purple-light">
                    <span>Recommended KLA solution: <strong>{top.product.name}</strong></span>
                    <span aria-hidden>→</span>
                  </Link>
                )}
              </div>

              <div className="grid gap-6 bg-white p-6 shadow-sm sm:grid-cols-3">
                <Stat
                  label="Die yield"
                  value={`${wafer.stats.yield}%`}
                  sub={`${wafer.stats.goodDies} of ${wafer.stats.totalDies} dies`}
                  tone={waferSummary?.yieldAlarm ? 'text-red-700' : 'text-kla-purple'}
                />
                <Stat label="Poisson model" value={`${wafer.stats.poissonYield}%`} sub={`D₀ = ${wafer.stats.d0} killers/cm²`} />
                <Stat label="Killers captured" value={pct(wafer.stats.killerCaptureRate)} sub={`${wafer.stats.missedKillers} of ${wafer.stats.killers} killers missed`} tone={wafer.stats.killerCaptureRate < 0.6 ? 'text-red-700' : 'text-kla-purple'} />
              </div>

              <div className="bg-white p-6 shadow-sm">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-semibold text-kla-purple">Defect pareto</h3>
                  <span className="text-xs text-kla-slate">{wafer.stats.defects} of {wafer.stats.totalDefects} defects captured at ≥ {wafer.minSizeNm} nm</span>
                </div>
                <div className="mt-4"><Pareto counts={wafer.pareto} /></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {lotReady && (
        <section className="section grid gap-12 lg:grid-cols-2" aria-label="Commonality and excursions">
          <div>
            <p className="eyebrow">Commonality analysis</p>
            <h2 className="heading">Yield by process path</h2>
            {lot.commonality ? (
              <p className="mt-4 border-l-4 border-kla-sky bg-kla-mist px-5 py-3 text-sm text-kla-purple" data-testid="commonality">
                <strong>{lot.commonality.chamber}</strong> is running {lot.commonality.gap} points below the best path. Commonality points to {lot.commonality.chamber}.
              </p>
            ) : (
              <p className="mt-4 text-sm text-kla-slate">No path stands out: yield loss is shared across all paths, so look upstream or at consumables.</p>
            )}
            <table className="mt-6 w-full text-left text-sm">
              <thead className="border-b-2 border-kla-purple text-kla-purple">
                <tr>
                  <th className="py-3">Path</th>
                  <th className="py-3">Mean yield</th>
                  <th className="py-3 text-right">Flagged</th>
                  <th className="py-3 pl-4">Signatures</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {lot.chambers.map((c) => (
                  <tr key={c.chamber} className={lot.commonality?.chamber === c.chamber ? 'bg-red-50' : ''}>
                    <td className="py-3 font-semibold text-kla-purple">{c.chamber}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-28 bg-kla-mist"><span className="block h-2.5 bg-kla-purple" style={{ width: `${c.meanYield}%` }} /></span>
                        {c.meanYield}%
                      </div>
                    </td>
                    <td className="py-3 text-right">{c.flagged}/{c.wafers}</td>
                    <td className="py-3 pl-4 text-kla-slate">
                      {Object.entries(c.signatures).map(([s, n]) => `${s} ×${n}`).join(', ') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="mt-10 font-semibold text-kla-purple">Lot defect pareto</h3>
            <div className="mt-4"><Pareto counts={lot.pareto} /></div>
          </div>

          <div>
            <p className="eyebrow">Containment</p>
            <h2 className="heading">Open an excursion</h2>
            <p className="mt-3 text-sm text-kla-slate">Flagged wafers are pre-selected. Excursions are stored by the API and show up in the demo console.</p>
            <div className="mt-6 border border-black/5 p-6 shadow-sm">
              <ExcursionForm key={`${lot.id}-${minSize}`} lot={lot} onCreated={refetchLot} />
            </div>
            {lot.excursions.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-kla-purple">Excursions on this lot</h3>
                <ul className="mt-3 divide-y divide-black/5" data-testid="lot-excursions">
                  {lot.excursions.map((e) => (
                    <li key={e.id} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                      <span>
                        <strong className="text-kla-purple">{excursionRef(e.id)}</strong> · {signatureLabel(e.signature)} · slots {e.slots.join(', ')}
                        <span className="block text-kla-slate">{e.owner} · {formatDate(e.createdAt, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                      </span>
                      <span className="bg-kla-sky/15 px-2 py-0.5 text-xs font-semibold text-kla-blue-dark">{e.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
