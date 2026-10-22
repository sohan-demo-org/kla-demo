import { products } from './data.js';

// Simulated wafer-inspection data and a spatial-signature classifier for the Yield Lab demo.
// All lots, wafers and defects are generated deterministically from fixed seeds.

export type DefectClass = 'Particle' | 'Residue' | 'Pit' | 'Pattern' | 'Scratch';
export type SignatureType = 'Scratch' | 'Reticle Repeater' | 'Edge Ring' | 'Center Cluster' | 'Random';
export const signatureTypes: SignatureType[] = ['Scratch', 'Reticle Repeater', 'Edge Ring', 'Center Cluster', 'Random'];

export interface Defect {
  id: number;
  x: number;
  y: number;
  sizeNm: number;
  cls: DefectClass;
  killer: boolean;
}

export interface Die {
  col: number;
  row: number;
  x: number;
  y: number;
}

export interface InspectionTool {
  id: string;
  name: string;
  slug: string | null;
  minSizeNm: number;
  description: string;
}

export const WAFER_RADIUS = 150;
const USABLE_RADIUS = 147;
export const DIE_SIZE = 12;
const DIE_AREA_CM2 = (DIE_SIZE / 10) ** 2;
const EDGE_BAND = 128;
const CENTER_BAND = 40;

export const inspectionTools: InspectionTool[] = [
  { id: 'esl10', name: 'eSL10 e-Beam', slug: 'esl10-ebeam', minSizeNm: 15, description: 'Highest sensitivity; slower, used for engineering analysis.' },
  { id: '39xx', name: '39xx Broadband Plasma', slug: '39xx-broadband-plasma', minSizeNm: 25, description: 'Optical patterned-wafer inspection at production throughput.' },
  { id: 'legacy', name: 'Legacy brightfield', slug: null, minSizeNm: 90, description: 'Generic older-generation optical tool, for comparison.' },
];

type Injection = { type: Exclude<SignatureType, 'Random'>; strength: number };

interface LotSpec {
  id: string;
  product: string;
  layer: string;
  processTool: string;
  story: string;
  seed: number;
  baseline: number;
  repeaterOffset: [number, number];
  wafer: (slot: number) => { chamber: string; injections: Injection[] };
}

const lotSpecs: LotSpec[] = [
  {
    id: 'N3L-24A17',
    product: '3 nm logic',
    layer: 'M1 CMP',
    processTool: 'CMP-07',
    story: 'Copper CMP step. Something starts scratching wafers part-way through the lot.',
    seed: 2417,
    baseline: 70,
    repeaterOffset: [3.1, 8.4],
    wafer: (slot) => ({
      chamber: slot % 3 === 0 ? 'Platen C' : slot % 3 === 1 ? 'Platen A' : 'Platen B',
      injections:
        slot >= 9 && slot <= 14 ? [{ type: 'Scratch', strength: slot === 11 || slot === 12 ? 3 : 2 }]
        : slot === 19 ? [{ type: 'Center Cluster', strength: 1 }]
        : [],
    }),
  },
  {
    id: 'D1B-09B32',
    product: '1β DRAM',
    layer: 'Contact litho',
    processTool: 'SCAN-03',
    story: 'Contact layer exposure. A defect on the reticle grows wafer after wafer.',
    seed: 932,
    baseline: 60,
    repeaterOffset: [4.2, 7.6],
    wafer: (slot) => ({
      chamber: slot % 2 === 0 ? 'Chuck 2' : 'Chuck 1',
      injections: slot >= 6 ? [{ type: 'Reticle Repeater', strength: Math.min(0.5, 0.06 + (slot - 6) * 0.022) }] : [],
    }),
  },
  {
    id: 'V3N-11C88',
    product: '3D NAND',
    layer: 'Channel-hole etch',
    processTool: 'ETCH-12',
    story: 'High-aspect-ratio etch on a two-chamber tool. Only one chamber is misbehaving.',
    seed: 1188,
    baseline: 65,
    repeaterOffset: [6.0, 2.5],
    wafer: (slot) => ({
      chamber: slot % 2 === 0 ? 'PM2' : 'PM1',
      injections: slot % 2 === 0 ? [{ type: 'Edge Ring', strength: 0.8 + ((slot * 7) % 5) * 0.1 }] : [],
    }),
  },
];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;
const normal = (rng: Rng) => Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng());
const lognormal = (rng: Rng, median: number, sigma: number) => median * Math.exp(sigma * normal(rng));
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, digits = 1) => Number(v.toFixed(digits));

