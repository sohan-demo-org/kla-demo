import type {
  HeroSlide,
  InvestorSnapshot,
  Job,
  Leader,
  Milestone,
  NewsArticle,
  Product,
  Service,
} from './types.js';

// Illustrative sample content for a demo. Not official KLA data.

export const heroSlides: HeroSlide[] = [
  {
    id: 'earnings',
    eyebrow: 'Investors',
    title: 'KLA announces June quarter earnings',
    cta: { label: 'Learn More', to: '/newsroom/june-quarter-earnings' },
    panel: 'performance',
  },
  {
    id: 'gen-ai',
    eyebrow: 'Products & Technology',
    title: 'Process control for the AI era of semiconductors',
    cta: { label: 'Explore Products', to: '/products' },
    panel: 'stat',
    stat: { value: '< 10 nm', label: 'defect sensitivity on advanced logic' },
  },
  {
    id: 'careers',
    eyebrow: 'Careers',
    title: 'Build the technology that builds technology',
    cta: { label: 'View Open Roles', to: '/careers' },
    panel: 'stat',
    stat: { value: '15,000+', label: 'employees in more than 20 countries' },
  },
];

export const products: Product[] = [
  {
    slug: 'surfscan-sp7xp',
    name: 'Surfscan SP7XP',
    category: 'Inspection',
    tagline: 'Unpatterned wafer inspection for bare wafers, films and tool qualification.',
    description:
      'DUV laser-scanning inspection that detects particles, scratches and residues on bare and film-deposited wafers, so IC, wafer and equipment manufacturers can qualify incoming material and process tools before they touch production.',
    applications: ['Incoming wafer qualification', 'Process tool monitoring', 'EUV mask blank substrates'],
    specs: [
      { label: 'Technology', value: 'DUV laser scanning' },
      { label: 'Wafer size', value: '300 mm' },
      { label: 'Use case', value: 'Bare wafer & film inspection' },
    ],
    featured: true,
  },
  {
    slug: '39xx-broadband-plasma',
    name: '39xx Series Broadband Plasma',
    category: 'Inspection',
    tagline: 'Optical patterned wafer inspection for the most advanced nodes.',
    description:
      'Broadband plasma illumination and deep-learning nuisance filtering capture critical defects on logic and memory layers, giving fabs actionable signal on yield-limiting excursions.',
    applications: ['Advanced logic', '3D NAND & DRAM', 'EUV process development'],
    specs: [
      { label: 'Illumination', value: 'Broadband plasma' },
      { label: 'Classification', value: 'AI-based nuisance filtering' },
      { label: 'Mode', value: 'Production & engineering' },
    ],
    featured: true,
  },
  {
    slug: 'esl10-ebeam',
    name: 'eSL10 e-Beam Inspection',
    category: 'Inspection',
    tagline: 'Electron-beam patterned wafer inspection for defects optical tools cannot see.',
    description:
      'High-resolution e-beam imaging finds physical and voltage-contrast defects on EUV layers and buried structures, accelerating yield learning during technology ramps.',
    applications: ['EUV lithography layers', 'Voltage-contrast defects', 'GAA transistor development'],
    specs: [
      { label: 'Technology', value: 'Electron beam' },
      { label: 'Defect types', value: 'Physical & electrical' },
      { label: 'Stage', value: 'R&D and ramp' },
    ],
  },
  {
    slug: 'teron-reticle',
    name: 'Teron Reticle Inspection',
    category: 'Inspection',
    tagline: 'Protect every exposure by keeping reticles defect-free.',
    description:
      'Reticle inspection for mask shops and fabs that detects pattern and contamination defects on optical and EUV masks before they print across thousands of wafers.',
    applications: ['EUV mask qualification', 'Reticle requalification', 'Mask shop inspection'],
    specs: [
      { label: 'Masks', value: 'Optical & EUV' },
      { label: 'Users', value: 'Mask shops & fabs' },
      { label: 'Detection', value: 'Pattern & contamination' },
    ],
  },
  {
    slug: 'archer-overlay',
    name: 'Archer Overlay Metrology',
    category: 'Metrology',
    tagline: 'Hold overlay budgets through multi-patterning and EUV.',
    description:
      'Imaging and scatterometry-based overlay measurement with dense wafer sampling, feeding scanner correctables that keep layers aligned to within fractions of a nanometer.',
    applications: ['Multi-patterning', 'EUV overlay control', 'Scanner feedback loops'],
    specs: [
      { label: 'Methods', value: 'Imaging & SCOL' },
      { label: 'Sampling', value: 'Dense full-wafer maps' },
      { label: 'Output', value: 'Scanner correctables' },
    ],
    featured: true,
  },
  {
    slug: 'spectrashape-ocd',
    name: 'SpectraShape Optical CD',
    category: 'Metrology',
    tagline: 'Measure 3D device shapes without cutting the wafer.',
    description:
      'Optical critical-dimension metrology characterizes the dimensions and profiles of FinFET, GAA and 3D NAND structures in-line, closing process control loops faster.',
    applications: ['GAA & FinFET', '3D NAND channel holes', 'Etch & deposition control'],
    specs: [
      { label: 'Technology', value: 'Spectroscopic ellipsometry' },
      { label: 'Structures', value: '3D, high aspect ratio' },
      { label: 'Feedback', value: 'Run-to-run APC ready' },
    ],
  },
  {
    slug: 'pwg-wafer-geometry',
    name: 'PWG Patterned Wafer Geometry',
    category: 'Metrology',
    tagline: 'Wafer shape and flatness measurement for 3D stacking.',
    description:
      'Measures wafer shape, flatness and thickness variation on patterned wafers, helping control stress-induced distortion in 3D NAND, hybrid bonding and advanced packaging.',
    applications: ['3D NAND stress control', 'Hybrid bonding', 'Lithography focus'],
    specs: [
      { label: 'Measurements', value: 'Shape, flatness, thickness' },
      { label: 'Wafers', value: 'Patterned 300 mm' },
      { label: 'Use case', value: 'Stress & distortion' },
    ],
  },
  {
    slug: 'klarity',
    name: 'Klarity Defect & Yield Analytics',
    category: 'Data Analytics',
    tagline: 'Turn fab-wide data into a ranked list of yield detractors.',
    description:
      'Correlates inspection, metrology, test and equipment data so yield engineers can attribute loss to a chamber, step or layer and act on it within a shift.',
    applications: ['Excursion detection', 'Yield attribution', 'Inline defect management'],
    specs: [
      { label: 'Data sources', value: 'Inspection, metrology, e-test' },
      { label: 'Deployment', value: 'On-prem or private cloud' },
      { label: 'Latency', value: 'Near real time' },
    ],
    featured: true,
  },
  {
    slug: 'kronos-packaging',
    name: 'Kronos Advanced Packaging Inspection',
    category: 'Packaging',
    tagline: 'High-sensitivity inspection for heterogeneous integration.',
    description:
      'Patterned wafer inspection for advanced packaging that finds defects on bumps, redistribution layers and hybrid-bonding surfaces as chiplets drive more value into the package.',
    applications: ['Hybrid bonding', 'Fan-out wafer-level packaging', 'Chiplet integration'],
    specs: [
      { label: 'Focus', value: 'Advanced packaging' },
      { label: 'Defects', value: 'Bumps, RDL, bonding surfaces' },
      { label: 'Substrates', value: 'Wafer & panel' },
    ],
    featured: true,
  },
  {
    slug: 'icos-component-inspection',
    name: 'ICOS Component Inspection',
    category: 'Packaging',
    tagline: 'Final inspection for packaged ICs and singulated die.',
    description:
      'Automated optical inspection of packaged devices and die that screens for cracks, chipping and lead defects before parts ship to automotive and data-center customers.',
    applications: ['Automotive quality', 'Singulated die', 'Final visual inspection'],
    specs: [
      { label: 'Stage', value: 'Back-end / final test' },
      { label: 'Defects', value: 'Cracks, chipping, leads' },
      { label: 'Markets', value: 'Automotive & data center' },
    ],
  },
  {
    slug: 'orbotech-pcb-aoi',
    name: 'Orbotech PCB AOI',
    category: 'PCB & Display',
    tagline: 'Automated optical inspection for printed circuit boards and IC substrates.',
    description:
      'AOI, direct imaging and repair solutions for PCB and IC substrate manufacturers building the high-density interconnects behind AI servers and smartphones.',
    applications: ['IC substrates', 'HDI boards', 'Flexible circuits'],
    specs: [
      { label: 'Solutions', value: 'AOI, direct imaging, repair' },
      { label: 'Markets', value: 'PCB & IC substrate' },
      { label: 'Use case', value: 'High-density interconnect' },
    ],
  },
  {
    slug: 'zeta-optical-profiler',
    name: 'Zeta Optical Profiler',
    category: 'Instruments',
    tagline: 'Benchtop 3D surface profiling for labs and production.',
    description:
      'A KLA Instruments optical profiler that measures step heights, roughness and film thickness for R&D labs, universities and small-volume production lines.',
    applications: ['Step height', 'Surface roughness', 'Film thickness'],
    specs: [
      { label: 'Form factor', value: 'Benchtop' },
      { label: 'Technology', value: 'Multi-mode optical' },
      { label: 'Users', value: 'Labs & universities' },
    ],
  },
];

