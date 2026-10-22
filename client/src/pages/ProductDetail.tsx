import { Link, useParams } from 'react-router-dom';
import { useApi } from '../api';
import CircuitBackdrop from '../components/CircuitBackdrop';
import { CheckIcon } from '../components/Icons';
import { ErrorNotice, Loading } from '../components/StateMessage';
import WaferArt from '../components/WaferArt';
import type { ProductDetail as Detail } from '../types';

export default function ProductDetail() {
  const { slug = '' } = useParams();
  const { data, error, loading } = useApi<Detail>(`/products/${slug}`);

  if (loading) return <div className="section"><Loading label="Loading product" /></div>;
  if (error || !data)
    return (
      <div className="section">
        <ErrorNotice message={error ?? 'Product not found'} />
        <Link to="/products" className="btn-outline mt-6">Back to products</Link>
      </div>
    );

  const contactLink = `/contact?topic=${encodeURIComponent('Request a demo')}&product=${encodeURIComponent(data.name)}`;

  return (
    <>
      <section className="relative overflow-hidden bg-black">
        <CircuitBackdrop seed={slug.length * 7} density={50} />
        <div className="container-kla relative grid items-center gap-12 py-20 lg:grid-cols-2">
          <div className="animate-fade-up">
            <nav className="text-sm text-white/60" aria-label="Breadcrumb">
              <Link to="/products" className="hover:text-white">Products</Link> /{' '}
              <Link to={`/products?category=${encodeURIComponent(data.category)}`} className="hover:text-white">{data.category}</Link>
            </nav>
            <h1 className="mt-4 text-4xl font-light text-white md:text-[52px]">{data.name}</h1>
            <p className="mt-5 max-w-xl text-lg font-light text-white/80">{data.tagline}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to={contactLink} className="btn-primary">Request a Demo</Link>
              <a href="#specs" className="btn-ghost">View Specifications</a>
            </div>
          </div>
          <WaferArt name={data.name} category={data.category} className="h-72 border border-white/10" />
        </div>
      </section>

      <section className="section grid gap-12 lg:grid-cols-[2fr_1fr]">
        <div>
          <p className="eyebrow">Overview</p>
          <p className="mt-4 text-xl font-light leading-relaxed text-kla-ink">{data.description}</p>
          <h2 className="mt-12 text-2xl font-light text-kla-purple">Applications</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.applications.map((a) => (
              <li key={a} className="flex items-center gap-3 bg-kla-mist px-4 py-3 text-kla-purple">
                <CheckIcon className="h-5 w-5 text-kla-sky" /> {a}
              </li>
            ))}
          </ul>
        </div>
        <aside id="specs" className="scroll-mt-40 self-start border-t-4 border-kla-purple bg-kla-mist p-6">
          <h2 className="text-lg font-semibold text-kla-purple">Key specifications</h2>
          <dl className="mt-4 divide-y divide-black/10">
            {data.specs.map((s) => (
              <div key={s.label} className="flex justify-between gap-4 py-3 text-sm">
                <dt className="text-kla-slate">{s.label}</dt>
                <dd className="text-right font-semibold text-kla-purple">{s.value}</dd>
              </div>
            ))}
          </dl>
          <Link to={contactLink} className="btn-primary mt-6 w-full">Talk to a specialist</Link>
        </aside>
      </section>

      {data.related.length > 0 && (
        <section className="bg-kla-mist">
          <div className="section">
            <h2 className="heading">Related {data.category.toLowerCase()} solutions</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {data.related.map((r) => (
                <Link key={r.slug} to={`/products/${r.slug}`} className="card group block">
                  <h3 className="text-lg font-semibold text-kla-purple group-hover:text-kla-blue">{r.name}</h3>
                  <p className="mt-2 text-sm text-kla-slate">{r.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