function poisson(rng: Rng, lambda: number) {
  const limit = Math.exp(-lambda);
  let k = 0;
  let p = rng();
  while (p > limit) {
    k++;
    p *= rng();
  }
  return k;
}

function pick<T>(rng: Rng, weighted: [T, number][]): T {
  let r = rng() * weighted.reduce((s, [, w]) => s + w, 0);
  for (const [value, w] of weighted) {
    r -= w;
    if (r <= 0) return value;
  }
  return weighted[weighted.length - 1][0];
}

const killerBase: Record<DefectClass, number> = { Particle: 0.55, Residue: 0.4, Pit: 0.2, Pattern: 0.75, Scratch: 0.8 };
const killerProbability = (cls: DefectClass, sizeNm: number) => killerBase[cls] * Math.min(1, (sizeNm / 50) ** 1.2);

export const dies: Die[] = (() => {
  const list: Die[] = [];
  const n = (2 * WAFER_RADIUS) / DIE_SIZE;
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const x = -WAFER_RADIUS + col * DIE_SIZE;
      const y = -WAFER_RADIUS + row * DIE_SIZE;
      const corners = [[x, y], [x + DIE_SIZE, y], [x, y + DIE_SIZE], [x + DIE_SIZE, y + DIE_SIZE]];
      if (corners.every(([cx, cy]) => Math.hypot(cx, cy) <= USABLE_RADIUS)) list.push({ col, row, x, y });
    }
  }
  return list;
})();

const dieKey = (col: number, row: number) => `${col},${row}`;
const dieIndex = new Map(dies.map((d, i) => [dieKey(d.col, d.row), i]));
const dieOf = (d: { x: number; y: number }) =>
  dieIndex.get(dieKey(Math.floor((d.x + WAFER_RADIUS) / DIE_SIZE), Math.floor((d.y + WAFER_RADIUS) / DIE_SIZE)));

function generateWafer(spec: LotSpec, slot: number, injections: Injection[]): Defect[] {
  const rng = mulberry32(spec.seed * 101 + slot * 7919);
  const out: Omit<Defect, 'id' | 'killer'>[] = [];
  const add = (x: number, y: number, sizeNm: number, cls: DefectClass) => {
    if (Math.hypot(x, y) <= USABLE_RADIUS) out.push({ x: round(x, 2), y: round(y, 2), sizeNm: Math.round(clamp(sizeNm, 12, 900)), cls });
  };

  const background = poisson(rng, spec.baseline * (0.85 + 0.3 * rng()));
  for (let i = 0; i < background; i++) {
    const r = USABLE_RADIUS * Math.sqrt(rng());
    const a = 2 * Math.PI * rng();
    const cls = pick<DefectClass>(rng, [['Particle', 0.5], ['Residue', 0.2], ['Pit', 0.15], ['Pattern', 0.15]]);
    add(r * Math.cos(a), r * Math.sin(a), lognormal(rng, 55, 0.65), cls);
  }

  for (const inj of injections) {
    if (inj.type === 'Scratch') {
      for (let s = 0; s < inj.strength; s++) {
        const r0 = 90 * Math.sqrt(rng());
        const a0 = 2 * Math.PI * rng();
        const theta = 2 * Math.PI * rng();
        const length = 100 + 70 * rng();
        const sag = (rng() - 0.5) * 24;
        const count = Math.round(length * 0.75);
        const [sx, sy] = [r0 * Math.cos(a0) - (Math.cos(theta) * length) / 2, r0 * Math.sin(a0) - (Math.sin(theta) * length) / 2];
        for (let i = 0; i < count; i++) {
          const t = rng();
          const offset = sag * Math.sin(Math.PI * t) + normal(rng) * 0.35;
          add(sx + Math.cos(theta) * length * t - Math.sin(theta) * offset, sy + Math.sin(theta) * length * t + Math.cos(theta) * offset, 28 + 50 * rng(), 'Scratch');
        }
      }
    } else if (inj.type === 'Reticle Repeater') {
      const [ox, oy] = spec.repeaterOffset;
      for (const d of dies) {
        if (rng() < inj.strength) add(d.x + ox + normal(rng) * 0.06, d.y + oy + normal(rng) * 0.06, 35 + 35 * rng(), 'Pattern');
      }
    } else if (inj.type === 'Edge Ring') {
      const count = Math.round(200 * inj.strength);
      for (let i = 0; i < count; i++) {
        const r = Math.max(EDGE_BAND + 1, USABLE_RADIUS - Math.abs(normal(rng)) * 7);
        const a = 2 * Math.PI * rng();
        add(r * Math.cos(a), r * Math.sin(a), lognormal(rng, 110, 0.5), 'Residue');
      }
    } else {
      const count = Math.round(60 * inj.strength);
      for (let i = 0; i < count; i++) {
        const r = Math.abs(normal(rng)) * 16;
        const a = 2 * Math.PI * rng();
        add(r * Math.cos(a), r * Math.sin(a), lognormal(rng, 80, 0.5), 'Particle');
      }
    }
  }

  return out.map((d, id) => ({ ...d, id, killer: rng() < killerProbability(d.cls, d.sizeNm) }));
}

