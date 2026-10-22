import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { apiGet } from '../api';
import type { SearchResult } from '../types';
import { ChevronDown, CloseIcon, ExternalIcon, GlobeIcon, MenuIcon, SearchIcon } from './Icons';
import Logo from './Logo';

const productMenu = [
  { label: 'All Products', to: '/products' },
  { label: 'Inspection', to: '/products?category=Inspection' },
  { label: 'Metrology', to: '/products?category=Metrology' },
  { label: 'Data Analytics', to: '/products?category=Data%20Analytics' },
  { label: 'Advanced Packaging', to: '/products?category=Packaging' },
  { label: 'PCB & Display', to: '/products?category=PCB%20%26%20Display' },
  { label: 'Yield Lab (interactive demo)', to: '/yield-lab' },
];

const navItems = [
  { label: 'Company', to: '/company' },
  { label: 'Products & Technology', to: '/products', menu: productMenu },
  { label: 'Services', to: '/services' },
  { label: 'Careers', to: '/careers' },
  { label: 'Newsroom', to: '/newsroom' },
  { label: 'Investors', to: '/investors' },
  { label: 'Contact', to: '/contact' },
];

const regions = ['Global (English)', '中国 (简体中文)', '日本 (日本語)', '대한민국 (한국어)', '台灣 (繁體中文)', 'Deutschland (Deutsch)'];

function RegionMenu() {
  const [open, setOpen] = useState(false);
  const [region, setRegion] = useState(regions[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 hover:text-white/80" aria-expanded={open} aria-label={`Region: ${region}`}>
        <GlobeIcon className="h-[18px] w-[18px]" />
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <ul className="absolute right-0 top-8 z-50 w-56 bg-white py-2 text-sm text-kla-purple shadow-2xl">
          {regions.map((r) => (
            <li key={r}>
              <button
                type="button"
                onClick={() => {
                  setRegion(r);
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2 text-left hover:bg-kla-mist ${r === region ? 'font-semibold' : ''}`}
              >
                {r}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      apiGet<SearchResult[]>(`/search?q=${encodeURIComponent(q)}`).then(setResults).catch(() => setResults([]));
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="absolute inset-x-0 top-full z-40 border-t border-black/5 bg-white shadow-2xl">
      <form
        className="container-kla flex items-center gap-4 py-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!q.trim()) return;
          navigate(`/search?q=${encodeURIComponent(q.trim())}`);
          onClose();
        }}
      >
        <SearchIcon className="h-6 w-6 text-kla-purple" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          placeholder="Search products, news, careers…"
          aria-label="Search the site"
          className="flex-1 bg-transparent text-2xl font-light text-kla-purple outline-none placeholder:text-kla-purple/40"
        />
        <button type="button" onClick={onClose} aria-label="Close search" className="text-kla-purple hover:text-kla-blue">
          <CloseIcon className="h-6 w-6" />
        </button>
      </form>
      {results.length > 0 && (
        <ul className="container-kla max-h-[60vh] overflow-y-auto pb-6">
          {results.slice(0, 8).map((r) => (
            <li key={`${r.type}-${r.to}-${r.title}`}>
              <Link to={r.to} onClick={onClose} className="flex items-baseline gap-4 border-t border-black/5 py-3 hover:bg-kla-mist">
                <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-widest text-kla-blue">{r.type}</span>
                <span>
                  <span className="block font-semibold text-kla-purple">{r.title}</span>
                  <span className="block text-sm text-kla-slate">{r.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-kla-purple text-white">
        <div className="container-kla flex h-10 items-center justify-end gap-6 text-[15px]">
          <RegionMenu />
          <Link to="/yield-lab" className="hidden font-semibold text-kla-sky hover:underline sm:block">
            Yield Lab
          </Link>
          <Link to="/services" className="hidden hover:underline sm:block">
            KLA Advance
          </Link>
          <Link to="/company#foundation" className="hidden items-center gap-1.5 hover:underline sm:flex">
            KLA Foundation <ExternalIcon />
          </Link>
          <Link to="/products?category=Instruments" className="hidden items-center gap-1.5 hover:underline sm:flex">
            KLA Instruments <ExternalIcon />
          </Link>
        </div>
      </div>

      <div className={`relative bg-gradient-to-b from-white to-[#F2F2F4] transition-shadow ${scrolled ? 'shadow-lg' : ''}`}>
        <div className={`container-kla flex items-end justify-between transition-all ${scrolled ? 'py-3' : 'py-6'}`}>
          <Link to="/" aria-label="KLA home" className="shrink-0">
            <Logo className={`w-auto transition-all ${scrolled ? 'h-11' : 'h-[60px]'}`} />
          </Link>

          <nav className="hidden items-center gap-7 pb-1 xl:flex" aria-label="Primary">
            {navItems.map((item) => (
              <div key={item.to} className="group relative">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `border-b-2 pb-1 text-[16px] font-semibold tracking-wide transition ${
                      isActive ? 'border-kla-sky text-kla-purple' : 'border-transparent text-kla-purple hover:border-kla-sky'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
                {item.menu && (
                  <div className="invisible absolute left-0 top-full z-50 pt-4 opacity-0 transition group-hover:visible group-hover:opacity-100">
                    <ul className="w-64 border-t-4 border-kla-sky bg-white py-2 shadow-2xl">
                      {item.menu.map((m) => (
                        <li key={m.to}>
                          <Link to={m.to} className="block px-5 py-2.5 text-sm text-kla-purple hover:bg-kla-mist hover:text-kla-blue">
                            {m.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setSearchOpen((o) => !o)} aria-label="Search" className="pb-1 text-kla-purple hover:text-kla-blue">
              <SearchIcon />
            </button>
          </nav>

          <div className="flex items-center gap-4 xl:hidden">
            <button type="button" onClick={() => setSearchOpen((o) => !o)} aria-label="Search" className="text-kla-purple">
              <SearchIcon />
            </button>
            <button type="button" onClick={() => setMobileOpen((o) => !o)} aria-expanded={mobileOpen} aria-label="Toggle navigation" className="text-kla-purple">
              <MenuIcon />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="flex flex-col border-t border-black/5 bg-white px-6 pb-4 xl:hidden" aria-label="Mobile">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="border-b border-black/5 py-3 font-semibold text-kla-purple">
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        {searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}
      </div>
    </header>
  );
}
