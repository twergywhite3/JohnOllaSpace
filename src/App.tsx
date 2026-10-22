import React, { useState, useEffect } from 'react';
import { AssemblyDatabase, Lawmaker, CitizenReport } from './types.ts';
import { api } from './services/api.ts';
import { PerformanceBarChart } from './components/charts/PerformanceBarChart.tsx';
import { QuadrantScatterPlot } from './components/charts/QuadrantScatterPlot.tsx';
import { ZoneComparisonChart } from './components/charts/ZoneComparisonChart.tsx';
import { TopPerformersSpotlight } from './components/charts/TopPerformersSpotlight.tsx';
import { LawmakerGrid } from './components/LawmakerGrid.tsx';
import { LawmakerModal } from './components/LawmakerModal.tsx';
import { LiaisonPortal } from './components/admin/LiaisonPortal.tsx';
import { EmbedModal } from './components/EmbedModal.tsx';
import {
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  BarChart3,
  Users,
  Code,
  Download,
  ExternalLink,
  Heart,
  ChevronRight,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [database, setDatabase] = useState<AssemblyDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLawmaker, setSelectedLawmaker] = useState<Lawmaker | null>(null);
  const [isLiaisonModalOpen, setIsLiaisonModalOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'graphs' | 'directory' | 'sittings' | 'legislation'>('graphs');

  // Load database on start
  useEffect(() => {
    async function load() {
      try {
        const data = await api.getDatabase();
        setDatabase(data);
      } catch (err) {
        console.error('Failed to load tracker database:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !database) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-800">Loading Oyo State Legislative Tracker...</h2>
        <p className="text-xs text-slate-500 mt-1">Fetching assembly records and computed scorecard rankings.</p>
      </div>
    );
  }

  const { settings, lawmakers, sessions, motions, bills, projects, citizenReports } = database;

  // Aggregate stats
  const totalSittings = settings.totalSittingsToDate || sessions.length;
  const avgAttendance =
    lawmakers.length > 0
      ? Math.round(lawmakers.reduce((acc, l) => acc + l.attendanceRate, 0) / lawmakers.length)
      : 0;
  const totalMotions = motions.length;
  const totalBills = bills.length;
  const verifiedProjectsCount = projects.filter((p) => p.liaisonVerified).length;

  // Handlers for liaison actions
  const handleUpdateSettings = async (newSettings: any) => {
    const res = await api.updateSettings(newSettings);
    setDatabase((prev) => (prev ? { ...prev, settings: res.settings, lawmakers: res.lawmakers } : null));
  };

  const handleCreateSession = async (payload: any) => {
    const res = await api.createSession(payload);
    setDatabase((prev) =>
      prev
        ? {
            ...prev,
            sessions: [res.session, ...prev.sessions],
            lawmakers: res.lawmakers,
            settings: { ...prev.settings, totalSittingsToDate: res.totalSittings },
          }
        : null
    );
  };

  const handleCreateMotion = async (payload: any) => {
    const res = await api.createMotion(payload);
    setDatabase((prev) =>
      prev
        ? {
            ...prev,
            motions: [res.motion, ...prev.motions],
            lawmakers: res.lawmakers,
          }
        : null
    );
  };

  const handleCreateBill = async (payload: any) => {
    const res = await api.createBill(payload);
    setDatabase((prev) =>
      prev
        ? {
            ...prev,
            bills: [res.bill, ...prev.bills],
            lawmakers: res.lawmakers,
          }
        : null
    );
  };

  const handleCreateProject = async (payload: any) => {
    const res = await api.createProject(payload);
    setDatabase((prev) =>
      prev
        ? {
            ...prev,
            projects: [res.project, ...prev.projects],
            lawmakers: res.lawmakers,
          }
        : null
    );
  };

  const handleUpdateLawmakerMetrics = async (payload: any) => {
    const res = await api.updateLawmakerMetrics(payload);
    setDatabase((prev) =>
      prev
        ? {
            ...prev,
            lawmakers: res.lawmakers,
          }
        : null
    );
  };

  const handleSubmitCitizenFeedback = async (payload: Partial<CitizenReport>) => {
    const res = await api.submitCitizenReport(payload);
    setDatabase((prev) =>
      prev
        ? {
            ...prev,
            citizenReports: [res.report, ...prev.citizenReports],
          }
        : null
    );
  };

  const handleResetData = async () => {
    const freshDb = await api.resetData();
    setDatabase(freshDb);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Banner / Charity Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand & Organization Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-extrabold text-white text-base shadow-sm shrink-0">
              {settings.charityLogoText.slice(0, 4)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-emerald-400">
                  {settings.charityName}
                </span>
                <span className="hidden sm:inline text-slate-500">·</span>
                <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                  {settings.assemblyName}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight">
                Oyo State Legislative Performance Tracker
              </h1>
            </div>
          </div>

          {/* Action CTAs: Deploy Embed, Liaison Portal, Export CSV */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Embed on Charity Page Button */}
            <button
              type="button"
              onClick={() => setIsEmbedModalOpen(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Get HTML embed code for charity website"
            >
              <Code className="w-3.5 h-3.5 text-emerald-400" />
              <span>Embed on Charity Page</span>
            </button>

            {/* CSV Download */}
            <a
              href="/api/export/csv"
              download="oyha_legislative_scorecard.csv"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Download full CSV report card"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </a>

            {/* Backend Liaison Officer Access Button */}
            <button
              type="button"
              onClick={() => setIsLiaisonModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="House of Assembly Liaison Officer Login & Data Entry"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Liaison Officer Backend</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        {/* Civic Oversight Mission Hero Card */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-emerald-900/40">
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Building2 className="w-4 h-4" />
              <span>Oyo State House of Assembly (OYHA) · Secretariat, Ibadan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Evidence-Based Legislative Accountability & Citizen Oversight
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Tracking plenary attendance roll-calls, motions moved, supported bills, debate interventions, and constituency development projects across all 32 State Constituencies in Oyo State.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                32 State Constituencies
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                33 Local Government Areas
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                5 Geopolitical Zones
              </span>
              <span>·</span>
              <span className="text-slate-400">
                Session: <strong>{settings.assemblySession}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 5-Card Chamber Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Total Plenaries</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalSittings}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Sittings logged to date</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Avg Attendance</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{avgAttendance}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Chamber roll-call benchmark</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Motions Deliberated</span>
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalMotions}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Moved & seconded by members</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Bills Sponsored</span>
              <Layers className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalBills}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">In first, second & final reading</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Audited Projects</span>
              <Building2 className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{verifiedProjectsCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Constituency projects verified</div>
          </div>
        </div>

        {/* Top Performers Spotlight */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Assembly Leaders Spotlight
            </h3>
            <span className="text-xs text-slate-500">Based on verified 10th Assembly logs</span>
          </div>
          <TopPerformersSpotlight lawmakers={lawmakers} onSelectLawmaker={setSelectedLawmaker} />
        </div>

        {/* Main Section Navigation Bar */}
        <div className="border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-2xs flex items-center justify-between flex-wrap gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('graphs')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'graphs'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Performance Graphs & Rankings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'directory'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All 32 Lawmakers Directory</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sittings')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'sittings'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Plenary Sittings ({sessions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('legislation')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'legislation'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Motions & Bills ({motions.length + bills.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 pr-3">
            <span>Formula Weights:</span>
            <span className="font-mono text-slate-700">
              Att: {settings.weights.attendance}% · Mot: {settings.weights.motionsMoved}% · Bills: {settings.weights.bills}%
            </span>
          </div>
        </div>

        {/* TAB 1: PERFORMANCE GRAPHS & RANKINGS */}
        {activeTab === 'graphs' && (
          <div className="space-y-6">
            {/* Main Interactive Bar Chart */}
            <PerformanceBarChart lawmakers={lawmakers} onSelectLawmaker={setSelectedLawmaker} />

            {/* 2-Column Visual Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuadrantScatterPlot lawmakers={lawmakers} onSelectLawmaker={setSelectedLawmaker} />
              <ZoneComparisonChart lawmakers={lawmakers} />
            </div>
          </div>
        )}

        {/* TAB 2: LAWMAKERS SCORECARD DIRECTORY */}
        {activeTab === 'directory' && (
          <LawmakerGrid
            lawmakers={lawmakers}
            onSelectLawmaker={setSelectedLawmaker}
            onOpenFeedback={(lm) => {
              setSelectedLawmaker(lm);
            }}
          />
        )}

        {/* TAB 3: PLENARY SITTINGS & HANSARD ARCHIVE */}
        {activeTab === 'sittings' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Plenary Sittings Record</h3>
                <p className="text-xs text-slate-500">
                  Official register of plenary proceedings, order of business, and chamber attendance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLiaisonModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Log New Sitting</span>
              </button>
            </div>

            <div className="space-y-4">
              {sessions.map((session) => {
                const presentInSitting = Object.values(session.attendance).filter(
                  (v) => v === 'present' || v === 'late'
                ).length;
                const sittingRate = Math.round((presentInSitting / 32) * 100);

                return (
                  <div
                    key={session.id}
                    className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            Sitting #{session.sittingNumber}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500 font-medium">Date: {session.date}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base mt-1">
                          {session.sessionName}
                        </h4>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-xs font-semibold text-slate-700">
                          Attendance: {presentInSitting}/32 ({sittingRate}%)
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Presiding: {session.presidingOfficer}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                      {session.summary}
                    </p>

                    {/* Associated motions / bills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <span>Business Transacted:</span>
                      {session.motionsTreatedIds.length > 0 && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-medium">
                          {session.motionsTreatedIds.length} Motions Deliberated
                        </span>
                      )}
                      {session.billsTreatedIds.length > 0 && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded font-medium">
                          {session.billsTreatedIds.length} Bills Read
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: MOTIONS & BILLS REGISTER */}
        {activeTab === 'legislation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Motions Column */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Motions Moved & Supported</h3>
                  <p className="text-xs text-slate-500">
                    Policy resolutions and urgent public interest matters.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  {motions.length} Motions
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {motions.map((motion) => {
                  const sponsor = lawmakers.find((l) => l.id === motion.primarySponsorId);
                  return (
                    <div
                      key={motion.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{motion.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          {motion.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span>
                          Mover: <strong className="text-slate-800">{sponsor?.name || 'Hon. Lawmaker'}</strong>
                        </span>
                        <span>·</span>
                        <span>Date: {motion.date}</span>
                        <span>·</span>
                        <span className="font-medium text-emerald-800">Category: {motion.category}</span>
                      </div>

                      {motion.notes && (
                        <p className="text-slate-600 bg-white p-2.5 rounded border border-slate-100 text-[11px] leading-relaxed">
                          {motion.notes}
                        </p>
                      )}

                      {motion.supportingLawmakerIds.length > 0 && (
                        <div className="text-[11px] text-slate-500 pt-1">
                          Supported by: <strong className="text-slate-700">{motion.supportingLawmakerIds.length} lawmakers</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bills Column */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Private Member Bills</h3>
                  <p className="text-xs text-slate-500">
                    Statutory bills introduced to the House floor.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                  {bills.length} Bills
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {bills.map((bill) => {
                  const sponsor = lawmakers.find((l) => l.id === bill.sponsorId);
                  return (
                    <div
                      key={bill.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{bill.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                          {bill.stage}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span>
                          Sponsor: <strong className="text-slate-800">{sponsor?.name || 'Hon. Lawmaker'}</strong>
                        </span>
                        <span>·</span>
                        <span>Gazette: {bill.gazetteNumber}</span>
                        <span>·</span>
                        <span>Introduced: {bill.dateIntroduced}</span>
                      </div>

                      <p className="text-slate-600 bg-white p-2.5 rounded border border-slate-100 text-[11px] leading-relaxed">
                        {bill.summary}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">{settings.charityName}</span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-emerald-400 font-medium">Open Legislative Initiative</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {settings.charityTagline}. Independent civic accountability platform tracking representative democracy in Oyo State.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={settings.donationUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>Support Civic Monitoring</span>
              </a>

              <button
                type="button"
                onClick={() => setIsEmbedModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Embed Code</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              Data source: 10th Oyo State House of Assembly (OYHA) Hansard, Plenary Gazette, and Liaison Officer Field Audits.
            </div>
            <div>
              Contact: <a href={`mailto:${settings.contactEmail}`} className="text-slate-400 hover:underline">{settings.contactEmail}</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Lawmaker Detail Modal */}
      {selectedLawmaker && (
        <LawmakerModal
          lawmaker={selectedLawmaker}
          allMotions={motions}
          allBills={bills}
          allProjects={projects}
          allCitizenReports={citizenReports}
          recentSessions={sessions.slice(0, 5)}
          onClose={() => setSelectedLawmaker(null)}
          onSubmitCitizenFeedback={handleSubmitCitizenFeedback}
        />
      )}

      {/* Assembly Liaison Officer Portal Modal */}
      {isLiaisonModalOpen && (
        <LiaisonPortal
          database={database}
          onUpdateSettings={handleUpdateSettings}
          onCreateSession={handleCreateSession}
          onCreateMotion={handleCreateMotion}
          onCreateBill={handleCreateBill}
          onCreateProject={handleCreateProject}
          onUpdateLawmakerMetrics={handleUpdateLawmakerMetrics}
          onResetData={handleResetData}
          onClose={() => setIsLiaisonModalOpen(false)}
        />
      )}

      {/* Embed Modal */}
      {isEmbedModalOpen && (
        <EmbedModal
          onClose={() => setIsEmbedModalOpen(false)}
          charityName={settings.charityName}
        />
      )}
    </div>
  );
}
