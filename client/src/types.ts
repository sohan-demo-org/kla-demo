export type ProductCategory = 'Inspection' | 'Metrology' | 'Data Analytics' | 'Packaging' | 'PCB & Display' | 'Instruments';

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  slug: string;
  name: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  applications: string[];
  specs: Spec[];
  featured?: boolean;
}

export interface Service {
  slug: string;
  name: string;
  summary: string;
  outcomes: string[];
}

export interface NewsArticle {
  slug: string;
  title: string;
  category: 'Earnings' | 'Product' | 'Company' | 'Sustainability' | 'Community';
  publishedAt: string;
  summary: string;
  body: string[];
}

export interface Job {
  id: string;
  title: string;
  team: string;
  location: string;
  type: 'Full-time' | 'Internship' | 'Contract';
  postedAt: string;
  summary: string;
  responsibilities: string[];
  qualifications: string[];
}

export interface Metric {
  label: string;
  value: string;
}

export interface Quarter {
  quarter: string;
  revenue: number;
  grossMargin: number;
  freeCashFlow: number;
}

export interface InvestorEvent {
  date: string;
  title: string;
  kind: 'Earnings Call' | 'Conference' | 'Dividend';
}

export interface InvestorSnapshot {
  headline: string;
  metrics: Metric[];
  quarters: Quarter[];
  events: InvestorEvent[];
  dividend: { quarterly: string; payableOn: string };
}

export interface Leader {
  name: string;
  title: string;
  bio: string;
}

export interface Milestone {
  year: string;
  text: string;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  cta: { label: string; to: string };
  panel: 'performance' | 'stat' | 'none';
  stat?: { value: string; label: string };
}

export type InquiryStatus = 'New' | 'In Progress' | 'Closed';

export interface ContactRequest {
  id: number;
  name: string;
  email: string;
  company: string;
  topic: string;
  product: string | null;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface Application {
  id: number;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  linkedin: string | null;
  coverLetter: string;
  createdAt: string;
}

export interface Subscription {
  id: number;
  email: string;
  createdAt: string;
}

export interface SearchResult {
  type: 'Product' | 'News' | 'Career' | 'Service';
  title: string;
  summary: string;
  to: string;
}

export interface HomePayload {
  slides: HeroSlide[];
  metrics: Metric[];
  featuredProducts: Product[];
  latestNews: NewsArticle[];
}

export interface ProductDetail extends Product {
  related: Product[];
}

export interface CareersPayload {
  jobs: Job[];
  facets: { locations: string[]; teams: string[] };
}

export interface CompanyPayload {
  leaders: Leader[];
  milestones: Milestone[];
}

export interface AdminSummary {
  counts: { inquiries: number; openInquiries: number; applications: number; subscriptions: number; openExcursions: number };
  inquiries: ContactRequest[];
  applications: Application[];
  subscriptions: Subscription[];
  excursions: Excursion[];
}

export type SignatureType = 'Scratch' | 'Reticle Repeater' | 'Edge Ring' | 'Center Cluster' | 'Random';
export type DefectClass = 'Particle' | 'Residue' | 'Pit' | 'Pattern' | 'Scratch';
export type ExcursionStatus = 'Open' | 'Contained' | 'Closed';

export interface Excursion {
  id: number;
  lotId: string;
  slots: number[];
  signature: SignatureType;
  owner: string;
  note: string | null;
  status: ExcursionStatus;
  createdAt: string;
}

export interface InspectionTool {
  id: string;
  name: string;
  slug: string | null;
  minSizeNm: number;
  description: string;
}

export interface LotMeta {
  id: string;
  product: string;
  layer: string;
  processTool: string;
  story: string;
}

export interface LotRollup {
  meanYield: number;
  flagged: number;
  unexplained: number;
  signatures: Partial<Record<SignatureType, number>>;
}

export type LotSummary = LotMeta & LotRollup;

export interface WaferStats {
  defects: number;
  totalDefects: number;
  killers: number;
  capturedKillers: number;
  missedKillers: number;
  killerCaptureRate: number;
  yield: number;
  poissonYield: number;
  d0: number;
  goodDies: number;
  totalDies: number;
}

export interface WaferSummary extends WaferStats {
  slot: number;
  chamber: string;
  signature: SignatureType;
  confidence: number;
  yieldAlarm: boolean;
  countAlarm: boolean;
  flagged: boolean;
}

export interface ControlLimits {
  center: number;
  sigma: number;
  lower: number;
  upper: number;
}

export interface LotDetail extends LotMeta {
  minSizeNm: number;
  wafers: WaferSummary[];
  limits: { yield: ControlLimits; defects: ControlLimits };
  chambers: { chamber: string; wafers: number; meanYield: number; flagged: number; signatures: Partial<Record<SignatureType, number>> }[];
  commonality: { chamber: string; gap: number } | null;
  pareto: Partial<Record<DefectClass, number>>;
  summary: LotRollup;
  excursions: Excursion[];
}

export interface WaferDefect {
  id: number;
  x: number;
  y: number;
  sizeNm: number;
  cls: DefectClass;
  killer: boolean;
  captured: boolean;
}

export interface WaferSignature {
  type: SignatureType;
  confidence: number;
  memberIds: number[];
  evidence: string;
  rootCause: string;
  action: string;
  product: { slug: string; name: string } | null;
}

export interface WaferDetail {
  lot: LotMeta;
  slot: number;
  chamber: string;
  minSizeNm: number;
  geometry: { waferRadius: number; dieSize: number; edgeBand: number; centerBand: number };
  dies: { col: number; row: number; x: number; y: number; good: boolean; killers: number }[];
  defects: WaferDefect[];
  signatures: WaferSignature[];
  stats: WaferStats;
  pareto: Partial<Record<DefectClass, number>>;
}