interface WaferData {
  slot: number;
  chamber: string;
  defects: Defect[];
}

const lotCache = new Map<string, WaferData[]>();
const HISTORY_WAFERS = 50;

function cached(key: string, build: () => WaferData[]) {
  let wafers = lotCache.get(key);
  if (!wafers) {
    wafers = build();
    lotCache.set(key, wafers);
  }
  return wafers;
}

const lotWafers = (spec: LotSpec) =>
  cached(spec.id, () =>
    Array.from({ length: 25 }, (_, i) => {
      const slot = i + 1;
      const { chamber, injections } = spec.wafer(slot);
      return { slot, chamber, defects: generateWafer(spec, slot, injections) };
    }),
  );

// In-control wafers from earlier lots of the same layer; SPC limits are set from this history.
const historyWafers = (spec: LotSpec) =>
  cached(`${spec.id}:history`, () =>
    Array.from({ length: HISTORY_WAFERS }, (_, i) => ({ slot: 1000 + i, chamber: 'history', defects: generateWafer(spec, 1000 + i, []) })),
  );

export interface Signature {
  type: SignatureType;
  confidence: number;
  memberIds: number[];
  evidence: string;
}

type Pt = Pick<Defect, 'id' | 'x' | 'y'>;

function findRepeater(points: Pt[]): Signature | null {
  const BIN = 0.6;
  const bins = Math.round(DIE_SIZE / BIN);
  const grid = new Map<string, Pt[]>();
  const binOf = (p: Pt) => {
    const rx = (((p.x + WAFER_RADIUS) % DIE_SIZE) + DIE_SIZE) % DIE_SIZE;
    const ry = (((p.y + WAFER_RADIUS) % DIE_SIZE) + DIE_SIZE) % DIE_SIZE;
    return [Math.min(bins - 1, Math.floor(rx / BIN)), Math.min(bins - 1, Math.floor(ry / BIN))];
  };
  for (const p of points) {
    const key = binOf(p).join(',');
    grid.set(key, [...(grid.get(key) ?? []), p]);
  }
  let best: Pt[] = [];
  let bestAt: [number, number] = [0, 0];
  for (let bx = 0; bx < bins; bx++) {
    for (let by = 0; by < bins; by++) {
      const members: Pt[] = [];
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) members.push(...(grid.get(`${bx + dx},${by + dy}`) ?? []));
      if (members.length > best.length) {
        best = members;
        bestAt = [bx, by];
      }
    }
  }
  const expected = (points.length * 9) / (bins * bins);
  const threshold = Math.max(10, expected + 5 * Math.sqrt(expected) + 3);
  if (best.length < threshold) return null;
  const diesHit = new Set(best.map((p) => dieOf(p))).size;
  return {
    type: 'Reticle Repeater',
    confidence: round(clamp(0.6 + (0.4 * (best.length - threshold)) / threshold, 0.6, 0.99), 2),
    memberIds: best.map((p) => p.id),
    evidence: `${best.length} defects at the same in-die location (${(bestAt[0] * BIN + BIN / 2).toFixed(1)}, ${(bestAt[1] * BIN + BIN / 2).toFixed(1)}) mm across ${diesHit} dies`,
  };
}