export const services: Service[] = [
  {
    slug: 'kla-pro',
    name: 'K-T Pro Lifecycle Services',
    summary:
      'Extend the productive life of installed systems with upgrades, refurbishment and remanufactured tools backed by factory warranties.',
    outcomes: ['Productivity upgrades', 'Certified refurbished systems', 'Extended support life'],
  },
  {
    slug: 'predictive-maintenance',
    name: 'Predictive Maintenance',
    summary:
      'Sensor data and remote diagnostics predict failures before they happen, so maintenance happens on your schedule instead of the tool’s.',
    outcomes: ['Higher tool uptime', 'Remote diagnostics', 'Planned part replacement'],
  },
  {
    slug: 'tool-matching',
    name: 'Fleet Matching & Optimization',
    summary:
      'Keep every tool in the fleet reporting the same answer, across fabs and continents, so process decisions travel with confidence.',
    outcomes: ['Tool-to-tool matching', 'Recipe portability', 'Fleet health dashboards'],
  },
  {
    slug: 'applications-engineering',
    name: 'Applications Engineering',
    summary:
      'Embedded process-control experts help tune inspection recipes, sampling plans and analytics for each new layer and node.',
    outcomes: ['Recipe optimization', 'Sampling strategy', 'Ramp acceleration'],
  },
];

