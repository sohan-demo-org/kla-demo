export default function Logo({ variant = 'dark', className = 'h-14 w-auto' }: { variant?: 'dark' | 'light'; className?: string }) {
  const ink = variant === 'dark' ? '#3D0A7F' : '#FFFFFF';
  return (
    <svg viewBox="0 0 176 64" className={className} role="img" aria-label="KLA — Keep Looking Ahead">
      <g fill="none" stroke={ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4v34" />
        <path d="M34 4 7 21l27 17" />
        <path d="M48 4v34h31" />
        <path d="M88 38 108 5l20 33" />
      </g>
      <rect x="135" y="2" width="38" height="38" fill="#48A9E0" />
      <path d="M154 9v24M142 21h24" stroke="#fff" strokeWidth="2.6" />
      <text x="174" y="59" textAnchor="end" fill={ink} fontSize="12.4" fontFamily="'Open Sans', sans-serif" letterSpacing="0.2">
        Keep Looking Ahead
      </text>
    </svg>
  );
}
