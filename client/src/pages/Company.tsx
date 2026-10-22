import { useApi } from '../api';
import PageHeader from '../components/PageHeader';
import { ErrorNotice } from '../components/StateMessage';
import type { CompanyPayload } from '../types';

const values = [
  { title: 'Perseverance', text: 'We tackle the hardest problems in semiconductor manufacturing and see them through.' },
  { title: 'Drive to win', text: 'We set ambitious goals and hold ourselves accountable for customer outcomes.' },
  { title: 'Teamwork', text: 'We collaborate across disciplines, sites and cultures to deliver.' },
  { title: 'Honesty & integrity', text: 'We do the right thing, even when no one is watching.' },
];

export default function Company() {
  const { data, error } = useApi<CompanyPayload>('/company');

  return (
    <>
      <PageHeader
        eyebrow="Company"
        title="Enabling the innovations that move the world forward"
        intro="KLA develops industry-leading equipment and services that enable innovation throughout the electronics industry, from wafers and reticles to integrated circuits, packaging and printed circuit boards."
        seed={71}
      />
      <section className="section grid gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Our purpose</p>
          <h2 className="heading mt-3">Advancing humanity through process control</h2>
        </div>
        <p className="text-lg font-light leading-relaxed text-kla-slate">
          Every smartphone, data center and electric vehicle depends on chips that are manufactured with astonishing
          precision. KLA’s inspection, metrology and analytics help chipmakers find and fix problems faster, so the
          next generation of technology reaches the world sooner.
        </p>
      </section>

      <section className="bg-kla-mist">
        <div className="section">
          <h2 className="heading">Our values</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="border-t-4 border-kla-purple bg-white p-6">
                <h3 className="text-lg font-semibold text-kla-purple">{v.title}</h3>
                <p className="mt-2 text-sm text-kla-slate">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error && <div className="section"><ErrorNotice message={error} /></div>}

      <section className="section">
        <h2 className="heading">Our history</h2>
        <ol className="relative mt-10 border-l-2 border-kla-purple/20 pl-8">
          {(data?.milestones ?? []).map((m, i) => (
            <li key={i} className="relative pb-8">
              <span className="absolute -left-[41px] top-1 h-4 w-4 border-2 border-white bg-kla-sky" />
              <p className="text-2xl font-light text-kla-purple">{m.year}</p>
              <p className="mt-1 text-kla-slate">{m.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="leadership" className="scroll-mt-40 bg-kla-mist">
        <div className="section">
          <h2 className="heading">Leadership</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {(data?.leaders ?? []).map((l) => (
              <div key={l.name} className="card">
                <div className="flex h-16 w-16 items-center justify-center bg-kla-purple text-xl font-light text-white">
                  {l.name.split(' ').map((p) => p[0]).join('')}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-kla-purple">{l.name}</h3>
                <p className="text-sm text-kla-blue">{l.title}</p>
                <p className="mt-3 text-sm text-kla-slate">{l.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="foundation" className="relative scroll-mt-40 overflow-hidden bg-gradient-to-r from-kla-purple-dark to-kla-purple-light">
        <div className="section grid items-center gap-8 md:grid-cols-[2fr_1fr]">
          <div>
            <p className="eyebrow text-kla-sky">KLA Foundation</p>
            <h2 className="mt-3 text-3xl font-light text-white md:text-4xl">Investing in the communities where we live and work</h2>
            <p className="mt-4 max-w-2xl text-white/80">
              The KLA Foundation supports STEM education, community health and employee giving programs around the world.
            </p>
          </div>
          <div className="border-l border-white/30 pl-8 text-white">
            <p className="text-5xl font-light">STEM</p>
            <p className="mt-2 text-white/75">education is our primary focus area</p>
          </div>
        </div>
      </section>
    </>
  );
}
