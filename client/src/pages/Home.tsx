import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, useApi } from '../api';
import CircuitBackdrop from '../components/CircuitBackdrop';
import { ArrowRight, ChevronLeft, ChevronRight } from '../components/Icons';
import { ErrorNotice, Loading } from '../components/StateMessage';
import WaferArt from '../components/WaferArt';
import type { HeroSlide, HomePayload, Metric } from '../types';

function PerformancePanel({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="w-full max-w-[720px] animate-fade-up">
      <div className="border-y border-white/70 py-3 text-center text-[26px] text-white">Performance</div>
      <div className="grid grid-cols-3 border-b border-white/70 py-8">
        {metrics.map((m, i) => (
          <div key={m.label} className={`px-2 py-3 text-center ${i > 0 ? 'border-l border-white/60' : ''}`}>
            <p className="text-3xl font-semibold tracking-tight text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.35)] sm:text-5xl lg:text-[56px]">{m.value}</p>
            <p className="mt-2 text-sm text-white sm:text-[17px]">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatPanel({ slide }: { slide: HeroSlide }) {
  if (!slide.stat) return null;
  return (
    <div className="w-full max-w-[520px] animate-fade-up border-y border-white/70 py-10 text-center">
      <p className="text-6xl font-semibold text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.35)] lg:text-7xl">{slide.stat.value}</p>
      <p className="mt-3 text-lg text-white/90">{slide.stat.label}</p>
    </div>
  );
}

function Hero({ slides, metrics }: { slides: HeroSlide[]; metrics: Metric[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = slides[index];

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const go = (delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length);

  return (
    <section
      className="relative overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <CircuitBackdrop seed={index * 13 + 3} />
      <div className="container-kla relative grid min-h-[560px] items-center gap-12 py-20 lg:grid-cols-[1fr_1.15fr]">
        <div key={slide.id} className="animate-fade-up">
          <h1 className="max-w-[560px] text-[44px] font-normal leading-[1.18] text-white md:text-[58px]">{slide.title}</h1>
          <Link to={slide.cta.to} className="btn-primary mt-12 px-8 py-2.5 text-[17px]">
            {slide.cta.label}
          </Link>
        </div>
        <div key={`${slide.id}-panel`} className="flex justify-center lg:justify-end">
          {slide.panel === 'performance' && <PerformancePanel metrics={metrics} />}
          {slide.panel === 'stat' && <StatPanel slide={slide} />}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="container-kla relative flex items-center gap-4 pb-8">
          <button type="button" onClick={() => go(-1)} aria-label="Previous slide" className="text-white/70 hover:text-white">
            <ChevronLeft />
          </button>
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}: ${s.title}`}
              aria-current={i === index}
              className={`h-1 transition-all ${i === index ? 'w-12 bg-kla-sky' : 'w-6 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
          <button type="button" onClick={() => go(1)} aria-label="Next slide" className="text-white/70 hover:text-white">
            <ChevronRight />
          </button>
        </div>
      )}
    </section>
  );
}

const pillars = [
  { title: 'Inspection', text: 'Find the defects that limit yield, from bare wafers to advanced packages.', to: '/products?category=Inspection' },
  { title: 'Metrology', text: 'Measure overlay, critical dimensions and wafer shape with sub-nanometer precision.', to: '/products?category=Metrology' },
  { title: 'Data Analytics', text: 'Turn fab-wide data into a ranked list of yield detractors engineers can act on.', to: '/products?category=Data%20Analytics' },
];

const stats = [
  { value: '~50 yrs', label: 'of process control innovation' },
  { value: '15,000+', label: 'employees worldwide' },
  { value: '20+', label: 'countries with KLA operations' },
  { value: '#1', label: 'in semiconductor process control' },
];

export default function Home() {
  const { data, error, loading } = useApi<HomePayload>('/home');

  return (
    <>
      {data ? (
        <Hero slides={data.slides} metrics={data.metrics} />
      ) : (
        <section className="min-h-[560px] bg-black">{error && <div className="container-kla py-20"><ErrorNotice message={error} /></div>}</section>
      )}

      <section className="section">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">What we do</p>
            <h2 className="heading mt-3">Enabling the innovations that move the world forward</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((p) => (
              <Link key={p.title} to={p.to} className="group border-t-4 border-kla-purple bg-kla-mist p-6 transition hover:border-kla-sky hover:bg-white hover:shadow-xl">
                <h3 className="text-xl font-semibold text-kla-purple">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-kla-slate">{p.text}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-kla-blue">
                  Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-kla-mist">
        <div className="section">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Products &amp; Technology</p>
              <h2 className="heading mt-3">Featured solutions</h2>
            </div>
            <Link to="/products" className="btn-outline">
              View all products
            </Link>
          </div>
          {loading && <Loading label="Loading products" />}
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(data?.featuredProducts ?? []).map((p) => (
              <Link key={p.slug} to={`/products/${p.slug}`} className="card group block p-0">
                <WaferArt name={p.name} category={p.category} />
                <div className="p-6">
                  <p className="eyebrow">{p.category}</p>
                  <h3 className="mt-2 text-lg font-semibold text-kla-purple group-hover:text-kla-blue">{p.name}</h3>
                  <p className="mt-2 text-sm text-kla-slate">{p.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-kla-purple">
        <div className="container-kla grid grid-cols-2 gap-8 py-16 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="border-l border-white/30 pl-6">
              <p className="text-4xl font-light text-white md:text-5xl">{s.value}</p>
              <p className="mt-2 text-sm text-white/75">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Newsroom</p>
            <h2 className="heading mt-3">Latest from KLA</h2>
          </div>
          <Link to="/newsroom" className="inline-flex items-center gap-2 font-semibold text-kla-blue hover:underline">
            View all news <ArrowRight />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {(data?.latestNews ?? []).map((n) => (
            <Link key={n.slug} to={`/newsroom/${n.slug}`} className="card group block">
              <p className="text-xs uppercase tracking-widest text-kla-slate">
                {n.category} · {formatDate(n.publishedAt)}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-kla-purple group-hover:text-kla-blue">{n.title}</h3>
              <p className="mt-3 text-sm text-kla-slate">{n.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-black">
        <CircuitBackdrop seed={42} density={40} />
        <div className="container-kla relative flex flex-col items-start justify-between gap-6 py-16 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-light text-white md:text-4xl">Talk to a process control specialist</h2>
            <p className="mt-3 max-w-xl text-white/75">Tell us about your yield challenge and an applications engineer will follow up.</p>
          </div>
          <Link to="/contact" className="btn-primary">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
