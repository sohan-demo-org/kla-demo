import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import type { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { openStore, type Store } from '../src/db.js';

let server: Server;
let store: Store;
let base: string;

before(async () => {
  store = openStore(':memory:');
  server = createApp(store).listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
});

after(() => {
  server.close();
  store.close();
});

async function call(path: string, init?: { method?: string; body?: unknown }) {
  const res = await fetch(`${base}${path}`, {
    method: init?.method ?? 'GET',
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { status: res.status, body: (await res.json()) as any };
}

describe('content endpoints', () => {
  it('reports health', async () => {
    const { status, body } = await call('/health');
    assert.equal(status, 200);
    assert.equal(body.status, 'ok');
  });

  it('serves the home payload with the earnings metrics', async () => {
    const { body } = await call('/home');
    assert.equal(body.slides[0].title, 'KLA announces June quarter earnings');
    assert.deepEqual(
      body.metrics.map((m: { value: string }) => m.value),
      ['$3.66B', '$817M', '$1.05'],
    );
    assert.ok(body.featuredProducts.length > 0);
    assert.equal(body.latestNews.length, 3);
  });

  it('filters products by category and query', async () => {
    const metrology = await call('/products?category=Metrology');
    assert.ok(metrology.body.length > 0);
    assert.ok(metrology.body.every((p: { category: string }) => p.category === 'Metrology'));

    const overlay = await call('/products?q=overlay');
    assert.ok(overlay.body.some((p: { slug: string }) => p.slug === 'archer-overlay'));
  });

  it('returns a product with related items, and 404 for unknown slugs', async () => {
    const found = await call('/products/archer-overlay');
    assert.equal(found.status, 200);
    assert.ok(found.body.related.every((p: { category: string }) => p.category === 'Metrology'));
    assert.equal((await call('/products/nope')).status, 404);
  });

  it('sorts news newest first and filters by category', async () => {
    const { body } = await call('/news');
    const dates = body.map((n: { publishedAt: string }) => n.publishedAt);
    assert.deepEqual(dates, [...dates].sort().reverse());
    const earnings = await call('/news?category=Earnings');
    assert.ok(earnings.body.every((n: { category: string }) => n.category === 'Earnings'));
  });

  it('filters careers and returns facets', async () => {
    const { body } = await call('/careers?team=Software');
    assert.ok(body.jobs.length > 0);
    assert.ok(body.jobs.every((j: { team: string }) => j.team === 'Software'));
    assert.ok(body.facets.teams.includes('Engineering'));
  });

  it('searches across products, news and careers', async () => {
    const { body } = await call('/search?q=packaging');
    const types = new Set(body.map((r: { type: string }) => r.type));
    assert.ok(types.has('Product'));
    assert.ok(types.has('News'));
    assert.deepEqual((await call('/search?q=')).body, []);
  });

  it('returns 404 JSON for unknown API routes', async () => {
    const { status, body } = await call('/does-not-exist');
    assert.equal(status, 404);
    assert.equal(body.error, 'Endpoint not found');
  });
});

describe('persisted submissions', () => {
  it('rejects an invalid contact request with field issues', async () => {
    const { status, body } = await call('/contact', { method: 'POST', body: { name: '', email: 'bad' } });
    assert.equal(status, 400);
    const fields = body.issues.map((i: { field: string }) => i.field);
    assert.ok(fields.includes('email'));
    assert.ok(fields.includes('message'));
  });

  it('stores a contact request and lets admins update its status', async () => {
    const created = await call('/contact', {
      method: 'POST',
      body: {
        name: 'Dana Lee',
        email: 'dana@example.com',
        company: 'Example Fab',
        topic: 'Request a demo',
        product: 'Archer Overlay Metrology',
        message: 'We would like to discuss overlay control for EUV layers.',
      },
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.status, 'New');

    const patched = await call(`/contact/${created.body.id}`, { method: 'PATCH', body: { status: 'In Progress' } });
    assert.equal(patched.body.status, 'In Progress');
    assert.equal((await call('/contact/9999', { method: 'PATCH', body: { status: 'Closed' } })).status, 404);

    const summary = await call('/admin/summary');
    assert.equal(summary.body.counts.inquiries, 1);
    assert.equal(summary.body.counts.openInquiries, 1);
    assert.equal(summary.body.inquiries[0].product, 'Archer Overlay Metrology');
  });

  it('stores a job application and 404s for unknown jobs', async () => {
    const created = await call('/careers/r-2403/applications', {
      method: 'POST',
      body: { name: 'Sam Rivera', email: 'sam@example.com', linkedin: '', coverLetter: 'I have built data platforms for fab analytics.' },
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.jobTitle, 'Software Engineer, Klarity Data Platform');
    assert.equal(created.body.linkedin, null);

    const invalid = await call('/careers/r-2403/applications', { method: 'POST', body: { name: 'x', email: 'x@y.z', coverLetter: 'short' } });
    assert.equal(invalid.status, 400);
    assert.equal((await call('/careers/nope/applications', { method: 'POST', body: {} })).status, 404);
  });

  it('deduplicates newsletter subscriptions', async () => {
    const first = await call('/subscriptions', { method: 'POST', body: { email: 'News@Example.com' } });
    assert.equal(first.status, 201);
    const second = await call('/subscriptions', { method: 'POST', body: { email: 'news@example.com' } });
    assert.equal(second.status, 200);
    assert.equal(second.body.created, false);
    assert.equal((await call('/admin/summary')).body.counts.subscriptions, 1);
  });
});
