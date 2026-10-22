import { Link, useSearchParams } from 'react-router-dom';
import { useApi } from '../api';
import PageHeader from '../components/PageHeader';
import { ErrorNotice, Loading } from '../components/StateMessage';
import type { SearchResult } from '../types';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const { data, error, loading } = useApi<SearchResult[]>(`/search?q=${encodeURIComponent(q)}`);

  return (
    <>
      <PageHeader eyebrow="Search" title={q ? `Results for “${q}”` : 'Search'} seed={5} />
      <section className="section">
        {loading && <Loading label="Searching" />}
        {error && <ErrorNotice message={error} />}
        {data && <p className="text-sm text-kla-slate">{data.length} result{data.length === 1 ? '' : 's'}</p>}
        <ul className="mt-6 divide-y divide-black/5 border-y border-black/5">
          {(data ?? []).map((r) => (
            <li key={`${r.type}-${r.to}-${r.title}`}>
              <Link to={r.to} className="flex gap-6 py-5 hover:bg-kla-mist">
                <span className="w-24 shrink-0 text-xs font-semibold uppercase tracking-widest text-kla-blue">{r.type}</span>
                <span>
                  <span className="block text-lg font-semibold text-kla-purple">{r.title}</span>
                  <span className="block text-sm text-kla-slate">{r.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {data?.length === 0 && <p className="mt-6 text-kla-slate">No matches. Try “overlay”, “packaging” or “engineer”.</p>}
      </section>
    </>
  );
}