export const news: NewsArticle[] = [
  {
    slug: 'june-quarter-earnings',
    title: 'KLA announces June quarter earnings',
    category: 'Earnings',
    publishedAt: '2025-07-31',
    summary:
      'Total revenue of $3.66B, free cash flow of $817M and non-GAAP EPS of $1.05, led by demand for advanced-node process control.',
    body: [
      'KLA reported total revenue of $3.66 billion for the June quarter, with free cash flow of $817 million and non-GAAP diluted EPS of $1.05.',
      'Demand for process control remained strong as customers ramped leading-edge logic, high-bandwidth memory and advanced packaging capacity to support AI workloads.',
      'Services revenue continued to grow with the installed base, and the company returned capital to shareholders through dividends and share repurchases.',
    ],
  },
  {
    slug: 'advanced-packaging-portfolio',
    title: 'KLA expands advanced packaging portfolio for chiplet era',
    category: 'Product',
    publishedAt: '2025-06-18',
    summary:
      'New inspection and metrology capabilities target hybrid bonding and fan-out packaging as more value moves into the package.',
    body: [
      'As AI accelerators adopt chiplet architectures, defect budgets for packaging are shrinking toward those of front-end fabs.',
      'The expanded portfolio adds higher-sensitivity inspection for bonding surfaces and redistribution layers, plus wafer geometry measurements for warpage control.',
    ],
  },
  {
    slug: 'ebeam-inspection-milestone',
    title: 'e-Beam inspection installed base passes new milestone',
    category: 'Product',
    publishedAt: '2025-05-22',
    summary:
      'Leading logic and memory manufacturers adopt e-beam inspection to accelerate yield learning on gate-all-around transistors.',
    body: [
      'Electron-beam inspection captures buried and electrical defects that optical inspection cannot see, a growing need as transistors move to gate-all-around designs.',
      'Customers report faster time-to-root-cause during technology ramps when e-beam data is combined with optical inspection in Klarity analytics.',
    ],
  },
  {
    slug: 'sustainability-report',
    title: 'KLA publishes annual sustainability report',
    category: 'Sustainability',
    publishedAt: '2025-04-30',
    summary:
      'The report details progress toward renewable electricity, emissions reduction and water stewardship goals across global sites.',
    body: [
      'KLA continued to increase the share of renewable electricity across its operations and reduced Scope 1 and 2 emissions intensity.',
      'The company also expanded supplier engagement programs focused on emissions transparency.',
    ],
  },
  {
    slug: 'foundation-stem-grants',
    title: 'KLA Foundation announces STEM education grants',
    category: 'Community',
    publishedAt: '2025-03-14',
    summary:
      'New grants support hands-on STEM programs in communities where KLA employees live and work.',
    body: [
      'The KLA Foundation is funding programs that bring semiconductor and engineering curricula to underserved schools.',
      'Employees can also direct volunteer hours and matching donations to participating organizations.',
    ],
  },
  {
    slug: 'march-quarter-earnings',
    title: 'KLA announces March quarter earnings',
    category: 'Earnings',
    publishedAt: '2025-04-30',
    summary: 'Revenue and margins came in above the midpoint of guidance on broad-based process control demand.',
    body: [
      'KLA delivered revenue above the midpoint of guidance for the March quarter, with strength across foundry/logic and memory.',
      'The company reiterated its long-term financial model and capital return commitments.',
    ],
  },
  {
    slug: 'ann-arbor-campus',
    title: 'KLA opens expanded Ann Arbor R&D and manufacturing campus',
    category: 'Company',
    publishedAt: '2025-02-10',
    summary: 'The Michigan campus adds engineering and manufacturing capacity to support customer growth.',
    body: [
      'The expanded campus brings new laboratories and manufacturing space for next-generation inspection systems.',
      'KLA plans to continue hiring engineers and technicians in the region.',
    ],
  },
];

