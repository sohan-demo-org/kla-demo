import { Link, useSearchParams } from 'react-router-dom';
import { formatDate, useApi } from '../api';
import { ArrowRight } from '../components/Icons';
import PageHeader from '../components/PageHeader';
import { ErrorNotice, Loading } from '../components/StateMessage';
import type { CareersPayload } from '../types';

export default function Careers() {
  const [params, setParams] = useSearchParams();
  const team = params.get('team') ?? '';
  const location = params.get('location') ?? '';
  const q = params.get('q') ?? '';
  const { data, error, loading } = useApi<CareersPayload>(`/careers?${params}`);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Build the technology that builds technology"
        intro="Join engineers, scientists and problem-solvers who help the world’s chipmakers push the limits of what’s possible."
        seed={41}
      />
      <section className="section">
        <div className="grid gap-4 border-b border-black/10 pb-8 md:grid-cols-[2fr_1fr_1fr_auto]">
          <input type="search" value={q} onChange={(e) => update('q', e.target.value)} placeholder="Search by keyword" aria-label="Search roles" className="input" />
          <select value={team} onChange={(e) => update('team', e.target.value)} aria-label="Team" className="input">
            <option value="">All teams</option>
            {data?.facets.teams.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={location} onChange={(e) => update('location', e.target.value)} aria-label="Location" className="input">
            <option value="">All locations</option>
            {data?.facets.locations.map((l) => <option key={l}>{l}</option>)}
          </select>
          <button type="button" onClick={() => setParams({}, { replace: true })} className="text-sm font-semibold text-kla-blue hover:underline">
            Clear
          </button>
        </div>

        {loading && !data && <Loading label="Loading roles" />}
        {error && <ErrorNotice message={error} />}
        {data && (
          <p className="mt-6 text-sm text-kla-slate" aria-live="polite">
            {data.jobs.length} open role{data.jobs.length === 1 ? '' : 's'}
          </p>
        )}
        <ul className="mt-4 divide-y divide-black/5">
          {(data?.jobs ?? []).map((job) => (
            <li key={job.id}>
              <Link to={`/careers/${job.id}`} className="group flex flex-col gap-2 py-6 transition hover:bg-kla-mist md:flex-row md:items-center md:justify-between md:px-4">
                <div>
                  <h2 className="text-xl font-semibold text-kla-purple group-hover:text-kla-blue">{job.title}</h2>
                  <p className="mt-1 text-sm text-kla-slate">{job.summary}</p>
                </div>
                <div className="flex shrink-0 items-center gap-6 text-sm text-kla-slate">
                  <span className="bg-kla-mist px-2 py-1 text-kla-purple group-hover:bg-white">{job.team}</span>
                  <span>{job.location}</span>
                  <span className="hidden lg:inline">{formatDate(job.postedAt, { month: 'short', day: 'numeric' })}</span>
                  <ArrowRight className="h-5 w-5 text-kla-blue transition group-hover:translate-x-1" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {data?.jobs.length === 0 && <p className="mt-6 text-kla-slate">No roles match those filters.</p>}
      </section>
    </>
  );
}
