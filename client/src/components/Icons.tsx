type P = { className?: string };
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const GlobeIcon = ({ className = 'h-4 w-4' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
  </svg>
);
export const ChevronDown = ({ className = 'h-4 w-4' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2.5}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const ChevronLeft = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);
export const ChevronRight = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);
export const ExternalIcon = ({ className = 'h-3.5 w-3.5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);
export const SearchIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2.4}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="m15 15 5 5" />
  </svg>
);
export const CloseIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const ArrowRight = ({ className = 'h-4 w-4' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const CheckIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2.5}>
    <path d="m5 12 5 5 9-10" />
  </svg>
);
export const MenuIcon = ({ className = 'h-6 w-6' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