function dbscan(points: Pt[], eps: number, minPts: number): Pt[][] {
  const labels = new Array<number>(points.length).fill(-1);
  const neighbors = (i: number) => points.flatMap((q, j) => (Math.hypot(points[i].x - q.x, points[i].y - q.y) <= eps ? [j] : []));
  const clusters: Pt[][] = [];
  for (let i = 0; i < points.length; i++) {
    if (labels[i] !== -1) continue;
    const seed = neighbors(i);
    if (seed.length < minPts) continue;
    const cluster = clusters.length;
    clusters.push([]);
    const queue = [...seed];
    labels[i] = cluster;
    while (queue.length) {
      const j = queue.pop()!;
      if (labels[j] !== -1) continue;
      labels[j] = cluster;
      const n = neighbors(j);
      if (n.length >= minPts) queue.push(...n.filter((k) => labels[k] === -1));
    }
  }
  points.forEach((p, i) => labels[i] >= 0 && clusters[labels[i]].push(p));
  return clusters;
}

function findScratch(points: Pt[]): Signature | null {
  const lines = dbscan(points, 4, 4).flatMap((cluster) => {
    if (cluster.length < 12) return [];
    const mx = cluster.reduce((s, p) => s + p.x, 0) / cluster.length;
    const my = cluster.reduce((s, p) => s + p.y, 0) / cluster.length;
    let sxx = 0;
    let syy = 0;
    let sxy = 0;
    for (const p of cluster) {
      sxx += (p.x - mx) ** 2;
      syy += (p.y - my) ** 2;
      sxy += (p.x - mx) * (p.y - my);
    }
    [sxx, syy, sxy] = [sxx / cluster.length, syy / cluster.length, sxy / cluster.length];
    const mid = (sxx + syy) / 2;
    const spread = Math.sqrt(((sxx - syy) / 2) ** 2 + sxy ** 2);
    const elongation = Math.sqrt((mid + spread) / Math.max(mid - spread, 1e-6));
    const length = Math.sqrt(12 * (mid + spread));
    const edgeShare = cluster.filter((p) => Math.hypot(p.x, p.y) > EDGE_BAND).length / cluster.length;
    return elongation > 5 && length > 25 && edgeShare < 0.6 ? [{ cluster, elongation, length }] : [];
  });
  if (!lines.length) return null;
  const elongation = Math.max(...lines.map((l) => l.elongation));
  const totalLength = lines.reduce((s, l) => s + l.length, 0);
  return {
    type: 'Scratch',
    confidence: round(clamp(0.6 + 0.03 * (elongation - 5) + totalLength / 1000, 0.6, 0.99), 2),
    memberIds: lines.flatMap((l) => l.cluster.map((p) => p.id)),
    evidence: `${lines.length} linear cluster${lines.length > 1 ? 's' : ''}, ${Math.round(totalLength)} mm long, aspect ratio ${elongation.toFixed(0)}:1`,
  };
}

function findRadial(points: Pt[], type: 'Edge Ring' | 'Center Cluster'): Signature | null {
  if (!points.length) return null;
  const edge = type === 'Edge Ring';
  const members = points.filter((p) => (edge ? Math.hypot(p.x, p.y) > EDGE_BAND : Math.hypot(p.x, p.y) < CENTER_BAND));
  const share = members.length / points.length;
  const expected = edge ? 1 - (EDGE_BAND / USABLE_RADIUS) ** 2 : (CENTER_BAND / USABLE_RADIUS) ** 2;
  const [minCount, minShare] = edge ? [20, 0.42] : [12, 0.25];
  if (members.length < minCount || share < minShare) return null;
  return {
    type,
    confidence: round(clamp(0.6 + (share - minShare) * 1.2, 0.6, 0.99), 2),
    memberIds: members.map((p) => p.id),
    evidence: `${Math.round(share * 100)}% of defects ${edge ? `beyond r = ${EDGE_BAND} mm` : `within r = ${CENTER_BAND} mm`} (random would be ${Math.round(expected * 100)}%)`,
  };
}

