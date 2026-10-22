import { Link } from 'react-router-dom';
import { useApi } from '../api';
import { CheckIcon } from '../components/Icons';
import PageHeader from '../components/PageHeader';
import { ErrorNotice, Loading } from '../components/StateMessage';
import type { Service } from '../types';

const steps = [
  { n: '01', title: 'Assess', text: 'Baseline fleet health, utilization and matching across every site.' },
  { n: '02', title: 'Optimize', text: 'Tune recipes, sampling plans and analytics for each layer and node.' },
  { n: '03', title: 'Sustain', text: 'Predictive maintenance and upgrades keep tools at peak performance.' },
];

export default function Services() {
  const { data, error, loading } = useApi<Service[]>('/services');

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Keep your installed base at peak performance"
        intro="Global service, upgrades and applications expertise that extend the productive life of every KLA system."
        seed={31}
      />
      <section className="section">
        {loading && <Loading label="Loading services" />}
        {error && <ErrorNotice message={error} />}
        <div className="grid gap-6 md:grid-cols-2">
          {(data ?? []).map((s) => (
            <article key={s.slug} className="card border-t-4 border-t-kla-purple">
              <h2 className="text-2xl font-light text-kla-purple">{s.name}</h2>
              <p className="mt-3 text-kla-slate">{s.summary}</p>
              <ul className="mt-5 space-y-2">
                {s.outcomes.map((o) => (
                  <li key={o} className="flex items-center gap-3 text-sm text-kla-purple">
                    <CheckIcon className="h-4 w-4 text-kla-sky" /> {o}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-kla-mist">
        <div className="section">
          <p className="eyebrow">How we engage</p>
          <h2 className="heading mt-3">A lifecycle partnership</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <p className="text-5xl font-light text-kla-sky">{s.n}</p>
                <h3 className="mt-3 text-xl font-semibold text-kla-purple">{s.title}</h3>
                <p className="mt-2 text-kla-slate">{s.text}</p>
              </div>
            ))}
          </div>
          <Link to={`/contact?topic=${encodeURIComponent('Service & support')}`} className="btn-primary mt-12">
            Contact Service &amp; Support
          </Link>
        </div>
      </section>
    </>
  );
}
