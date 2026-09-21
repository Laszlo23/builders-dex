/**
 * Applied projects that survive refresh. Seed catalog (INITIAL_PROJECTS) stays
 * canonical for Genesis names; listed rows never overwrite those ids.
 */
import { getSqlite } from './db/sqlite';
import { INITIAL_PROJECTS } from '../data/projects';
import type {
  CurationStatus,
  Project,
  ProjectAIAnalysis,
  ProjectApplication,
} from '../types';
import { scoreFromAiAnalysis } from './builderScore';

const SEED_IDS = new Set(INITIAL_PROJECTS.map((p) => p.id));

const CATEGORIES = ['AI + Web3', 'DeFi', 'Infrastructure', 'Creator Economy'] as const;
const CHAINS = ['Polygon', 'Base', 'Solana', 'Ethereum', 'Robinhood', 'Off-chain'] as const;

type Category = (typeof CATEGORIES)[number];
type Chain = (typeof CHAINS)[number];

export type ApplicationPayload = {
  name: string;
  ticker: string;
  problem: string;
  description: string;
  contactEmail: string;
  whyBuildersDex: string;
  wallet?: string;
  tagline?: string;
  category?: string;
  chain?: string;
  githubRepo?: string;
  goal?: string | number;
  journey?: string;
  builderStory?: string;
  demoUrl?: string;
  pitchDeckUrl?: string;
  videoUrl?: string;
  whitepaperUrl?: string;
  hackathonName?: string;
  tracks?: string[];
  techStack?: string[];
  lookingFor?: string[];
  teamSize?: number;
  fundingStatus?: string;
  previousLaunches?: string;
  socials?: Partial<ProjectApplication['socials']>;
};

type ListedRow = {
  id: string;
  application_id: string;
  ticker: string;
  name: string;
  status: string;
  founder_wallet: string;
  project_json: string;
  created_at: string;
  updated_at: string;
};

function asCategory(value: string | undefined): Category {
  return CATEGORIES.includes(value as Category) ? (value as Category) : 'AI + Web3';
}

function asChain(value: string | undefined): Chain {
  return CHAINS.includes(value as Chain) ? (value as Chain) : 'Solana';
}

function logoFor(category: Category): string {
  switch (category) {
    case 'AI + Web3':
      return 'Brain';
    case 'DeFi':
      return 'Coins';
    case 'Infrastructure':
      return 'Layers';
    case 'Creator Economy':
      return 'Share2';
    default: {
      const _never: never = category;
      return _never;
    }
  }
}

function slugId(ticker: string, applicationId: string): string {
  const tick = ticker.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'proj';
  const tail = applicationId.replace(/[^a-z0-9]/gi, '').slice(-6) || 'new';
  return `app_${tick}_${tail}`;
}

function pendingAnalysis(): ProjectAIAnalysis {
  return {
    quality: 0,
    market: 0,
    risk: 0,
    innovation: 0,
    summary: 'Application received. Builder Score™ stays blank until Proof of Building™ review.',
  };
}

