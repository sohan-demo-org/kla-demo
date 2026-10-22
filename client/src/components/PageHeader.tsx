import type { ReactNode } from 'react';
import CircuitBackdrop from './CircuitBackdrop';

export default function PageHeader({ eyebrow, title, intro, seed = 11, children }: { eyebrow: string; title: string; intro?: string; seed?: number; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-kla-ink">
      <CircuitBackdrop seed={seed} density={45} />
      <div className="container-kla relative py-20 md:py-24">
        <p className="eyebrow text-kla-sky">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl animate-fade-up text-4xl font-light leading-tight text-white md:text-[56px]">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-lg font-light text-white/80">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
