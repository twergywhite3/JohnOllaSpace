import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { AssemblyDatabase, Lawmaker, PlenarySession, MotionRecord, BillRecord, ConstituencyProject, CitizenReport, TrackerSettings } from './src/types.ts';
import { initialSettings, initialLawmakers, initialSessions, initialMotions, initialBills, initialProjects, initialCitizenReports, calculateLawmakerScore } from './src/data/defaultData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Persistence file path
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'tracker_store.json');

// Initialize data store
function getInitialData(): AssemblyDatabase {
  const lawmakers = initialLawmakers.map((lm) => ({
    ...lm,
    score: calculateLawmakerScore(lm, initialSettings.weights, initialSettings.totalSittingsToDate),
  }));

  return {
    settings: initialSettings,
    lawmakers,
    sessions: initialSessions,
    motions: initialMotions,
    bills: initialBills,
    projects: initialProjects,
    citizenReports: initialCitizenReports,
  };
}

let db: AssemblyDatabase = getInitialData();

// Load persistent data if exists
function loadDb(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.lawmakers && parsed.settings) {
        db = parsed;
        console.log(`[Store] Loaded existing tracker data with ${db.lawmakers.length} lawmakers and ${db.sessions.length} sessions.`);
        return;
      }
    }
    saveDb();
  } catch (err) {
    console.error('[Store] Error reading data store, using initial defaults:', err);
    db = getInitialData();
  }
}

function saveDb(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Store] Failed to persist data store:', err);
  }
}

// Recalculate scores for all lawmakers
function refreshLawmakerScores(): void {
  const totalSittings = db.settings.totalSittingsToDate || Math.max(db.sessions.length, 1);
  db.lawmakers = db.lawmakers.map((lm) => ({
    ...lm,
    score: calculateLawmakerScore(lm, db.settings.weights, totalSittings),
  }));
}

loadDb();

// ======================== API ROUTES ========================

// Get complete database
app.get('/api/database', (_req: Request, res: Response) => {
  res.json(db);
});

// Update settings (Charity branding, formula weights, custom metrics)
app.post('/api/settings', (req: Request, res: Response) => {
  const newSettings = req.body as Partial<TrackerSettings>;
  if (!newSettings) {
    return res.status(400).json({ error: 'Missing settings payload' });
  }

  db.settings = {
    ...db.settings,
    ...newSettings,
    weights: {
      ...db.settings.weights,
      ...(newSettings.weights || {}),
    },
  };

  // Recalculate scores when weights change
  refreshLawmakerScores();
  saveDb();
  res.json({ success: true, settings: db.settings, lawmakers: db.lawmakers });
});

// Record a new Plenary Session with Attendance Roll-Call
app.post('/api/sessions', (req: Request, res: Response) => {
  const { sessionName, sittingNumber, date, presidingOfficer, summary, attendance, motionsTreatedIds, billsTreatedIds } = req.body;

  if (!sessionName || !date) {
    return res.status(400).json({ error: 'Session name and date are required' });
  }

  const newSittingNumber = Number(sittingNumber) || db.settings.totalSittingsToDate + 1;
  const newSession: PlenarySession = {
    id: `sess-${Date.now()}`,
    sittingNumber: newSittingNumber,
    sessionName,
    date,
    presidingOfficer: presidingOfficer || 'Rt. Hon. Speaker of the House',
    summary: summary || '',
    attendance: attendance || {},
    motionsTreatedIds: motionsTreatedIds || [],
    billsTreatedIds: billsTreatedIds || [],
    createdAt: new Date().toISOString(),
  };

  db.sessions.unshift(newSession);
  db.settings.totalSittingsToDate = Math.max(db.settings.totalSittingsToDate + 1, newSittingNumber);

  // Update attendance stats for each lawmaker
  if (attendance && typeof attendance === 'object') {
    db.lawmakers = db.lawmakers.map((lm) => {
      const status = attendance[lm.id];
      let { sittingsAttended, sittingsExcused, sittingsAbsent } = lm;

      if (status === 'present' || status === 'late') {
        sittingsAttended += 1;
      } else if (status === 'excused') {
        sittingsExcused += 1;
      } else if (status === 'absent') {
        sittingsAbsent += 1;
      }

      const totalSittings = db.settings.totalSittingsToDate;
      const attendanceRate = Math.min(100, Math.round((sittingsAttended / totalSittings) * 100));

      const updatedLawmaker: Lawmaker = {
        ...lm,
        sittingsAttended,
        sittingsExcused,
        sittingsAbsent,
        attendanceRate,
      };

      updatedLawmaker.score = calculateLawmakerScore(updatedLawmaker, db.settings.weights, totalSittings);
      return updatedLawmaker;
    });
  } else {
    refreshLawmakerScores();
  }

  saveDb();
  res.json({ success: true, session: newSession, totalSittings: db.settings.totalSittingsToDate, lawmakers: db.lawmakers });
});

