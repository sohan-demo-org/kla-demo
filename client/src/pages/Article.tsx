import { Link, useParams } from 'react-router-dom';
import { formatDate, useApi } from '../api';
import PageHeader from '../components/PageHeader';
import { ErrorNotice, Loading } from '../components/StateMessage';
import type { NewsArticle } from '../types';

export default function Article() {
  const { slug = '' } = useParams();
  const { data, error, loading } = useApi<NewsArticle>(`/news/${slug}`);

  if (loading) return <div className="section"><Loading label="Loading article" /></div>;
  if (error || !data)
    return (
      <div className="section">
        <ErrorNotice message={error ?? 'Article not found'} />
        <Link to="/newsroom" className="btn-outline mt-6">Back to newsroom</Link>
      </div>
    );

  return (
    <>
      <PageHeader eyebrow={`${data.category} · ${formatDate(data.publishedAt)}`} title={data.title} seed={slug.length * 5} />
      <article className="section max-w-4xl">
        <Link to="/newsroom" className="text-sm font-semibold text-kla-blue hover:underline">← Newsroom</Link>
        <p className="mt-8 text-xl font-light leading-relaxed text-kla-purple">{data.summary}</p>
        {data.body.map((p) => (
          <p key={p} className="mt-6 leading-relaxed text-kla-slate">{p}</p>
        ))}
        {data.category === 'Earnings' && (
          <Link to="/investors" className="btn-primary mt-10">View investor results</Link>
        )}
      </article>
    </>
  );
}