export function classify(points: Pt[]): Signature[] {
  const found: Signature[] = [];
  let remaining = points;
  const take = (sig: Signature | null) => {
    if (!sig) return;
    found.push(sig);
    const used = new Set(sig.memberIds);
    remaining = remaining.filter((p) => !used.has(p.id));
  };
  take(findRepeater(remaining));
  take(findScratch(remaining));
  take(findRadial(remaining, 'Edge Ring'));
  take(findRadial(remaining, 'Center Cluster'));
  found.sort((a, b) => b.confidence - a.confidence);
  if (!found.length) {
    found.push({ type: 'Random', confidence: 0.9, memberIds: [], evidence: `${points.length} captured defects with no spatial pattern above the random baseline` });
  }
  return found;
}

const playbook: Record<SignatureType, { rootCause: string; action: string; slug: string }> = {
  Scratch: {
    rootCause: 'Mechanical contact: CMP pad or conditioner debris, or a wafer-handling robot dragging across the surface.',
    action: 'Hold the CMP tool, inspect the pad conditioner and run bare monitor wafers to requalify it.',
    slug: 'surfscan-sp7xp',
  },
  'Reticle Repeater': {
    rootCause: 'The same in-die location fails on every exposure, so the defect is on the reticle (e.g. haze growth), not the wafer.',
    action: 'Quarantine the reticle, send it for inspection and cleaning, and re-expose affected wafers.',
    slug: 'teron-reticle',
  },
  'Edge Ring': {
    rootCause: 'Edge-localized defectivity: worn chamber edge ring, plasma non-uniformity at the bevel, or edge-bead removal issues.',
    action: 'Compare chambers. If one chamber owns the signature, take it down for an edge-ring swap and seasoning.',
    slug: 'pwg-wafer-geometry',
  },
  'Center Cluster': {
    rootCause: 'Center-localized particles: dispense-arm drip, center-fast polish, or a showerhead issue above the wafer center.',
    action: 'Check the center dispense and chuck; review the film thickness profile for center-fast behavior.',
    slug: 'spectrashape-ocd',
  },
  Random: {
    rootCause: 'No systematic signature: defectivity is consistent with the random particle baseline.',
    action: 'No containment needed. Keep monitoring defect density trends.',
    slug: 'klarity',
  },
};

const recommendation = (type: SignatureType) => {
  const { rootCause, action, slug } = playbook[type];
  const product = products.find((p) => p.slug === slug);
  return { rootCause, action, product: product ? { slug: product.slug, name: product.name } : null };
};

const countBy = <T extends string>(items: T[]) =>
  items.reduce<Record<string, number>>((acc, k) => ({ ...acc, [k]: (acc[k] ?? 0) + 1 }), {});

function analyzeWafer(w: WaferData, minSizeNm: number) {
  const captured = w.defects.filter((d) => d.sizeNm >= minSizeNm);
  const signatures = classify(captured);
  const badDies = new Set<number>();
  let killersInDies = 0;
  for (const d of w.defects) {
    const die = dieOf(d);
    if (d.killer && die !== undefined) {
      badDies.add(die);
      killersInDies++;
    }
  }
  const actualYield = 1 - badDies.size / dies.length;
  const d0 = killersInDies / (dies.length * DIE_AREA_CM2);
  const killers = w.defects.filter((d) => d.killer);
  const capturedKillers = killers.filter((d) => d.sizeNm >= minSizeNm).length;
  return {
    captured,
    signatures,
    badDies,
    stats: {
      defects: captured.length,
      totalDefects: w.defects.length,
      killers: killers.length,
      capturedKillers,
      missedKillers: killers.length - capturedKillers,
      killerCaptureRate: killers.length ? round(capturedKillers / killers.length, 3) : 1,
      yield: round(actualYield * 100),
      poissonYield: round(Math.exp(-d0 * DIE_AREA_CM2) * 100),
      d0: round(d0, 3),
      goodDies: dies.length - badDies.size,
      totalDies: dies.length,
    },
  };
}

function controlLimits(values: number[], minSigma: number) {
  const center = values.reduce((s, v) => s + v, 0) / values.length;
  const sigma = Math.max(minSigma, Math.sqrt(values.reduce((s, v) => s + (v - center) ** 2, 0) / (values.length - 1)));
  return { center: round(center), sigma: round(sigma, 2), lower: round(center - 3 * sigma), upper: round(center + 3 * sigma) };
}

