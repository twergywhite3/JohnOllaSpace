import { AssemblyDatabase, Lawmaker, PlenarySession, MotionRecord, BillRecord, ConstituencyProject, CitizenReport, TrackerSettings } from '../types.ts';
import { initialSettings, initialLawmakers, initialSessions, initialMotions, initialBills, initialProjects, initialCitizenReports, calculateLawmakerScore } from '../data/defaultData.ts';

const LOCAL_STORAGE_KEY = 'oyha_tracker_offline_db_v1';

function getLocalFallbackDb(): AssemblyDatabase {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Could not read from local storage:', e);
  }

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

function persistLocalFallback(db: AssemblyDatabase) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn('Failed to cache db locally:', e);
  }
}

export const api = {
  async getDatabase(): Promise<AssemblyDatabase> {
    try {
      const res = await fetch('/api/database');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      persistLocalFallback(data);
      return data;
    } catch (err) {
      console.warn('[API] Server unreachable, using local persistent fallback:', err);
      return getLocalFallbackDb();
    }
  },

  async updateSettings(settings: Partial<TrackerSettings>): Promise<{ settings: TrackerSettings; lawmakers: Lawmaker[] }> {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('[API] Local fallback updateSettings:', err);
      const db = getLocalFallbackDb();
      db.settings = { ...db.settings, ...settings };
      // recalculate scores
      db.lawmakers = db.lawmakers.map((lm) => ({
        ...lm,
        score: calculateLawmakerScore(lm, db.settings.weights, db.settings.totalSittingsToDate),
      }));
      persistLocalFallback(db);
      return { settings: db.settings, lawmakers: db.lawmakers };
    }
  },

  async createSession(payload: {
    sessionName: string;
    sittingNumber: number;
    date: string;
    presidingOfficer: string;
    summary: string;
    attendance: Record<string, 'present' | 'excused' | 'absent' | 'late'>;
    motionsTreatedIds?: string[];
    billsTreatedIds?: string[];
  }): Promise<{ session: PlenarySession; lawmakers: Lawmaker[]; totalSittings: number }> {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Local fallback createSession:', err);
      const db = getLocalFallbackDb();
      const newSittingNumber = payload.sittingNumber || db.settings.totalSittingsToDate + 1;
      const newSession: PlenarySession = {
        id: `sess-${Date.now()}`,
        sittingNumber: newSittingNumber,
        sessionName: payload.sessionName,
        date: payload.date,
        presidingOfficer: payload.presidingOfficer,
        summary: payload.summary,
        attendance: payload.attendance,
        motionsTreatedIds: payload.motionsTreatedIds || [],
        billsTreatedIds: payload.billsTreatedIds || [],
        createdAt: new Date().toISOString(),
      };
      db.sessions.unshift(newSession);
      db.settings.totalSittingsToDate = Math.max(db.settings.totalSittingsToDate + 1, newSittingNumber);

      db.lawmakers = db.lawmakers.map((lm) => {
        const st = payload.attendance[lm.id];
        let { sittingsAttended, sittingsExcused, sittingsAbsent } = lm;
        if (st === 'present' || st === 'late') sittingsAttended += 1;
        else if (st === 'excused') sittingsExcused += 1;
        else if (st === 'absent') sittingsAbsent += 1;
        const rate = Math.min(100, Math.round((sittingsAttended / db.settings.totalSittingsToDate) * 100));
        const updated = { ...lm, sittingsAttended, sittingsExcused, sittingsAbsent, attendanceRate: rate };
        updated.score = calculateLawmakerScore(updated, db.settings.weights, db.settings.totalSittingsToDate);
        return updated;
      });

      persistLocalFallback(db);
      return { session: newSession, lawmakers: db.lawmakers, totalSittings: db.settings.totalSittingsToDate };
    }
  },

  async createMotion(payload: {
    title: string;
    primarySponsorId: string;
    supportingLawmakerIds: string[];
    category: string;
    status: string;
    date: string;
    notes: string;
    resolutionText?: string;
  }): Promise<{ motion: MotionRecord; lawmakers: Lawmaker[] }> {
    try {
      const res = await fetch('/api/motions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Local fallback createMotion:', err);
      const db = getLocalFallbackDb();
      const newMotion: MotionRecord = {
        id: `mot-${Date.now()}`,
        title: payload.title,
        primarySponsorId: payload.primarySponsorId,
        supportingLawmakerIds: payload.supportingLawmakerIds,
        category: payload.category as any,
        status: payload.status as any,
        date: payload.date,
        notes: payload.notes,
        resolutionText: payload.resolutionText,
      };
      db.motions.unshift(newMotion);

      db.lawmakers = db.lawmakers.map((lm) => {
        let motionsMoved = lm.motionsMoved;
        let motionsSupported = lm.motionsSupported;
        let changed = false;
        if (lm.id === payload.primarySponsorId) {
          motionsMoved += 1;
          changed = true;
        }
        if (payload.supportingLawmakerIds.includes(lm.id)) {
          motionsSupported += 1;
          changed = true;
        }
        if (changed) {
          const up = { ...lm, motionsMoved, motionsSupported };
          up.score = calculateLawmakerScore(up, db.settings.weights, db.settings.totalSittingsToDate);
          return up;
        }
        return lm;
      });

      persistLocalFallback(db);
      return { motion: newMotion, lawmakers: db.lawmakers };
    }
  },

  async createBill(payload: {
    title: string;
    sponsorId: string;
    coSponsorIds: string[];
    gazetteNumber: string;
    stage: string;
    summary: string;
    dateIntroduced: string;
  }): Promise<{ bill: BillRecord; lawmakers: Lawmaker[] }> {
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Local fallback createBill:', err);
      const db = getLocalFallbackDb();
      const newBill: BillRecord = {
        id: `bill-${Date.now()}`,
        title: payload.title,
        sponsorId: payload.sponsorId,
        coSponsorIds: payload.coSponsorIds,
        gazetteNumber: payload.gazetteNumber,
        stage: payload.stage as any,
        dateIntroduced: payload.dateIntroduced,
        lastActionDate: payload.dateIntroduced,
        summary: payload.summary,
      };
      db.bills.unshift(newBill);
      db.lawmakers = db.lawmakers.map((lm) => {
        if (lm.id === payload.sponsorId) {
          const up = { ...lm, billsSponsored: lm.billsSponsored + 1 };
          up.score = calculateLawmakerScore(up, db.settings.weights, db.settings.totalSittingsToDate);
          return up;
        }
        return lm;
      });
      persistLocalFallback(db);
      return { bill: newBill, lawmakers: db.lawmakers };
    }
  },

  async createProject(payload: Partial<ConstituencyProject>): Promise<{ project: ConstituencyProject; lawmakers: Lawmaker[] }> {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      const db = getLocalFallbackDb();
      const newProj: ConstituencyProject = {
        id: `proj-${Date.now()}`,
        lawmakerId: payload.lawmakerId || '',
        title: payload.title || '',
        lga: payload.lga || '',
        community: payload.community || '',
        sector: payload.sector || 'Education',
        budgetAmount: payload.budgetAmount || 0,
        status: payload.status || 'Ongoing',
        liaisonVerified: Boolean(payload.liaisonVerified),
        verificationDate: new Date().toISOString().split('T')[0],
        verificationNote: payload.verificationNote,
      };
      db.projects.unshift(newProj);
      db.lawmakers = db.lawmakers.map((lm) => (lm.id === payload.lawmakerId ? { ...lm, constituencyProjectsCount: lm.constituencyProjectsCount + 1 } : lm));
      persistLocalFallback(db);
      return { project: newProj, lawmakers: db.lawmakers };
    }
  },

  async updateLawmakerMetrics(payload: {
    lawmakerId: string;
    debateInterventions?: number;
    customMetricScores?: Record<string, number>;
  }): Promise<{ lawmaker: Lawmaker; lawmakers: Lawmaker[] }> {
    try {
      const res = await fetch('/api/lawmakers/update-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      const db = getLocalFallbackDb();
      db.lawmakers = db.lawmakers.map((lm) => {
        if (lm.id === payload.lawmakerId) {
          const up = {
            ...lm,
            debateInterventions: payload.debateInterventions ?? lm.debateInterventions,
            customMetricScores: { ...lm.customMetricScores, ...(payload.customMetricScores || {}) },
          };
          up.score = calculateLawmakerScore(up, db.settings.weights, db.settings.totalSittingsToDate);
          return up;
        }
        return lm;
      });
      persistLocalFallback(db);
      const lm = db.lawmakers.find((l) => l.id === payload.lawmakerId)!;
      return { lawmaker: lm, lawmakers: db.lawmakers };
    }
  },

  async submitCitizenReport(payload: Partial<CitizenReport>): Promise<{ report: CitizenReport }> {
    try {
      const res = await fetch('/api/citizen-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      const db = getLocalFallbackDb();
      const report: CitizenReport = {
        id: `rep-${Date.now()}`,
        lawmakerId: payload.lawmakerId || '',
        constituentName: payload.constituentName || 'Anonymous Constituent',
        email: payload.email || '',
        lga: payload.lga || '',
        category: (payload.category as any) || 'Constituency Issue',
        message: payload.message || '',
        rating: payload.rating || 5,
        date: new Date().toISOString().split('T')[0],
        status: 'Verified',
      };
      db.citizenReports.unshift(report);
      persistLocalFallback(db);
      return { report };
    }
  },

  async resetData(): Promise<AssemblyDatabase> {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      persistLocalFallback(data.database);
      return data.database;
    } catch (err) {
      const db = {
        settings: initialSettings,
        lawmakers: initialLawmakers.map((lm) => ({
          ...lm,
          score: calculateLawmakerScore(lm, initialSettings.weights, initialSettings.totalSittingsToDate),
        })),
        sessions: initialSessions,
        motions: initialMotions,
        bills: initialBills,
        projects: initialProjects,
        citizenReports: initialCitizenReports,
      };
      persistLocalFallback(db);
      return db;
    }
  },
};
