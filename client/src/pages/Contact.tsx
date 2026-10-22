import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiPost, issuesByField, useApi } from '../api';
import { CheckIcon } from '../components/Icons';
import PageHeader from '../components/PageHeader';
import type { ContactRequest, Product } from '../types';

const topics = ['Request a demo', 'Product information', 'Service & support', 'Investor relations', 'Media inquiry', 'Other'];
const offices = [
  { city: 'Milpitas, California', role: 'Global headquarters', address: 'One Technology Drive, Milpitas, CA 95035' },
  { city: 'Ann Arbor, Michigan', role: 'R&D and manufacturing', address: 'Ann Arbor, MI' },
  { city: 'Hsinchu, Taiwan', role: 'Customer support center', address: 'Hsinchu Science Park' },
  { city: 'Singapore', role: 'Manufacturing & operations', address: 'Singapore' },
];

export default function Contact() {
  const [params] = useSearchParams();
  const { data: products } = useApi<Product[]>('/products');
  const initial = {
    name: '',
    email: '',
    company: '',
    topic: params.get('topic') ?? '',
    product: params.get('product') ?? '',
    message: '',
  };
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<ContactRequest | null>(null);

  const set = (key: keyof typeof initial) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      setSubmitted(await apiPost<ContactRequest>('/contact', form));
      setForm({ ...initial, topic: '', product: '' });
    } catch (err) {
      const fieldErrors = issuesByField(err);
      setErrors(Object.keys(fieldErrors).length ? fieldErrors : { form: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Contact" title="How can we help?" intro="Tell us about your process control challenge and the right KLA team will get back to you." seed={81} />
      <section className="section grid gap-12 lg:grid-cols-[3fr_2fr]">
        <div>
          {submitted && (
            <div role="status" className="mb-8 flex gap-4 border-l-4 border-emerald-500 bg-emerald-50 p-5">
              <CheckIcon className="h-6 w-6 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-900">Thanks, {submitted.name} — we received your request.</p>
                <p className="mt-1 text-sm text-emerald-800">
                  Reference <strong>KLA-{String(submitted.id).padStart(5, '0')}</strong> · {submitted.topic}
                  {submitted.product ? ` · ${submitted.product}` : ''}. A specialist will reply to {submitted.email}.
                </p>
              </div>
            </div>
          )}
          <form onSubmit={submit} className="grid gap-5 md:grid-cols-2" noValidate>
            {(
              [
                ['name', 'Full name', 'text'],
                ['email', 'Work email', 'email'],
                ['company', 'Company', 'text'],
              ] as const
            ).map(([key, label, type]) => (
              <div key={key}>
                <label htmlFor={key} className="label">{label}</label>
                <input id={key} type={type} value={form[key]} onChange={set(key)} className="input" />
                {errors[key] && <p className="field-error">{errors[key]}</p>}
              </div>
            ))}
            <div>
              <label htmlFor="topic" className="label">Topic</label>
              <select id="topic" value={form.topic} onChange={set('topic')} className="input">
                <option value="">Select a topic</option>
                {topics.map((t) => <option key={t}>{t}</option>)}
              </select>
              {errors.topic && <p className="field-error">{errors.topic}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="product" className="label">Product of interest (optional)</label>
              <select id="product" value={form.product} onChange={set('product')} className="input">
                <option value="">No specific product</option>
                {(products ?? []).map((p) => <option key={p.slug}>{p.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="message" className="label">Message</label>
              <textarea id="message" rows={6} value={form.message} onChange={set('message')} className="input" />
              {errors.message && <p className="field-error">{errors.message}</p>}
            </div>
            {errors.form && <p className="field-error md:col-span-2">{errors.form}</p>}
            <div className="md:col-span-2">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Sending…' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
        <aside className="space-y-4">
          <h2 className="text-2xl font-light text-kla-purple">Global offices</h2>
          {offices.map((o) => (
            <div key={o.city} className="border-l-4 border-kla-sky bg-kla-mist p-5">
              <p className="font-semibold text-kla-purple">{o.city}</p>
              <p className="text-sm text-kla-blue">{o.role}</p>
              <p className="mt-1 text-sm text-kla-slate">{o.address}</p>
            </div>
          ))}
        </aside>
      </section>
    </>
  );
}
