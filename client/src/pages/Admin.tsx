import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiPatch, formatDate, useApi } from '../api';
import PageHeader from '../components/PageHeader';
import { ErrorNotice, Loading } from '../components/StateMessage';
import type { AdminSummary, ExcursionStatus, InquiryStatus } from '../types';

const statuses: InquiryStatus[] = ['New', 'In Progress', 'Closed'];
const statusStyle: Record<InquiryStatus, string> = {
  New: 'bg-kla-sky/15 text-kla-blue-dark',
  'In Progress': 'bg-amber-100 text-amber-800',
  Closed: 'bg-emerald-100 text-emerald-800',
};
const excursionStatuses: ExcursionStatus[] = ['Open', 'Contained', 'Closed'];
const excursionStyle: Record<ExcursionStatus, string> = {
  Open: 'bg-red-100 text-red-800',
  Contained: 'bg-amber-100 text-amber-800',
  Closed: 'bg-emerald-100 text-emerald-800',
};
const ts = (iso: string) => formatDate(iso, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

type Tab = 'inquiries' | 'applications' | 'subscriptions' | 'excursions';
const tabs: Tab[] = ['inquiries', 'applications', 'subscriptions', 'excursions'];

export default function Admin() {
  const { data, error, loading, refetch } = useApi<AdminSummary>('/admin/summary');
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>(tabs.find((t) => t === params.get('tab')) ?? 'inquiries');
  const [updateError, setUpdateError] = useState<string | null>(null);

  async function setStatus(id: number, status: InquiryStatus) {
    setUpdateError(null);
    try {
      await apiPatch(`/contact/${id}`, { status });
      refetch();
    } catch (err) {
      setUpdateError((err as Error).message);
    }
  }

  async function setExcursionStatus(id: number, status: ExcursionStatus) {
    setUpdateError(null);
    try {
      await apiPatch(`/yield/excursions/${id}`, { status });
      refetch();
    } catch (err) {
      setUpdateError((err as Error).message);
    }
  }

  const cards = data
    ? [
        { label: 'Total inquiries', value: data.counts.inquiries },
        { label: 'Open inquiries', value: data.counts.openInquiries },
        { label: 'Job applications', value: data.counts.applications },
        { label: 'Newsletter subscribers', value: data.counts.subscriptions },
        { label: 'Open excursions', value: data.counts.openExcursions },
      ]
    : [];

  return (
    <>
      <PageHeader eyebrow="Demo console" title="Submissions dashboard" intro="Everything submitted through the site, persisted in SQLite by the API." seed={91} />
      <section className="section">
        {loading && !data && <Loading label="Loading dashboard" />}
        {(error || updateError) && <ErrorNotice message={(error ?? updateError)!} />}
        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map((c) => (
            <div key={c.label} className="border-t-4 border-kla-purple bg-kla-mist p-6">
              <p className="text-4xl font-light text-kla-purple" data-testid={`count-${c.label}`}>{c.value}</p>
              <p className="mt-1 text-sm text-kla-slate">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex gap-6 border-b border-black/10" role="tablist">
          {tabs.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              type="button"
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 pb-3 text-sm font-semibold capitalize ${tab === t ? 'border-kla-sky text-kla-purple' : 'border-transparent text-kla-slate hover:text-kla-purple'}`}
            >
              {t}
            </button>
          ))}
          <button type="button" onClick={refetch} className="ml-auto pb-3 text-sm font-semibold text-kla-blue hover:underline">Refresh</button>
        </div>

        {data && tab === 'inquiries' && (
          <div className="overflow-x-auto">
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-kla-purple">
                <tr>
                  <th className="py-3 pr-4">Ref</th>
                  <th className="py-3 pr-4">From</th>
                  <th className="py-3 pr-4">Topic / Product</th>
                  <th className="py-3 pr-4">Message</th>
                  <th className="py-3 pr-4">Received</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {data.inquiries.map((i) => (
                  <tr key={i.id} className="align-top">
                    <td className="py-3 pr-4 font-semibold text-kla-purple">KLA-{String(i.id).padStart(5, '0')}</td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold">{i.name}</p>
                      <p className="text-kla-slate">{i.company} · {i.email}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p>{i.topic}</p>
                      {i.product && <p className="text-kla-blue">{i.product}</p>}
                    </td>
                    <td className="max-w-xs py-3 pr-4 text-kla-slate">{i.message}</td>
                    <td className="whitespace-nowrap py-3 pr-4 text-kla-slate">{ts(i.createdAt)}</td>
                    <td className="py-3">
                      <select
                        value={i.status}
                        onChange={(e) => setStatus(i.id, e.target.value as InquiryStatus)}
                        aria-label={`Status for KLA-${String(i.id).padStart(5, '0')}`}
                        className={`px-2 py-1 text-xs font-semibold outline-none ${statusStyle[i.status]}`}
                      >
                        {statuses.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.inquiries.length === 0 && <p className="py-8 text-kla-slate">No inquiries yet. Submit one from the Contact page.</p>}
          </div>
        )}

        {data && tab === 'applications' && (
          <ul className="mt-4 divide-y divide-black/5">
            {data.applications.map((a) => (
              <li key={a.id} className="py-4">
                <p className="font-semibold text-kla-purple">{a.name} → {a.jobTitle}</p>
                <p className="text-sm text-kla-slate">{a.email}{a.linkedin ? ` · ${a.linkedin}` : ''} · {ts(a.createdAt)}</p>
                <p className="mt-2 text-sm">{a.coverLetter}</p>
              </li>
            ))}
            {data.applications.length === 0 && <p className="py-8 text-kla-slate">No applications yet. Apply from any Careers listing.</p>}
          </ul>
        )}

        {data && tab === 'subscriptions' && (
          <ul className="mt-4 divide-y divide-black/5">
            {data.subscriptions.map((s) => (
              <li key={s.id} className="flex justify-between py-3 text-sm">
                <span className="font-semibold text-kla-purple">{s.email}</span>
                <span className="text-kla-slate">{ts(s.createdAt)}</span>
              </li>
            ))}
            {data.subscriptions.length === 0 && <p className="py-8 text-kla-slate">No subscribers yet. Use the footer newsletter form.</p>}
          </ul>
        )}

        {data && tab === 'excursions' && (
          <div className="overflow-x-auto">
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-kla-purple">
                <tr>
                  <th className="py-3 pr-4">Ref</th>
                  <th className="py-3 pr-4">Lot / Slots</th>
                  <th className="py-3 pr-4">Signature</th>
                  <th className="py-3 pr-4">Owner / Note</th>
                  <th className="py-3 pr-4">Opened</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {data.excursions.map((e) => {
                  const ref = `EXC-${String(e.id).padStart(5, '0')}`;
                  return (
                    <tr key={e.id} className="align-top">
                      <td className="py-3 pr-4 font-semibold text-kla-purple">{ref}</td>
                      <td className="py-3 pr-4">
                        <Link to={`/yield-lab?lot=${e.lotId}&slot=${e.slots[0]}`} className="font-semibold text-kla-blue hover:underline">{e.lotId}</Link>
                        <p className="text-kla-slate">Slots {e.slots.join(', ')}</p>
                      </td>
                      <td className="py-3 pr-4">{e.signature}</td>
                      <td className="max-w-xs py-3 pr-4">
                        <p className="font-semibold">{e.owner}</p>
                        {e.note && <p className="text-kla-slate">{e.note}</p>}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 text-kla-slate">{ts(e.createdAt)}</td>
                      <td className="py-3">
                        <select
                          value={e.status}
                          onChange={(ev) => setExcursionStatus(e.id, ev.target.value as ExcursionStatus)}
                          aria-label={`Status for ${ref}`}
                          className={`px-2 py-1 text-xs font-semibold outline-none ${excursionStyle[e.status]}`}
                        >
                          {excursionStatuses.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {data.excursions.length === 0 && (
              <p className="py-8 text-kla-slate">
                No excursions yet. Open one from the <Link to="/yield-lab" className="text-kla-blue hover:underline">Yield Lab</Link>.
              </p>
            )}
          </div>
        )}
      </section>
    </>
  );
}
