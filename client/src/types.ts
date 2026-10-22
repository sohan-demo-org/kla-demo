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
  counts: { inquiries: number; openInquiries: number; applications: number; subscriptions: number };
  inquiries: ContactRequest[];
  applications: Application[];
  subscriptions: Subscription[];
}