// Record a new Motion moved / supported
app.post('/api/motions', (req: Request, res: Response) => {
  const { title, primarySponsorId, supportingLawmakerIds, category, status, date, notes, resolutionText, sittingNumber } = req.body;

  if (!title || !primarySponsorId) {
    return res.status(400).json({ error: 'Motion title and primary sponsor are required' });
  }

  const newMotion: MotionRecord = {
    id: `mot-${Date.now()}`,
    title,
    primarySponsorId,
    supportingLawmakerIds: Array.isArray(supportingLawmakerIds) ? supportingLawmakerIds : [],
    category: category || 'Governance',
    status: status || 'Adopted',
    date: date || new Date().toISOString().split('T')[0],
    notes: notes || '',
    resolutionText: resolutionText || '',
    sittingNumber: sittingNumber ? Number(sittingNumber) : undefined,
  };

  db.motions.unshift(newMotion);

  // Update primary sponsor motionsMoved count
  db.lawmakers = db.lawmakers.map((lm) => {
    let changed = false;
    let motionsMoved = lm.motionsMoved;
    let motionsSupported = lm.motionsSupported;

    if (lm.id === primarySponsorId) {
      motionsMoved += 1;
      changed = true;
    }

    if (newMotion.supportingLawmakerIds.includes(lm.id)) {
      motionsSupported += 1;
      changed = true;
    }

    if (changed) {
      const updated: Lawmaker = {
        ...lm,
        motionsMoved,
        motionsSupported,
      };
      updated.score = calculateLawmakerScore(updated, db.settings.weights, db.settings.totalSittingsToDate);
      return updated;
    }
    return lm;
  });

  saveDb();
  res.json({ success: true, motion: newMotion, lawmakers: db.lawmakers });
});

// Record a new Bill
app.post('/api/bills', (req: Request, res: Response) => {
  const { title, sponsorId, coSponsorIds, gazetteNumber, stage, summary, dateIntroduced } = req.body;

  if (!title || !sponsorId) {
    return res.status(400).json({ error: 'Bill title and sponsor are required' });
  }

  const newBill: BillRecord = {
    id: `bill-${Date.now()}`,
    title,
    sponsorId,
    coSponsorIds: Array.isArray(coSponsorIds) ? coSponsorIds : [],
    gazetteNumber: gazetteNumber || `OY/HA/${new Date().getFullYear()}/${db.bills.length + 1}`,
    stage: stage || 'First Reading',
    dateIntroduced: dateIntroduced || new Date().toISOString().split('T')[0],
    lastActionDate: new Date().toISOString().split('T')[0],
    summary: summary || '',
  };

  db.bills.unshift(newBill);

  // Update sponsor's bill count
  db.lawmakers = db.lawmakers.map((lm) => {
    if (lm.id === sponsorId) {
      const updated: Lawmaker = {
        ...lm,
        billsSponsored: lm.billsSponsored + 1,
      };
      updated.score = calculateLawmakerScore(updated, db.settings.weights, db.settings.totalSittingsToDate);
      return updated;
    }
    return lm;
  });

  saveDb();
  res.json({ success: true, bill: newBill, lawmakers: db.lawmakers });
});

