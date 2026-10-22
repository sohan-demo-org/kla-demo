import { Link, useSearchParams } from 'react-router-dom';
import { useApi } from '../api';
import PageHeader from '../components/PageHeader';
import { ErrorNotice, Loading } from '../components/StateMessage';
import WaferArt from '../components/WaferArt';
import type { Product } from '../types';

const categories = ['Inspection', 'Metrology', 'Data Analytics', 'Packaging', 'PCB & Display', 'Instruments'];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? '';
  const q = params.get('q') ?? '';
  const query = new URLSearchParams();
  if (category) query.set('category', category);
  if (q) query.set('q', q);
  const { data, error, loading } = useApi<Product[]>(`/products?${query}`);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <>
      <PageHeader
        eyebrow="Products & Technology"
        title="Process control from wafer to package"
        intro="Inspection, metrology and data analytics that help chipmakers find, measure and fix the sources of yield loss faster."
        seed={21}
      />
      <section className="section">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {['', ...categories].map((c) => (
              <button
                key={c || 'all'}
                type="button"
                onClick={() => update('category', c)}
                aria-pressed={category === c}
                className={`chip ${category === c ? 'border-kla-purple bg-kla-purple text-white' : 'border-kla-purple/25 text-kla-purple hover:border-kla-purple'}`}
              >
                {c || 'All'}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={q}
            onChange={(e) => update('q', e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="input lg:max-w-xs"
          />
        </div>

        {loading && !data && <Loading label="Loading products" />}
        {error && <ErrorNotice message={error} />}
        {data && (
          <p className="mt-8 text-sm text-kla-slate" aria-live="polite">
            Showing {data.length} product{data.length === 1 ? '' : 's'}
            {category && ` in ${category}`}
          </p>
        )}
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((p) => (
            <Link key={p.slug} to={`/products/${p.slug}`} className="card group flex flex-col p-0">
              <WaferArt name={p.name} category={p.category} />
              <div className="flex flex-1 flex-col p-6">
                <p className="eyebrow">{p.category}</p>
                <h2 className="mt-2 text-xl font-semibold text-kla-purple group-hover:text-kla-blue">{p.name}</h2>
                <p className="mt-2 flex-1 text-sm text-kla-slate">{p.tagline}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {p.applications.slice(0, 2).map((a) => (
                    <li key={a} className="bg-kla-mist px-2 py-1 text-xs text-kla-purple">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}
        </div>
        {data?.length === 0 && <p className="mt-6 text-kla-slate">No products match those filters.</p>}
      </section>
    </>
  );
}