export const jobs: Job[] = [
  {
    id: 'r-2401',
    title: 'Senior Algorithm Engineer, Defect Inspection',
    team: 'Engineering',
    location: 'Milpitas, CA',
    type: 'Full-time',
    postedAt: '2025-07-28',
    summary: 'Develop image-processing and machine-learning algorithms that separate killer defects from nuisance.',
    responsibilities: [
      'Design detection and classification algorithms for patterned wafer inspection',
      'Partner with optics and systems teams to define next-generation architectures',
      'Validate algorithm performance on customer wafers with applications engineers',
    ],
    qualifications: ['MS/PhD in EE, CS, Physics or related field', 'Strong C++ and Python', 'Experience with computer vision or deep learning'],
  },
  {
    id: 'r-2402',
    title: 'Applications Engineer, Metrology',
    team: 'Customer Success',
    location: 'Hsinchu, Taiwan',
    type: 'Full-time',
    postedAt: '2025-07-21',
    summary: 'Work on-site with leading foundries to optimize overlay and CD metrology recipes.',
    responsibilities: [
      'Own recipe development and tool performance at customer sites',
      'Translate customer process challenges into product requirements',
      'Train customer engineers on metrology best practices',
    ],
    qualifications: ['BS/MS in Materials Science, EE or Physics', 'Semiconductor process knowledge', 'Mandarin and English communication'],
  },
  {
    id: 'r-2403',
    title: 'Software Engineer, Klarity Data Platform',
    team: 'Software',
    location: 'Ann Arbor, MI',
    type: 'Full-time',
    postedAt: '2025-07-15',
    summary: 'Build the data pipelines and services that power fab-wide yield analytics.',
    responsibilities: [
      'Design scalable services for ingesting inspection and metrology data',
      'Build APIs and UIs used by yield engineers around the world',
      'Improve reliability, observability and performance of the platform',
    ],
    qualifications: ['BS in CS or equivalent', 'Experience with distributed systems', 'TypeScript, Java or Go'],
  },
  {
    id: 'r-2404',
    title: 'Optical Design Engineer',
    team: 'Engineering',
    location: 'Milpitas, CA',
    type: 'Full-time',
    postedAt: '2025-07-09',
    summary: 'Design illumination and imaging optics for next-generation inspection platforms.',
    responsibilities: ['Model and tolerance high-NA optical systems', 'Prototype and characterize optical subsystems', 'Work with suppliers on precision components'],
    qualifications: ['MS/PhD in Optics or Physics', 'Zemax/CODE V experience', 'Hands-on lab skills'],
  },
  {
    id: 'r-2405',
    title: 'Field Service Engineer',
    team: 'Customer Success',
    location: 'Dresden, Germany',
    type: 'Full-time',
    postedAt: '2025-07-02',
    summary: 'Install, maintain and upgrade KLA systems at customer fabs across Europe.',
    responsibilities: ['Perform installations and preventive maintenance', 'Troubleshoot complex electro-mechanical systems', 'Drive uptime with predictive maintenance data'],
    qualifications: ['Technical degree or equivalent experience', 'Electro-mechanical troubleshooting', 'German and English'],
  },
  {
    id: 'r-2406',
    title: 'Supply Chain Planner',
    team: 'Operations',
    location: 'Singapore',
    type: 'Full-time',
    postedAt: '2025-06-26',
    summary: 'Plan materials and capacity for high-mix, low-volume manufacturing of inspection systems.',
    responsibilities: ['Own demand and supply plans for key modules', 'Partner with suppliers on lead-time reduction', 'Report inventory health to leadership'],
    qualifications: ['BS in Supply Chain, Engineering or Business', 'ERP/MRP experience', 'Strong analytical skills'],
  },
  {
    id: 'r-2407',
    title: 'Machine Learning Intern',
    team: 'Software',
    location: 'Chennai, India',
    type: 'Internship',
    postedAt: '2025-06-20',
    summary: 'Explore deep-learning approaches to defect classification on real fab data.',
    responsibilities: ['Train and evaluate classification models', 'Build data-labeling tools', 'Present results to the engineering team'],
    qualifications: ['Pursuing BS/MS in CS or related field', 'Python and PyTorch', 'Curiosity about semiconductors'],
  },
  {
    id: 'r-2408',
    title: 'Product Marketing Manager, Advanced Packaging',
    team: 'Marketing',
    location: 'Milpitas, CA',
    type: 'Full-time',
    postedAt: '2025-06-12',
    summary: 'Define positioning and go-to-market for the advanced packaging inspection portfolio.',
    responsibilities: ['Own product messaging and launch plans', 'Analyze market and competitive trends', 'Enable global sales teams'],
    qualifications: ['5+ years in semiconductor marketing', 'Technical degree preferred', 'Excellent communication'],
  },
];

