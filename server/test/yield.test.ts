import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../src/app.js';
import { openStore, type Store } from '../src/db.js';
import { classify } from '../src/yield.js';

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

const sigAt = (wafers: { slot: number; signature: string }[], slot: number) => wafers.find((w) => w.slot === slot)!.signature;

describe('spatial signature classifier', () => {
  const grid = (n: number, offset = 0) =>
    Array.from({ length: n }, (_, i) => ({ id: i + offset, x: ((i * 37) % 260) - 130, y: ((i * 53) % 260) - 130 })).filter(
      (p) => Math.hypot(p.x, p.y) < 140,
    );

  it('calls a spread-out pattern random', () => {
    assert.equal(classify(grid(60))[0].type, 'Random');
  });

  it('finds a straight line of defects as a scratch', () => {
    const line = Array.from({ length: 60 }, (_, i) => ({ id: 1000 + i, x: -60 + i * 1.2, y: 30 + i * 0.4 }));
    const [top] = classify([...grid(60), ...line]);
    assert.equal(top.type, 'Scratch');
    assert.ok(line.every((p) => top.memberIds.includes(p.id)));
  });

  it('finds the same in-die location on many dies as a reticle repeater', () => {
    const repeats = Array.from({ length: 30 }, (_, i) => ({ id: 2000 + i, x: -96 + (i % 6) * 36 + 4.2, y: -60 + Math.floor(i / 6) * 24 + 7.6 }));
    assert.equal(classify([...grid(60), ...repeats])[0].type, 'Reticle Repeater');
  });

  it('finds defects crowded at the wafer edge as an edge ring', () => {
    const ring = Array.from({ length: 80 }, (_, i) => ({ id: 3000 + i, x: 140 * Math.cos(i / 12.7), y: 140 * Math.sin(i / 12.7) }));
    assert.equal(classify([...grid(60), ...ring])[0].type, 'Edge Ring');
  });
});

describe('yield lab API', () => {
  it('lists the inspection tools and demo lots', async () => {
    const tools = await call('/yield/tools');
    assert.deepEqual(tools.body.map((t: { id: string }) => t.id), ['esl10', '39xx', 'legacy']);
    const lots = await call('/yield/lots');
    assert.equal(lots.status, 200);
    assert.equal(lots.body.length, 3);
    assert.ok(lots.body.every((l: { meanYield: number }) => l.meanYield > 50 && l.meanYield < 100));
  });

  it('detects the CMP scratch excursion with a sensitive tool but not a legacy one', async () => {
    const sensitive = await call('/yield/lots/N3L-24A17?minSize=25');
    assert.equal(sensitive.body.wafers.length, 25);
    for (const slot of [9, 10, 11, 12, 13, 14]) assert.equal(sigAt(sensitive.body.wafers, slot), 'Scratch');
    assert.equal(sigAt(sensitive.body.wafers, 2), 'Random');

    const legacy = await call('/yield/lots/N3L-24A17?minSize=90');
    for (const slot of [9, 10, 11, 12, 13, 14]) assert.equal(sigAt(legacy.body.wafers, slot), 'Random');
    assert.ok(legacy.body.summary.unexplained >= 4, 'yield drops without a captured signature');
  });

  it('traces the growing reticle repeater and the PM2 edge ring', async () => {
    const dram = await call('/yield/lots/D1B-09B32');
    assert.equal(sigAt(dram.body.wafers, 3), 'Random');
    assert.equal(sigAt(dram.body.wafers, 20), 'Reticle Repeater');
    assert.ok(dram.body.wafers[24].yield < dram.body.wafers[0].yield - 15);

    const nand = await call('/yield/lots/V3N-11C88');
    assert.ok(nand.body.wafers.filter((w: { chamber: string; signature: string }) => w.chamber === 'PM2').every((w: { signature: string }) => w.signature === 'Edge Ring'));
    assert.equal(nand.body.commonality.chamber, 'PM2');
  });

  it('returns a wafer map with dies, defects and a recommendation', async () => {
    const { status, body } = await call('/yield/lots/N3L-24A17/wafers/12?minSize=25');
    assert.equal(status, 200);
    assert.ok(body.dies.length > 400);
    assert.equal(body.signatures[0].type, 'Scratch');
    assert.equal(body.signatures[0].product.slug, 'surfscan-sp7xp');
    assert.equal(body.stats.goodDies, body.dies.filter((d: { good: boolean }) => d.good).length);
    assert.equal(body.defects.filter((d: { captured: boolean }) => d.captured).length, body.stats.defects);
    assert.equal((await call('/yield/lots/N3L-24A17/wafers/26')).status, 404);
    assert.equal((await call('/yield/lots/NOPE')).status, 404);
  });

  it('opens an excursion, lists it on the lot and in the console, and updates its status', async () => {
    const invalid = await call('/yield/excursions', { method: 'POST', body: { lotId: 'NOPE', slots: [], signature: 'Scratch', owner: '' } });
    assert.equal(invalid.status, 400);
    assert.deepEqual(invalid.body.issues.map((i: { field: string }) => i.field).sort(), ['lotId', 'owner', 'slots']);

    const created = await call('/yield/excursions', {
      method: 'POST',
      body: { lotId: 'N3L-24A17', slots: [12, 9, 9, 10], signature: 'Scratch', owner: 'CMP module', note: 'Pull CMP-07' },
    });
    assert.equal(created.status, 201);
    assert.deepEqual(created.body.slots, [9, 10, 12]);
    assert.equal(created.body.status, 'Open');

    assert.equal((await call('/yield/lots/N3L-24A17')).body.excursions.length, 1);
    assert.equal((await call('/yield/lots/D1B-09B32')).body.excursions.length, 0);
    assert.equal((await call('/admin/summary')).body.counts.openExcursions, 1);

    const closed = await call(`/yield/excursions/${created.body.id}`, { method: 'PATCH', body: { status: 'Closed' } });
    assert.equal(closed.body.status, 'Closed');
    assert.equal((await call('/admin/summary')).body.counts.openExcursions, 0);
    assert.equal((await call('/yield/excursions/999', { method: 'PATCH', body: { status: 'Closed' } })).status, 404);
  });
});
