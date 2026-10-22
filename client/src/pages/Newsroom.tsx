import { Link, useSearchParams } from 'react-router-dom';
import { formatDate, useApi } from '../api';
import PageHeader from '../components/PageHeader';
import { ErrorNotice, Loading } from '../components/StateMessage';
import type { NewsArticle } from '../types';

const categories = ['Earnings', 'Product', 'Company', 'Sustainability', 'Community'];

export default function Newsroom() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? '';
  const { data, error, loading } = useApi<NewsArticle[]>(`/news${category ? `?category=${encodeURIComponent(category)}` : ''}`);
  const [lead, ...rest] = data ?? [];

  return (
    <>
      <PageHeader eyebrow="Newsroom" title="News and press releases" intro="The latest announcements, earnings and stories from across KLA." seed={51} />
      <section className="section">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter news">
          {['', ...categories].map((c) => (
            <button
              key={c || 'all'}
              type="button"
              onClick={() => setParams(c ? { category: c } : {}, { replace: true })}
              aria-pressed={category === c}
              className={`chip ${category === c ? 'border-kla-purple bg-kla-purple text-white' : 'border-kla-purple/25 text-kla-purple hover:border-kla-purple'}`}
            >
              {c || 'All news'}
            </button>
          ))}
        </div>
        {loading && !data && <Loading label="Loading news" />}
        {error && <ErrorNotice message={error} />}
        {lead && (
          <Link to={`/newsroom/${lead.slug}`} className="group mt-10 grid overflow-hidden bg-kla-purple md:grid-cols-2">
            <div className="relative min-h-[220px] bg-[radial-gradient(circle_at_30%_40%,rgba(72,169,224,0.6),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(255,138,61,0.45),transparent_50%),linear-gradient(135deg,#26064F,#000)]" />
            <div className="p-8 md:p-12">
              <p className="text-xs uppercase tracking-widest text-kla-sky">{lead.category} · {formatDate(lead.publishedAt)}</p>
              <h2 className="mt-4 text-3xl font-light text-white group-hover:underline">{lead.title}</h2>
              <p className="mt-4 text-white/75">{lead.summary}</p>
            </div>
          </Link>
        )}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((n) => (
            <Link key={n.slug} to={`/newsroom/${n.slug}`} className="card group block">
              <p className="text-xs uppercase tracking-widest text-kla-slate">{n.category} · {formatDate(n.publishedAt)}</p>
              <h3 className="mt-3 text-lg font-semibold text-kla-purple group-hover:text-kla-blue">{n.title}</h3>
              <p className="mt-3 text-sm text-kla-slate">{n.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
