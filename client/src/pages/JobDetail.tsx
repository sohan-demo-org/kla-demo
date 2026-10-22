import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiPost, formatDate, issuesByField, useApi } from '../api';
import { CheckIcon } from '../components/Icons';
import PageHeader from '../components/PageHeader';
import { ErrorNotice, Loading } from '../components/StateMessage';
import type { Application, Job } from '../types';

const empty = { name: '', email: '', linkedin: '', coverLetter: '' };

export default function JobDetail() {
  const { id = '' } = useParams();
  const { data: job, error, loading } = useApi<Job>(`/careers/${id}`);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Application | null>(null);

  if (loading) return <div className="section"><Loading label="Loading role" /></div>;
  if (error || !job)
    return (
      <div className="section">
        <ErrorNotice message={error ?? 'Role not found'} />
        <Link to="/careers" className="btn-outline mt-6">Back to careers</Link>
      </div>
    );

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      setSubmitted(await apiPost<Application>(`/careers/${id}/applications`, form));
      setForm(empty);
    } catch (err) {
      setErrors(issuesByField(err));
    } finally {
      setSubmitting(false);
    }
  }

  const field = (key: keyof typeof empty, label: string, type = 'text') => (
    <div>
      <label htmlFor={key} className="label">{label}</label>
      <input id={key} type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input" />
      {errors[key] && <p className="field-error">{errors[key]}</p>}
    </div>
  );

  return (
    <>
      <PageHeader eyebrow={`${job.team} · ${job.location}`} title={job.title} intro={job.summary} seed={id.length * 9}>
        <p className="mt-6 text-sm text-white/60">
          Req {job.id.toUpperCase()} · {job.type} · Posted {formatDate(job.postedAt)}
        </p>
      </PageHeader>
      <section className="section grid gap-12 lg:grid-cols-[3fr_2fr]">
        <div>
          <Link to="/careers" className="text-sm font-semibold text-kla-blue hover:underline">← All open roles</Link>
          <h2 className="mt-8 text-2xl font-light text-kla-purple">What you’ll do</h2>
          <ul className="mt-4 space-y-3">
            {job.responsibilities.map((r) => (
              <li key={r} className="flex gap-3 text-kla-slate"><CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-kla-sky" /> {r}</li>
            ))}
          </ul>
          <h2 className="mt-10 text-2xl font-light text-kla-purple">What you’ll bring</h2>
          <ul className="mt-4 space-y-3">
            {job.qualifications.map((r) => (
              <li key={r} className="flex gap-3 text-kla-slate"><CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-kla-sky" /> {r}</li>
            ))}
          </ul>
        </div>

        <aside className="self-start border-t-4 border-kla-purple bg-kla-mist p-6">
          {submitted ? (
            <div role="status">
              <h2 className="text-2xl font-light text-kla-purple">Application received</h2>
              <p className="mt-3 text-kla-slate">
                Thanks, {submitted.name}. Your application for <strong>{submitted.jobTitle}</strong> has been submitted
                (reference APP-{String(submitted.id).padStart(4, '0')}).
              </p>
              <button type="button" onClick={() => setSubmitted(null)} className="btn-outline mt-6">Submit another</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <h2 className="text-2xl font-light text-kla-purple">Apply for this role</h2>
              {field('name', 'Full name')}
              {field('email', 'Email', 'email')}
              {field('linkedin', 'LinkedIn URL (optional)', 'url')}
              <div>
                <label htmlFor="coverLetter" className="label">Why KLA?</label>
                <textarea id="coverLetter" rows={5} value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} className="input" />
                {errors.coverLetter && <p className="field-error">{errors.coverLetter}</p>}
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
            </form>
          )}
        </aside>
      </section>
    </>
  );
}