export function projectFromApplication(
  applicationId: string,
  payload: ApplicationPayload,
  status: CurationStatus = 'pending',
): Project {
  const category = asCategory(payload.category);
  const chain = asChain(payload.chain);
  const ai = pendingAnalysis();
  const application: ProjectApplication = {
    contactEmail: payload.contactEmail,
    demoUrl: payload.demoUrl || '',
    pitchDeckUrl: payload.pitchDeckUrl || '',
    videoUrl: payload.videoUrl || '',
    whitepaperUrl: payload.whitepaperUrl || '',
    hackathonName: payload.hackathonName || '',
    tracks: Array.isArray(payload.tracks) ? payload.tracks : [],
    techStack: Array.isArray(payload.techStack) ? payload.techStack : [],
    lookingFor: Array.isArray(payload.lookingFor) ? payload.lookingFor : [],
    teamSize: typeof payload.teamSize === 'number' ? payload.teamSize : 1,
    fundingStatus: payload.fundingStatus || 'Bootstrapped',
    previousLaunches: payload.previousLaunches || '',
    whyBuildersDex: payload.whyBuildersDex,
    socials: payload.socials || {},
  };
  const goal = Number(payload.goal);
  return {
    id: slugId(payload.ticker, applicationId),
    name: payload.name,
    ticker: payload.ticker,
    tagline: payload.tagline || `${category} builder applying for curation.`,
    description: payload.description,
    problem: payload.problem,
    builderStory:
      payload.builderStory ||
      `${payload.name} submitted a full application packet for Builders DEX review.`,
    foundedYear: new Date().getFullYear(),
    journey: payload.journey || 'Prototype → Review',
    whySelected:
      status === 'curated'
        ? 'Inspected and listed on Builders DEX.'
        : 'Pending Proof of Building™ review.',
    logoUrl: logoFor(category),
    category,
    chain,
    rating: 0,
    upvotes: 0,
    githubRepo: payload.githubRepo?.trim() || '',
    githubActivity: 0,
    roadmap: [
      {
        phase: 'Phase 1',
        title: 'Curation review',
        description: 'Full packet under the Builders DEX quality standard.',
        date: new Date().getFullYear().toString(),
        status: status === 'rejected' ? 'upcoming' : 'in-progress',
      },
    ],
    team: [
      {
        name: payload.name,
        role: 'Founder',
        avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(payload.name)}`,
      },
    ],
    raised: 0,
    goal: Number.isFinite(goal) && goal > 0 ? goal : 0,
    tokenPrice: 0,
    tokenPriceHistory: [{ time: 'now', price: 0 }],
    aiAnalysis: ai,
    builderScore: scoreFromAiAnalysis(ai),
    curation: {
      status,
      builderVerified: status === 'curated',
    },
    comments: [],
    quests: [],
    socials: {
      twitter: application.socials.x,
      website: application.socials.website,
      telegram: application.socials.telegram,
      discord: application.socials.discord,
    },
    launchpadActive: status !== 'rejected',
    liquidityLocked: false,
    application,
  };
}

/** Strip founder contact from public catalog cards. */
export function publicProject(project: Project): Project {
  if (!project.application) return project;
  return {
    ...project,
    application: {
      ...project.application,
      contactEmail: '',
    },
  };
}

function parseProject(row: ListedRow): Project | null {
  try {
    const parsed = JSON.parse(row.project_json) as Project;
    if (!parsed?.id || !parsed?.name) return null;
    parsed.curation = {
      ...parsed.curation,
      status: row.status as CurationStatus,
      builderVerified: row.status === 'curated',
    };
    return parsed;
  } catch {
    return null;
  }
}

export function insertListedProject(
  applicationId: string,
  payload: ApplicationPayload,
): Project {
  const db = getSqlite();
  const existing = db
    .prepare(`SELECT * FROM listed_projects WHERE application_id = ?`)
    .get(applicationId) as ListedRow | undefined;
  if (existing) {
    const parsed = parseProject(existing);
    if (parsed) return parsed;
  }
  const project = projectFromApplication(applicationId, payload, 'pending');
  if (SEED_IDS.has(project.id)) {
    project.id = `${project.id}_x`;
  }
  db.prepare(
    `INSERT INTO listed_projects (
      id, application_id, ticker, name, status, founder_wallet, project_json
    ) VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
  ).run(
    project.id,
    applicationId,
    project.ticker,
    project.name,
    payload.wallet || '',
    JSON.stringify(project),
  );
  return project;
}

export function getListedByApplication(applicationId: string): Project | null {
  const db = getSqlite();
  const row = db
    .prepare(`SELECT * FROM listed_projects WHERE application_id = ?`)
    .get(applicationId) as ListedRow | undefined;
  return row ? parseProject(row) : null;
}

export function listListedProjects(): Project[] {
  const db = getSqlite();
  const rows = db
    .prepare(`SELECT * FROM listed_projects ORDER BY created_at DESC`)
    .all() as ListedRow[];
  return rows.map(parseProject).filter((p): p is Project => Boolean(p));
}

export function mergeCatalog(): Project[] {
  const listed = listListedProjects().filter((p) => !SEED_IDS.has(p.id));
  const byId = new Map<string, Project>();
  for (const p of INITIAL_PROJECTS) byId.set(p.id, p);
  for (const p of listed) byId.set(p.id, p);
  return Array.from(byId.values());
}

export function setListedStatus(
  applicationId: string,
  status: CurationStatus,
  payload?: ApplicationPayload,
): Project | null {
  const db = getSqlite();
  let row = db
    .prepare(`SELECT * FROM listed_projects WHERE application_id = ?`)
    .get(applicationId) as ListedRow | undefined;
  if (!row && payload) {
    insertListedProject(applicationId, payload);
    row = db
      .prepare(`SELECT * FROM listed_projects WHERE application_id = ?`)
      .get(applicationId) as ListedRow | undefined;
  }
  if (!row) return null;
  const project = parseProject(row) ?? projectFromApplication(applicationId, payload || {
    name: row.name,
    ticker: row.ticker,
    problem: '',
    description: '',
    contactEmail: '',
    whyBuildersDex: '',
  }, status);
  project.curation = {
    status,
    builderVerified: status === 'curated',
    reviewedAt: new Date().toISOString(),
  };
  if (status === 'curated') {
    project.whySelected = 'Inspected and listed on Builders DEX.';
  }
  if (status === 'rejected') {
    project.launchpadActive = false;
    project.curation.rejectionReasons = ['Did not pass Proof of Building™ review.'];
  }
  db.prepare(
    `UPDATE listed_projects SET
      status = ?,
      project_json = ?,
      updated_at = datetime('now')
     WHERE application_id = ?`,
  ).run(status, JSON.stringify(project), applicationId);
  return project;
}
