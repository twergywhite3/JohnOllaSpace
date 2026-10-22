export type GeopoliticalZone = 'Ibadan' | 'Oyo' | 'Ogbomoso' | 'Oke-Ogun' | 'Ibarapa';

export type PoliticalParty = 'PDP' | 'APC' | 'Accord' | 'LP' | 'NNPP';

export type MotionStatus = 'Adopted' | 'Referred to Committee' | 'Debated' | 'Deferred';

export type BillStage = 'First Reading' | 'Second Reading' | 'Committee Stage' | 'Third Reading' | 'Passed & Assented';

export type ProjectStatus = 'Completed' | 'Ongoing' | 'Tender/Budgeted' | 'Stalled';

export interface CustomMetricDefinition {
  id: string;
  name: string;
  description: string;
  unit: string;
  weight: number; // percentage in formula
  maxValue: number;
}

export interface Lawmaker {
  id: string;
  name: string;
  title: string;
  constituency: string;
  lga: string;
  zone: GeopoliticalZone;
  party: PoliticalParty;
  gender: 'Male' | 'Female';
  role: string; // e.g. "Hon. Speaker", "Deputy Speaker", "Chairman Committee on Education"
  avatarUrl?: string;
  contactEmail?: string;
  phone?: string;
  attendanceRate: number; // calculated percentage
  sittingsAttended: number;
  sittingsExcused: number;
  sittingsAbsent: number;
  motionsMoved: number;
  motionsSupported: number;
  billsSponsored: number;
  debateInterventions: number;
  constituencyProjectsCount: number;
  customMetricScores: Record<string, number>;
  score: number; // 0-100 calculated composite score
  bio: string;
}

export interface AttendanceRecord {
  lawmakerId: string;
  status: 'present' | 'excused' | 'absent' | 'late';
  notes?: string;
}

export interface PlenarySession {
  id: string;
  sittingNumber: number;
  sessionName: string;
  date: string;
  presidingOfficer: string;
  summary: string;
  attendance: Record<string, 'present' | 'excused' | 'absent' | 'late'>;
  motionsTreatedIds: string[];
  billsTreatedIds: string[];
  createdAt: string;
}

export interface MotionRecord {
  id: string;
  title: string;
  primarySponsorId: string;
  supportingLawmakerIds: string[];
  date: string;
  category: 'Security' | 'Education' | 'Healthcare' | 'Infrastructure' | 'Agriculture' | 'Youth & Sports' | 'Environment' | 'Governance';
  status: MotionStatus;
  sittingNumber?: number;
  notes: string;
  resolutionText?: string;
}

export interface BillRecord {
  id: string;
  title: string;
  sponsorId: string;
  coSponsorIds: string[];
  gazetteNumber: string;
  stage: BillStage;
  dateIntroduced: string;
  lastActionDate: string;
  summary: string;
}

export interface ConstituencyProject {
  id: string;
  lawmakerId: string;
  title: string;
  lga: string;
  community: string;
  sector: 'Education' | 'Health' | 'Water/Sanitation' | 'Electrification' | 'Roads' | 'Youth Empowerment';
  budgetAmount: number; // in Naira
  status: ProjectStatus;
  liaisonVerified: boolean;
  verificationDate?: string;
  verificationNote?: string;
}

export interface CitizenReport {
  id: string;
  lawmakerId: string;
  constituentName: string;
  email: string;
  phone?: string;
  lga: string;
  category: 'Commendation' | 'Constituency Issue' | 'Question on Motion' | 'Project Verification';
  message: string;
  rating: number; // 1-5
  date: string;
  status: 'Verified' | 'Pending Review';
}

export interface FormulaWeights {
  attendance: number; // default 30
  motionsMoved: number; // default 25
  motionsSupported: number; // default 15
  bills: number; // default 20
  debateContributions: number; // default 10
  customMetrics?: Record<string, number>;
}

export interface TrackerSettings {
  charityName: string;
  charityTagline: string;
  charityLogoText: string;
  contactEmail: string;
  donationUrl: string;
  assemblyName: string;
  assemblySession: string;
  totalSittingsToDate: number;
  weights: FormulaWeights;
  customMetrics: CustomMetricDefinition[];
  themeColor: 'emerald' | 'indigo' | 'slate' | 'amber';
}

export interface AssemblyDatabase {
  settings: TrackerSettings;
  lawmakers: Lawmaker[];
  sessions: PlenarySession[];
  motions: MotionRecord[];
  bills: BillRecord[];
  projects: ConstituencyProject[];
  citizenReports: CitizenReport[];
}