export const investors: InvestorSnapshot = {
  headline: 'KLA announces June quarter earnings',
  metrics: [
    { label: 'Total Revenue', value: '$3.66B' },
    { label: 'Free Cash Flow', value: '$817M' },
    { label: 'Non-GAAP EPS', value: '$1.05' },
  ],
  quarters: [
    { quarter: 'Q3 FY24', revenue: 2.36, grossMargin: 60.6, freeCashFlow: 0.84 },
    { quarter: 'Q4 FY24', revenue: 2.57, grossMargin: 61.0, freeCashFlow: 0.83 },
    { quarter: 'Q1 FY25', revenue: 2.84, grossMargin: 61.4, freeCashFlow: 0.89 },
    { quarter: 'Q2 FY25', revenue: 3.08, grossMargin: 61.7, freeCashFlow: 0.76 },
    { quarter: 'Q3 FY25', revenue: 3.06, grossMargin: 62.1, freeCashFlow: 0.99 },
    { quarter: 'Q4 FY25', revenue: 3.66, grossMargin: 62.6, freeCashFlow: 0.82 },
  ],
  events: [
    { date: '2025-10-29', title: 'September Quarter Earnings Call', kind: 'Earnings Call' },
    { date: '2025-11-18', title: 'Semiconductor Technology Conference', kind: 'Conference' },
    { date: '2025-12-02', title: 'Quarterly Dividend Payable', kind: 'Dividend' },
    { date: '2026-01-28', title: 'December Quarter Earnings Call', kind: 'Earnings Call' },
  ],
  dividend: { quarterly: '$1.90', payableOn: '2025-12-02' },
};

export const leaders: Leader[] = [
  { name: 'Rick Wallace', title: 'President & Chief Executive Officer', bio: 'Leads KLA’s global strategy across semiconductor process control and adjacent markets.' },
  { name: 'Bren Higgins', title: 'Executive Vice President & Chief Financial Officer', bio: 'Oversees finance, investor relations and corporate development.' },
  { name: 'Ahmad Khan', title: 'President, Semiconductor Products & Customers', bio: 'Leads the semiconductor products groups and global customer organization.' },
  { name: 'Jeff Donnelly', title: 'Executive Vice President, Corporate Development', bio: 'Drives strategic investments and partnerships across the portfolio.' },
];

export const milestones: Milestone[] = [
  { year: '1975', text: 'KLA Instruments founded; ships the first automated photomask inspection system.' },
  { year: '1977', text: 'Tencor Instruments founded, pioneering surface metrology.' },
  { year: '1997', text: 'KLA and Tencor merge to form KLA-Tencor.' },
  { year: '2019', text: 'Acquisition of Orbotech expands into PCB, display and specialty semiconductor.' },
  { year: '2019', text: 'Company renamed KLA Corporation.' },
  { year: 'Today', text: 'Process control and process-enabling solutions for every major chipmaker.' },
];
