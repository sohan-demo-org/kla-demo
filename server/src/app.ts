import { existsSync } from 'node:fs';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { z } from 'zod';
import { heroSlides, investors, jobs, leaders, milestones, news, products, services } from './data.js';
import type { Store } from './db.js';
import type { SearchResult } from './types.js';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('A valid email is required'),
  company: z.string().trim().min(1, 'Company is required'),
  topic: z.string().trim().min(1, 'Topic is required'),
  product: z.string().trim().optional().nullable(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters'),
});

const applicationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('A valid email is required'),
  linkedin: z.string().trim().url('Must be a valid URL').optional().or(z.literal('')),
  coverLetter: z.string().trim().min(20, 'Tell us a little more (20+ characters)'),
});

const subscriptionSchema = z.object({ email: z.string().trim().email('A valid email is required') });
const statusSchema = z.object({ status: z.enum(['New', 'In Progress', 'Closed']) });

function validationError(res: Response, error: z.ZodError) {
  res.status(400).json({
    error: 'Validation failed',
    issues: error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
  });
}

const str = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);
const matches = (q: string, ...fields: string[]) => fields.join(' ').toLowerCase().includes(q);

export function createApp(store: Store, options: { staticDir?: string } = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'kla-demo-api' });
  });

  app.get('/api/home', (_req, res) => {
    res.json({
      slides: heroSlides,
      metrics: investors.metrics,
      featuredProducts: products.filter((p) => p.featured),
      latestNews: [...news].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3),
    });
  });

  app.get('/api/company', (_req, res) => {
    res.json({ leaders, milestones });
  });

  app.get('/api/products', (req, res) => {
    const category = str(req.query.category);
    const q = str(req.query.q)?.toLowerCase();
    res.json(
      products.filter(
        (p) =>
          (!category || p.category === category) &&
          (!q || matches(q, p.name, p.tagline, p.description, ...p.applications)),
      ),
    );
  });

  app.get('/api/products/:slug', (req, res) => {
    const product = products.find((p) => p.slug === req.params.slug);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 3);
    res.json({ ...product, related });
  });

  app.get('/api/services', (_req, res) => {
    res.json(services);
  });

  app.get('/api/news', (req, res) => {
    const category = str(req.query.category);
    const filtered = category ? news.filter((n) => n.category === category) : news;
    res.json([...filtered].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)));
  });

  app.get('/api/news/:slug', (req, res) => {
    const article = news.find((n) => n.slug === req.params.slug);
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json(article);
  });

  app.get('/api/careers', (req, res) => {
    const location = str(req.query.location);
    const team = str(req.query.team);
    const q = str(req.query.q)?.toLowerCase();
    const filtered = jobs.filter(
      (job) =>
        (!location || job.location === location) &&
        (!team || job.team === team) &&
        (!q || matches(q, job.title, job.summary, job.team, job.location)),
    );
    res.json({
      jobs: filtered,
      facets: {
        locations: [...new Set(jobs.map((j) => j.location))].sort(),
        teams: [...new Set(jobs.map((j) => j.team))].sort(),
      },
    });
  });

  app.get('/api/careers/:id', (req, res) => {
    const job = jobs.find((j) => j.id === req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json(job);
  });

  app.post('/api/careers/:id/applications', (req, res) => {
    const job = jobs.find((j) => j.id === req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    const parsed = applicationSchema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    const { name, email, linkedin, coverLetter } = parsed.data;
    res.status(201).json(
      store.addApplication({ jobId: job.id, jobTitle: job.title, name, email, linkedin: linkedin || null, coverLetter }),
    );
  });

  app.get('/api/investors', (_req, res) => {
    res.json(investors);
  });

  app.get('/api/search', (req, res) => {
    const q = str(req.query.q)?.toLowerCase();
    if (!q) {
      res.json([]);
      return;
    }
    const results: SearchResult[] = [
      ...products
        .filter((p) => matches(q, p.name, p.tagline, p.category, ...p.applications))
        .map((p) => ({ type: 'Product' as const, title: p.name, summary: p.tagline, to: `/products/${p.slug}` })),
      ...services
        .filter((s) => matches(q, s.name, s.summary, ...s.outcomes))
        .map((s) => ({ type: 'Service' as const, title: s.name, summary: s.summary, to: '/services' })),
      ...news
        .filter((n) => matches(q, n.title, n.summary, n.category))
        .map((n) => ({ type: 'News' as const, title: n.title, summary: n.summary, to: `/newsroom/${n.slug}` })),
      ...jobs
        .filter((j) => matches(q, j.title, j.summary, j.team, j.location))
        .map((j) => ({ type: 'Career' as const, title: j.title, summary: `${j.team} · ${j.location}`, to: `/careers/${j.id}` })),
    ];
    res.json(results);
  });

  app.post('/api/contact', (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    res.status(201).json(store.addContactRequest({ ...parsed.data, product: parsed.data.product || null }));
  });

  app.post('/api/subscriptions', (req, res) => {
    const parsed = subscriptionSchema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    const { subscription, created } = store.addSubscription(parsed.data.email);
    res.status(created ? 201 : 200).json({ ...subscription, created });
  });

  app.get('/api/admin/summary', (_req, res) => {
    const inquiries = store.listContactRequests();
    const applications = store.listApplications();
    const subscriptions = store.listSubscriptions();
    res.json({
      counts: {
        inquiries: inquiries.length,
        openInquiries: inquiries.filter((i) => i.status !== 'Closed').length,
        applications: applications.length,
        subscriptions: subscriptions.length,
      },
      inquiries,
      applications,
      subscriptions,
    });
  });

  app.patch('/api/contact/:id', (req: Request, res: Response) => {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    const updated = store.updateContactStatus(Number(req.params.id), parsed.data.status);
    if (!updated) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }
    res.json(updated);
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  const { staticDir } = options;
  if (staticDir && existsSync(staticDir)) {
    app.use(express.static(staticDir));
    app.get('*', (_req, res) => res.sendFile('index.html', { root: staticDir }));
  }

  return app;
}
