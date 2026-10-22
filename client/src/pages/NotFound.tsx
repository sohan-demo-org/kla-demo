import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section text-center">
      <p className="eyebrow">404</p>
      <h1 className="heading mt-3">We couldn’t find that page</h1>
      <p className="mt-4 text-kla-slate">The page may have moved, or the link may be out of date.</p>
      <Link to="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </section>
  );
}