// Record or update a Constituency Project
app.post('/api/projects', (req: Request, res: Response) => {
  const { lawmakerId, title, lga, community, sector, budgetAmount, status, liaisonVerified, verificationNote } = req.body;

  if (!lawmakerId || !title || !lga) {
    return res.status(400).json({ error: 'Lawmaker, project title, and LGA are required' });
  }

  const newProject: ConstituencyProject = {
    id: `proj-${Date.now()}`,
    lawmakerId,
    title,
    lga,
    community: community || '',
    sector: sector || 'Education',
    budgetAmount: Number(budgetAmount) || 0,
    status: status || 'Ongoing',
    liaisonVerified: Boolean(liaisonVerified),
    verificationDate: new Date().toISOString().split('T')[0],
    verificationNote: verificationNote || '',
  };

  db.projects.unshift(newProject);

  // Update lawmaker project count
  db.lawmakers = db.lawmakers.map((lm) => {
    if (lm.id === lawmakerId) {
      return {
        ...lm,
        constituencyProjectsCount: lm.constituencyProjectsCount + 1,
      };
    }
    return lm;
  });

  saveDb();
  res.json({ success: true, project: newProject, lawmakers: db.lawmakers });
});

// Update Lawmaker Custom Metric / Hansard Debate Interventions
app.post('/api/lawmakers/update-metrics', (req: Request, res: Response) => {
  const { lawmakerId, debateInterventions, customMetricScores } = req.body;

  if (!lawmakerId) {
    return res.status(400).json({ error: 'Lawmaker ID required' });
  }

  db.lawmakers = db.lawmakers.map((lm) => {
    if (lm.id === lawmakerId) {
      const updated: Lawmaker = {
        ...lm,
        debateInterventions: debateInterventions !== undefined ? Number(debateInterventions) : lm.debateInterventions,
        customMetricScores: {
          ...lm.customMetricScores,
          ...(customMetricScores || {}),
        },
      };
      updated.score = calculateLawmakerScore(updated, db.settings.weights, db.settings.totalSittingsToDate);
      return updated;
    }
    return lm;
  });

  saveDb();
  const updatedLm = db.lawmakers.find((l) => l.id === lawmakerId);
  res.json({ success: true, lawmaker: updatedLm, lawmakers: db.lawmakers });
});

// Citizen Feedback / Report
app.post('/api/citizen-reports', (req: Request, res: Response) => {
  const { lawmakerId, constituentName, email, phone, lga, category, message, rating } = req.body;

  if (!lawmakerId || !message || !constituentName) {
    return res.status(400).json({ error: 'Constituent name, lawmaker, and message are required' });
  }

  const newReport: CitizenReport = {
    id: `rep-${Date.now()}`,
    lawmakerId,
    constituentName,
    email: email || '',
    phone: phone || '',
    lga: lga || '',
    category: category || 'Constituency Issue',
    message,
    rating: Number(rating) || 5,
    date: new Date().toISOString().split('T')[0],
    status: 'Verified',
  };

  db.citizenReports.unshift(newReport);
  saveDb();
  res.json({ success: true, report: newReport });
});

// Reset to initial authentic baseline
app.post('/api/reset', (_req: Request, res: Response) => {
  db = getInitialData();
  saveDb();
  res.json({ success: true, database: db });
});

// CSV Export for Civil Society Scorecard
app.get('/api/export/csv', (_req: Request, res: Response) => {
  refreshLawmakerScores();
  const headers = ['Rank,Name,Constituency,LGA,Geopolitical Zone,Party,Role,Attendance Rate (%),Sittings Attended,Motions Moved,Motions Supported,Bills Sponsored,Debate Interventions,Projects Tracked,Composite Score (100)'];

  const sorted = [...db.lawmakers].sort((a, b) => b.score - a.score);
  const rows = sorted.map((lm, index) => {
    const escapedName = `"${lm.name.replace(/"/g, '""')}"`;
    const escapedRole = `"${lm.role.replace(/"/g, '""')}"`;
    return [
      index + 1,
      escapedName,
      `"${lm.constituency}"`,
      `"${lm.lga}"`,
      lm.zone,
      lm.party,
      escapedRole,
      lm.attendanceRate,
      lm.sittingsAttended,
      lm.motionsMoved,
      lm.motionsSupported,
      lm.billsSponsored,
      lm.debateInterventions,
      lm.constituencyProjectsCount,
      lm.score,
    ].join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="oyha_legislative_scorecard.csv"');
  res.send(csvContent);
});

// ======================== SERVER SETUP ========================

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[OYHA Watchdog Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
