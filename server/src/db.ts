import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { Application, ContactRequest, Excursion, ExcursionStatus, InquiryStatus, Subscription } from './types.js';

export type NewContactRequest = Omit<ContactRequest, 'id' | 'status' | 'createdAt'>;
export type NewApplication = Omit<Application, 'id' | 'createdAt'>;
export type NewExcursion = Omit<Excursion, 'id' | 'status' | 'createdAt'>;

export interface Store {
  addContactRequest(input: NewContactRequest): ContactRequest;
  listContactRequests(): ContactRequest[];
  updateContactStatus(id: number, status: InquiryStatus): ContactRequest | undefined;
  addApplication(input: NewApplication): Application;
  listApplications(): Application[];
  addSubscription(email: string): { subscription: Subscription; created: boolean };
  listSubscriptions(): Subscription[];
  addExcursion(input: NewExcursion): Excursion;
  listExcursions(lotId?: string): Excursion[];
  updateExcursionStatus(id: number, status: ExcursionStatus): Excursion | undefined;
  close(): void;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS contact_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    topic TEXT NOT NULL,
    product TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL,
    job_title TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    linkedin TEXT,
    cover_letter TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS excursions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lot_id TEXT NOT NULL,
    slots TEXT NOT NULL,
    signature TEXT NOT NULL,
    owner TEXT NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'Open',
    created_at TEXT NOT NULL
  );
`;

type Row = Record<string, string | number | null>;

const toContact = (r: Row): ContactRequest => ({
  id: Number(r.id),
  name: String(r.name),
  email: String(r.email),
  company: String(r.company),
  topic: String(r.topic),
  product: r.product === null ? null : String(r.product),
  message: String(r.message),
  status: String(r.status) as InquiryStatus,
  createdAt: String(r.created_at),
});

const toApplication = (r: Row): Application => ({
  id: Number(r.id),
  jobId: String(r.job_id),
  jobTitle: String(r.job_title),
  name: String(r.name),
  email: String(r.email),
  linkedin: r.linkedin === null ? null : String(r.linkedin),
  coverLetter: String(r.cover_letter),
  createdAt: String(r.created_at),
});

const toSubscription = (r: Row): Subscription => ({
  id: Number(r.id),
  email: String(r.email),
  createdAt: String(r.created_at),
});

const toExcursion = (r: Row): Excursion => ({
  id: Number(r.id),
  lotId: String(r.lot_id),
  slots: JSON.parse(String(r.slots)) as number[],
  signature: String(r.signature),
  owner: String(r.owner),
  note: r.note === null ? null : String(r.note),
  status: String(r.status) as ExcursionStatus,
  createdAt: String(r.created_at),
});

export function openStore(file: string): Store {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(SCHEMA);

  const now = () => new Date().toISOString();
  const get = (sql: string, ...params: (string | number | null)[]) =>
    db.prepare(sql).get(...params) as Row | undefined;
  const all = (sql: string, ...params: (string | number | null)[]) => db.prepare(sql).all(...params) as Row[];

  return {
    addContactRequest(input) {
      const { lastInsertRowid } = db
        .prepare(
          'INSERT INTO contact_requests (name, email, company, topic, product, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .run(input.name, input.email, input.company, input.topic, input.product, input.message, now());
      return toContact(get('SELECT * FROM contact_requests WHERE id = ?', Number(lastInsertRowid))!);
    },
    listContactRequests() {
      return all('SELECT * FROM contact_requests ORDER BY id DESC').map(toContact);
    },
    updateContactStatus(id, status) {
      db.prepare('UPDATE contact_requests SET status = ? WHERE id = ?').run(status, id);
      const row = get('SELECT * FROM contact_requests WHERE id = ?', id);
      return row ? toContact(row) : undefined;
    },
    addApplication(input) {
      const { lastInsertRowid } = db
        .prepare(
          'INSERT INTO applications (job_id, job_title, name, email, linkedin, cover_letter, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .run(input.jobId, input.jobTitle, input.name, input.email, input.linkedin, input.coverLetter, now());
      return toApplication(get('SELECT * FROM applications WHERE id = ?', Number(lastInsertRowid))!);
    },
    listApplications() {
      return all('SELECT * FROM applications ORDER BY id DESC').map(toApplication);
    },
    addSubscription(email) {
      const normalized = email.trim().toLowerCase();
      const existing = get('SELECT * FROM subscriptions WHERE email = ?', normalized);
      if (existing) return { subscription: toSubscription(existing), created: false };
      const { lastInsertRowid } = db
        .prepare('INSERT INTO subscriptions (email, created_at) VALUES (?, ?)')
        .run(normalized, now());
      return {
        subscription: toSubscription(get('SELECT * FROM subscriptions WHERE id = ?', Number(lastInsertRowid))!),
        created: true,
      };
    },
    listSubscriptions() {
      return all('SELECT * FROM subscriptions ORDER BY id DESC').map(toSubscription);
    },
    addExcursion(input) {
      const { lastInsertRowid } = db
        .prepare('INSERT INTO excursions (lot_id, slots, signature, owner, note, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(input.lotId, JSON.stringify(input.slots), input.signature, input.owner, input.note, now());
      return toExcursion(get('SELECT * FROM excursions WHERE id = ?', Number(lastInsertRowid))!);
    },
    listExcursions(lotId) {
      const rows = lotId
        ? all('SELECT * FROM excursions WHERE lot_id = ? ORDER BY id DESC', lotId)
        : all('SELECT * FROM excursions ORDER BY id DESC');
      return rows.map(toExcursion);
    },
    updateExcursionStatus(id, status) {
      db.prepare('UPDATE excursions SET status = ? WHERE id = ?').run(status, id);
      const row = get('SELECT * FROM excursions WHERE id = ?', id);
      return row ? toExcursion(row) : undefined;
    },
    close() {
      db.close();
    },
  };
}
