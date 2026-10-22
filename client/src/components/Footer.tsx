import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiPost, issuesByField } from '../api';
import Logo from './Logo';

const columns = [
  {
    title: 'Company',
    links: [
      { label: 'About KLA', to: '/company' },
      { label: 'Leadership', to: '/company#leadership' },
      { label: 'KLA Foundation', to: '/company#foundation' },
      { label: 'Careers', to: '/careers' },
    ],
  },
  {
    title: 'Products & Technology',
    links: [
      { label: 'Inspection', to: '/products?category=Inspection' },
      { label: 'Metrology', to: '/products?category=Metrology' },
      { label: 'Data Analytics', to: '/products?category=Data%20Analytics' },
      { label: 'Advanced Packaging', to: '/products?category=Packaging' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Newsroom', to: '/newsroom' },
      { label: 'Investors', to: '/investors' },
      { label: 'Services', to: '/services' },
      { label: 'Contact', to: '/contact' },
    ],
  },
];

function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<{ kind: 'idle' | 'ok' | 'error'; text?: string }>({ kind: 'idle' });

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await apiPost<{ created: boolean }>('/subscriptions', { email });
      setState({ kind: 'ok', text: res.created ? 'Thanks — you are subscribed to KLA news.' : 'You are already subscribed.' });
      setEmail('');
    } catch (err) {
      setState({ kind: 'error', text: issuesByField(err).email ?? 'Could not subscribe. Try again.' });
    }
  }

  return (
    <form onSubmit={submit} className="max-w-sm" noValidate>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Stay informed</p>
      <p className="mt-2 text-sm text-white/70">Get press releases and earnings updates in your inbox.</p>
      <div className="mt-4 flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          aria-label="Email address"
          className="min-w-0 flex-1 border border-white/30 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-kla-sky"
        />
        <button type="submit" className="bg-kla-sky px-5 text-sm font-semibold text-white hover:bg-kla-blue">
          Subscribe
        </button>
      </div>
      {state.kind !== 'idle' && (
        <p role="status" className={`mt-2 text-sm ${state.kind === 'ok' ? 'text-emerald-300' : 'text-red-300'}`}>
          {state.text}
        </p>
      )}
    </form>
  );
}

export default function Footer() {
  return (
    <footer className="bg-kla-purple-dark text-white">
      <div className="container-kla grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr_1.4fr]">
        <div>
          <Logo variant="light" className="h-14 w-auto" />
          <p className="mt-6 max-w-xs text-sm text-white/70">
            Process control and process-enabling solutions that help the world’s chipmakers keep looking ahead.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white">{col.title}</p>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-white/70 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Newsletter />
      </div>
      <div className="border-t border-white/10">
        <div className="container-kla flex flex-col gap-2 py-5 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} KLA demo. Sample content for demonstration only; not affiliated with KLA Corporation.</p>
          <Link to="/admin" className="hover:text-white">
            Demo console
          </Link>
        </div>
      </div>
    </footer>
  );
}