export const parseMinSize = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(clamp(n, 10, 300)) : 25;
};

const findLot = (id: string) => lotSpecs.find((l) => l.id === id);
export const lotExists = (id: string) => Boolean(findLot(id));

const lotMeta = (spec: LotSpec) => ({ id: spec.id, product: spec.product, layer: spec.layer, processTool: spec.processTool, story: spec.story });

export function lotDetail(id: string, minSizeNm: number) {
  const spec = findLot(id);
  if (!spec) return undefined;
  const analyses = lotWafers(spec).map((w) => ({ w, a: analyzeWafer(w, minSizeNm) }));
  const history = historyWafers(spec).map((w) => analyzeWafer(w, minSizeNm).stats);
  const yieldLimits = controlLimits(history.map((s) => s.yield), 1.2);
  const countLimits = controlLimits(history.map((s) => s.defects), 2);
  const wafers = analyses.map(({ w, a }) => {
    const top = a.signatures[0];
    const yieldAlarm = a.stats.yield < yieldLimits.lower;
    const countAlarm = a.stats.defects > countLimits.upper;
    return {
      slot: w.slot,
      chamber: w.chamber,
      ...a.stats,
      signature: top.type,
      confidence: top.confidence,
      yieldAlarm,
      countAlarm,
      flagged: yieldAlarm || top.type !== 'Random',
    };
  });
  const chambers = [...new Set(wafers.map((w) => w.chamber))].sort().map((chamber) => {
    const group = wafers.filter((w) => w.chamber === chamber);
    const sigs = group.filter((w) => w.signature !== 'Random').map((w) => w.signature);
    return {
      chamber,
      wafers: group.length,
      meanYield: round(group.reduce((s, w) => s + w.yield, 0) / group.length),
      flagged: group.filter((w) => w.flagged).length,
      signatures: countBy(sigs),
    };
  });
  const yields = chambers.map((c) => c.meanYield);
  const worst = chambers.find((c) => c.meanYield === Math.min(...yields))!;
  const gap = round(Math.max(...yields) - worst.meanYield);
  return {
    ...lotMeta(spec),
    minSizeNm,
    wafers,
    limits: { yield: yieldLimits, defects: countLimits },
    chambers,
    commonality: gap >= 3 ? { chamber: worst.chamber, gap } : null,
    pareto: countBy(analyses.flatMap(({ a }) => a.captured.map((d) => d.cls))),
    summary: {
      meanYield: round(wafers.reduce((s, w) => s + w.yield, 0) / wafers.length),
      flagged: wafers.filter((w) => w.flagged).length,
      unexplained: wafers.filter((w) => w.yieldAlarm && w.signature === 'Random').length,
      signatures: countBy(wafers.filter((w) => w.signature !== 'Random').map((w) => w.signature)),
    },
  };
}

export function lotList(minSizeNm: number) {
  return lotSpecs.map((spec) => {
    const detail = lotDetail(spec.id, minSizeNm)!;
    return { ...lotMeta(spec), ...detail.summary };
  });
}

export function waferDetail(id: string, slot: number, minSizeNm: number) {
  const spec = findLot(id);
  const wafer = spec && lotWafers(spec).find((w) => w.slot === slot);
  if (!spec || !wafer) return undefined;
  const a = analyzeWafer(wafer, minSizeNm);
  const killersPerDie = new Map<number, number>();
  for (const d of wafer.defects) {
    const die = dieOf(d);
    if (d.killer && die !== undefined) killersPerDie.set(die, (killersPerDie.get(die) ?? 0) + 1);
  }
  return {
    lot: lotMeta(spec),
    slot: wafer.slot,
    chamber: wafer.chamber,
    minSizeNm,
    geometry: { waferRadius: WAFER_RADIUS, dieSize: DIE_SIZE, edgeBand: EDGE_BAND, centerBand: CENTER_BAND },
    dies: dies.map((d, i) => ({ ...d, good: !a.badDies.has(i), killers: killersPerDie.get(i) ?? 0 })),
    defects: wafer.defects.map((d) => ({ ...d, captured: d.sizeNm >= minSizeNm })),
    signatures: a.signatures.map((s) => ({ ...s, ...recommendation(s.type) })),
    stats: a.stats,
    pareto: countBy(a.captured.map((d) => d.cls)),
  };
}
