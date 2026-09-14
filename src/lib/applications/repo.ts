/**
 * Applications Repository
 * 
 * Simple JSONL storage for project applications
 * (Eventually can migrate to SQLite like reputation)
 */

import fs from 'fs';
import path from 'path';

const APPLICATIONS_FILE = process.env.APPLICATIONS_FILE_PATH || 
  path.join(process.cwd(), 'data', 'applications.jsonl');

export interface Application {
  id: string;
  wallet: string;
  projectName: string;
  projectDescription: string;
  githubRepo?: string;
  website?: string;
  submittedAt: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

/**
 * Ensure applications file exists
 */
function ensureApplicationsFile(): void {
  const dir = path.dirname(APPLICATIONS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(APPLICATIONS_FILE)) {
    fs.writeFileSync(APPLICATIONS_FILE, '', 'utf8');
  }
}

/**
 * Load all applications from JSONL
 */
function loadApplications(): Application[] {
  ensureApplicationsFile();
  const content = fs.readFileSync(APPLICATIONS_FILE, 'utf8').trim();
  if (!content) return [];
  
  return content
    .split('\n')
    .filter(Boolean)
    .map(line => {
      try {
        return JSON.parse(line) as Application;
      } catch {
        return null;
      }
    })
    .filter((app): app is Application => app !== null);
}

/**
 * Append an application to JSONL
 */
function appendApplication(app: Application): void {
  ensureApplicationsFile();
  fs.appendFileSync(APPLICATIONS_FILE, JSON.stringify(app) + '\n', 'utf8');
}

/**
 * Rewrite all applications (for updates)
 */
function saveApplications(apps: Application[]): void {
  ensureApplicationsFile();
  const content = apps.map(app => JSON.stringify(app)).join('\n') + '\n';
  fs.writeFileSync(APPLICATIONS_FILE, content, 'utf8');
}

/**
 * Submit a new application
 */
export function submitApplication(data: {
  wallet: string;
  projectName: string;
  projectDescription: string;
  githubRepo?: string;
  website?: string;
}): Application {
  const app: Application = {
    id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    wallet: data.wallet,
    projectName: data.projectName.trim().slice(0, 120),
    projectDescription: data.projectDescription.trim().slice(0, 4000),
    githubRepo: data.githubRepo?.trim().slice(0, 200),
    website: data.website?.trim().slice(0, 200),
    submittedAt: new Date().toISOString(),
    reviewStatus: 'pending',
  };

  appendApplication(app);
  return app;
}

/**
 * Get an application by ID
 */
export function getApplicationById(id: string): Application | null {
  const apps = loadApplications();
  return apps.find(app => app.id === id) || null;
}

/**
 * List all applications (optionally filter by status)
 */
export function listApplications(
  status?: 'pending' | 'approved' | 'rejected',
  limit = 50
): Application[] {
  const apps = loadApplications();
  const filtered = status 
    ? apps.filter(app => app.reviewStatus === status)
    : apps;
  
  return filtered
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, limit);
}

/**
 * Review an application
 */
export function reviewApplication(
  id: string,
  status: 'approved' | 'rejected',
  reviewedBy: string,
  reviewNotes?: string
): Application | null {
  const apps = loadApplications();
  const app = apps.find(a => a.id === id);
  
  if (!app) return null;

  app.reviewStatus = status;
  app.reviewedAt = new Date().toISOString();
  app.reviewedBy = reviewedBy;
  app.reviewNotes = reviewNotes;

  saveApplications(apps);
  return app;
}

/**
 * Get applications for a wallet
 */
export function getApplicationsByWallet(wallet: string): Application[] {
  const apps = loadApplications();
  return apps
    .filter(app => app.wallet === wallet)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}
