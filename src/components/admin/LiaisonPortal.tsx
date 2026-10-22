import React, { useState } from 'react';
import {
  AssemblyDatabase,
  Lawmaker,
  PlenarySession,
  MotionRecord,
  BillRecord,
  ConstituencyProject,
  TrackerSettings,
  CustomMetricDefinition,
} from '../../types.ts';
import {
  ShieldCheck,
  Calendar,
  FileText,
  Sliders,
  Building,
  CheckCircle2,
  Plus,
  Save,
  Download,
  RotateCcw,
  Code,
  UserCheck,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

interface LiaisonPortalProps {
  database: AssemblyDatabase;
  onUpdateSettings: (settings: Partial<TrackerSettings>) => Promise<any>;
  onCreateSession: (payload: any) => Promise<any>;
  onCreateMotion: (payload: any) => Promise<any>;
  onCreateBill: (payload: any) => Promise<any>;
  onCreateProject: (payload: any) => Promise<any>;
  onUpdateLawmakerMetrics: (payload: any) => Promise<any>;
  onResetData: () => Promise<any>;
  onClose: () => void;
}

export const LiaisonPortal: React.FC<LiaisonPortalProps> = ({
  database,
  onUpdateSettings,
  onCreateSession,
  onCreateMotion,
  onCreateBill,
  onCreateProject,
  onUpdateLawmakerMetrics,
  onResetData,
  onClose,
}) => {
  // Simple Authentication Guard for Assembly Liaison Officer
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [officerId, setOfficerId] = useState('OYHA-LIAISON-2024');
  const [officerPin, setOfficerPin] = useState('1976');
  const [authError, setAuthError] = useState('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'sessions' | 'motions' | 'bills' | 'projects' | 'customise' | 'embed'>('sessions');

  // Notification feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Plenary Session Form State
  const [sessionName, setSessionName] = useState(
    `Plenary Sitting ${database.settings.totalSittingsToDate + 1}: 10th Assembly, 2nd Session`
  );
  const [sittingNumber, setSittingNumber] = useState(database.settings.totalSittingsToDate + 1);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [presidingOfficer, setPresidingOfficer] = useState('Rt. Hon. Adebo Edward Ogundoyin (Speaker)');
  const [sessionSummary, setSessionSummary] = useState('');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'excused' | 'absent' | 'late'>>(() => {
    const map: Record<string, 'present' | 'excused' | 'absent' | 'late'> = {};
    database.lawmakers.forEach((lm) => {
      map[lm.id] = 'present';
    });
    return map;
  });

  // Motion Form State
  const [motionTitle, setMotionTitle] = useState('');
  const [motionPrimarySponsor, setMotionPrimarySponsor] = useState(database.lawmakers[0]?.id || '');
  const [motionSupportingIds, setMotionSupportingIds] = useState<string[]>([]);
  const [motionCategory, setMotionCategory] = useState<MotionRecord['category']>('Security');
  const [motionStatus, setMotionStatus] = useState<MotionRecord['status']>('Adopted');
  const [motionNotes, setMotionNotes] = useState('');
  const [motionResolution, setMotionResolution] = useState('');

  // Bill Form State
  const [billTitle, setBillTitle] = useState('');
  const [billSponsor, setBillSponsor] = useState(database.lawmakers[0]?.id || '');
  const [billCoSponsors, setBillCoSponsors] = useState<string[]>([]);
  const [billGazette, setBillGazette] = useState(`OY/HA/2026/0${database.bills.length + 1}`);
  const [billStage, setBillStage] = useState<BillRecord['stage']>('First Reading');
  const [billSummary, setBillSummary] = useState('');

  // Project Form State
  const [projLawmaker, setProjLawmaker] = useState(database.lawmakers[0]?.id || '');
  const [projTitle, setProjTitle] = useState('');
  const [projLga, setProjLga] = useState(database.lawmakers[0]?.lga || '');
  const [projCommunity, setProjCommunity] = useState('');
  const [projSector, setProjSector] = useState<ConstituencyProject['sector']>('Education');
  const [projBudget, setProjBudget] = useState<number>(25000000);
  const [projStatus, setProjStatus] = useState<ConstituencyProject['status']>('Ongoing');
  const [projVerified, setProjVerified] = useState(true);
  const [projAuditNote, setProjAuditNote] = useState('');

  // Customization & Formula Weights State
  const [weights, setWeights] = useState(database.settings.weights);
  const [charityName, setCharityName] = useState(database.settings.charityName);
  const [charityTagline, setCharityTagline] = useState(database.settings.charityTagline);
  const [contactEmail, setContactEmail] = useState(database.settings.contactEmail);
  const [donationUrl, setDonationUrl] = useState(database.settings.donationUrl);

  // Custom Metric Creator
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricDesc, setNewMetricDesc] = useState('');
  const [newMetricUnit, setNewMetricUnit] = useState('');
  const [newMetricWeight, setNewMetricWeight] = useState(5);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (officerPin === '1976' || officerPin === 'admin' || officerId.trim().length > 3) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid Officer PIN. Use default PIN 1976 for demo testing.');
    }
  };

  // 1-Click Fill Preset for Roll-call
  const setAllAttendance = (status: 'present' | 'excused' | 'absent') => {
    const updated: Record<string, 'present' | 'excused' | 'absent' | 'late'> = {};
    database.lawmakers.forEach((lm) => {
      updated[lm.id] = status;
    });
    setAttendanceMap(updated);
  };

  // Submit new session
  const handleSubmitSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreateSession({
        sessionName,
        sittingNumber,
        date: sessionDate,
        presidingOfficer,
        summary: sessionSummary,
        attendance: attendanceMap,
      });
      showNotification(`Plenary Sitting #${sittingNumber} logged successfully! Lawmaker scores updated.`);
      setSittingNumber((prev) => prev + 1);
      setSessionName(`Plenary Sitting ${sittingNumber + 1}: 10th Assembly, 2nd Session`);
      setSessionSummary('');
    } catch (err) {
      showNotification('Failed to record plenary session.', 'error');
    }
  };

  // Submit new motion
  const handleSubmitMotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motionTitle.trim()) return;
    try {
      await onCreateMotion({
        title: motionTitle.trim(),
        primarySponsorId: motionPrimarySponsor,
        supportingLawmakerIds: motionSupportingIds,
        category: motionCategory,
        status: motionStatus,
        date: sessionDate,
        notes: motionNotes,
        resolutionText: motionResolution,
        sittingNumber,
      });
      showNotification('Motion logged and credited to sponsor and co-sponsors!');
      setMotionTitle('');
      setMotionNotes('');
      setMotionResolution('');
      setMotionSupportingIds([]);
    } catch (err) {
      showNotification('Failed to log motion.', 'error');
    }
  };

  // Submit new bill
  const handleSubmitBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billTitle.trim()) return;
    try {
      await onCreateBill({
        title: billTitle.trim(),
        sponsorId: billSponsor,
        coSponsorIds: billCoSponsors,
        gazetteNumber: billGazette,
        stage: billStage,
        summary: billSummary,
        dateIntroduced: sessionDate,
      });
      showNotification('Bill recorded and linked to legislative pipeline!');
      setBillTitle('');
      setBillSummary('');
      setBillCoSponsors([]);
    } catch (err) {
      showNotification('Failed to save bill.', 'error');
    }
  };

  // Submit project
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    try {
      await onCreateProject({
        lawmakerId: projLawmaker,
        title: projTitle.trim(),
        lga: projLga,
        community: projCommunity.trim(),
        sector: projSector,
        budgetAmount: Number(projBudget),
        status: projStatus,
        liaisonVerified: projVerified,
        verificationNote: projAuditNote.trim(),
      });
      showNotification('Constituency project audit record added.');
      setProjTitle('');
      setProjCommunity('');
      setProjAuditNote('');
    } catch (err) {
      showNotification('Failed to add project.', 'error');
    }
  };

  // Save Settings & Custom Weights
  const handleSaveSettings = async () => {
    try {
      await onUpdateSettings({
        charityName,
        charityTagline,
        contactEmail,
        donationUrl,
        weights,
      });
      showNotification('Custom weights & charity branding saved! All scores recomputed.');
    } catch (err) {
      showNotification('Failed to save settings.', 'error');
    }
  };

  // Add Custom Metric Definition
  const handleAddCustomMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMetricName.trim()) return;
    const metricId = newMetricName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newMetric: CustomMetricDefinition = {
      id: metricId,
      name: newMetricName.trim(),
      description: newMetricDesc.trim(),
      unit: newMetricUnit.trim() || 'Units',
      weight: Number(newMetricWeight) || 5,
      maxValue: 10,
    };

    const updatedMetrics = [...database.settings.customMetrics, newMetric];
    const updatedWeights = {
      ...weights,
      customMetrics: {
        ...(weights.customMetrics || {}),
        [metricId]: newMetric.weight,
      },
    };

    try {
      await onUpdateSettings({
        customMetrics: updatedMetrics,
        weights: updatedWeights,
      });
      setWeights(updatedWeights);
      showNotification(`Custom tracking metric "${newMetricName}" added!`);
      setNewMetricName('');
      setNewMetricDesc('');
      setNewMetricUnit('');
    } catch (err) {
      showNotification('Failed to add custom metric.', 'error');
    }
  };

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
          <div className="text-center pb-4 border-b border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Assembly Liaison Portal</h3>
            <p className="text-xs text-slate-500 mt-1">
              Authorized entry for Oyo State House of Assembly Liaison Officers & Civic Monitors.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-5 space-y-4 text-xs">
            {authError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-md font-medium">
                {authError}
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Liaison Officer ID</label>
              <input
                type="text"
                required
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Access PIN</label>
              <input
                type="password"
                required
                value={officerPin}
                onChange={(e) => setOfficerPin(e.target.value)}
                placeholder="Default: 1976"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900">
              Demo Credentials Pre-filled: <strong>PIN: 1976</strong>. Click below to enter backend management.
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
              >
                Enter Portal
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Calculate attendance counters
  const presentCount = Object.values(attendanceMap).filter((v) => v === 'present').length;
  const excusedCount = Object.values(attendanceMap).filter((v) => v === 'excused').length;
  const absentCount = Object.values(attendanceMap).filter((v) => v === 'absent').length;
  const lateCount = Object.values(attendanceMap).filter((v) => v === 'late').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  OYHA Liaison Officer Control Console
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  {officerId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Log attendance, motions, private member bills, project audits, and customize tracker scoring.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors"
            >
              Exit Console
            </button>
          </div>
        </div>

        {/* Global Notification */}
        {feedbackMsg && (
          <div
            className={`px-4 py-2.5 text-xs font-medium flex items-center gap-2 transition-all ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 bg-slate-50 px-4 sm:px-6 flex items-center gap-1 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'sessions'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Plenary Attendance Roll-Call</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('motions')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'motions'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Log Motions Moved / Supported</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bills')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'bills'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Log Bills</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Constituency Projects Audit</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('customise')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'customise'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customise Metrics & Weights</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('embed')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'embed'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Charity Embed Code</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: PLENARY SITTINGS & ATTENDANCE ROLL-CALL */}
          {activeTab === 'sessions' && (
            <form onSubmit={handleSubmitSession} className="space-y-6 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Record New Plenary Session</h4>
                  <span className="text-xs text-slate-500 font-mono">
                    Total Sittings Tracked: {database.settings.totalSittingsToDate}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Sitting Number</label>
                    <input
                      type="number"
                      required
                      value={sittingNumber}
                      onChange={(e) => setSittingNumber(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Sitting Date</label>
                    <input
                      type="date"
                      required
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Presiding Officer</label>
                    <input
                      type="text"
                      required
                      value={presidingOfficer}
                      onChange={(e) => setPresidingOfficer(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Session Title / Order of the Day</label>
                  <input
                    type="text"
                    required
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Hansard Summary / Legislative Business Transacted
                  </label>
                  <textarea
                    rows={2}
                    value={sessionSummary}
                    onChange={(e) => setSessionSummary(e.target.value)}
                    placeholder="Brief highlights of motions, bills, petitions or committee reports considered during this sitting..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Attendance Roll-Call Grid */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Chamber Roll-Call (32 Assembly Members)
                    </h4>
                    <p className="text-slate-500 text-[11px]">
                      Quickly mark presence, leave of absence, or apology.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Batch Action:</span>
                    <button
                      type="button"
                      onClick={() => setAllAttendance('present')}
                      className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-semibold text-[11px]"
                    >
                      All Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllAttendance('excused')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px]"
                    >
                      All Excused
                    </button>
                  </div>
                </div>

                {/* Counters Bar */}
                <div className="flex items-center gap-3 p-2.5 bg-slate-100 rounded-lg text-xs font-semibold">
                  <span className="text-emerald-800">Present: {presentCount}</span>
                  <span>·</span>
                  <span className="text-amber-800">Excused: {excusedCount}</span>
                  <span>·</span>
                  <span className="text-rose-800">Absent: {absentCount}</span>
                  <span>·</span>
                  <span className="text-blue-800">Late: {lateCount}</span>
                </div>

                {/* 32 Lawmakers Roll-Call List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
                  {database.lawmakers.map((lm) => {
                    const status = attendanceMap[lm.id] || 'present';
                    return (
                      <div
                        key={lm.id}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 truncate text-[11px]">{lm.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {lm.constituency} ({lm.party})
                          </div>
                        </div>

                        {/* Status Toggle Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          {(['present', 'excused', 'absent', 'late'] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setAttendanceMap((prev) => ({ ...prev, [lm.id]: st }))}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                status === st
                                  ? st === 'present'
                                    ? 'bg-emerald-600 text-white font-bold'
                                    : st === 'excused'
                                    ? 'bg-amber-600 text-white font-bold'
                                    : st === 'late'
                                    ? 'bg-blue-600 text-white font-bold'
                                    : 'bg-rose-600 text-white font-bold'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {st === 'present' ? 'P' : st === 'excused' ? 'E' : st === 'absent' ? 'A' : 'L'}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 text-white font-bold rounded-lg hover:bg-emerald-900 transition-colors shadow-xs flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Commit Plenary Session & Recompute Scores</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MOTIONS LOGGING */}
          {activeTab === 'motions' && (
            <form onSubmit={handleSubmitMotion} className="space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Log Plenary Motion Moved & Supported</h4>
                <p className="text-slate-500 text-[11px]">
                  Logging a motion automatically increments the primary sponsor's "Motions Moved" and gives support credit to all selected co-sponsors.
                </p>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Motion Title</label>
                  <input
                    type="text"
                    required
                    value={motionTitle}
                    onChange={(e) => setMotionTitle(e.target.value)}
                    placeholder="e.g. Motion on Urgent Intervention on Cocoa Farmers Subsidies in Ibarapa and Oyo..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Primary Sponsor (Mover)
                    </label>
                    <select
                      value={motionPrimarySponsor}
                      onChange={(e) => setMotionPrimarySponsor(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      {database.lawmakers.map((lm) => (
                        <option key={lm.id} value={lm.id}>
                          {lm.name} ({lm.constituency})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Policy Category</label>
                    <select
                      value={motionCategory}
                      onChange={(e) => setMotionCategory(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="Security">Security & Law Enforcement</option>
                      <option value="Healthcare">Healthcare & Sanitation</option>
                      <option value="Education">Education & Tertiary</option>
                      <option value="Agriculture">Agriculture & Food Security</option>
                      <option value="Infrastructure">Infrastructure & Roads</option>
                      <option value="Youth & Sports">Youth & Sports</option>
                      <option value="Governance">Governance & Public Accounts</option>
                      <option value="Environment">Environment & Water Resources</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">House Status</label>
                    <select
                      value={motionStatus}
                      onChange={(e) => setMotionStatus(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="Adopted">Adopted by House</option>
                      <option value="Referred to Committee">Referred to Committee</option>
                      <option value="Debated">Debated (Under Consideration)</option>
                      <option value="Deferred">Deferred</option>
                    </select>
                  </div>
                </div>

                {/* Co-sponsors multi-selection */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Supporting Lawmakers / Co-Sponsors ({motionSupportingIds.length} selected)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-md bg-white">
                    {database.lawmakers.map((lm) => {
                      if (lm.id === motionPrimarySponsor) return null;
                      const checked = motionSupportingIds.includes(lm.id);
                      return (
                        <label
                          key={lm.id}
                          className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-50 cursor-pointer text-[11px]"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setMotionSupportingIds((prev) => [...prev, lm.id]);
                              } else {
                                setMotionSupportingIds((prev) => prev.filter((id) => id !== lm.id));
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="truncate">{lm.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Motion Debate Notes & Context</label>
                  <textarea
                    rows={2}
                    value={motionNotes}
                    onChange={(e) => setMotionNotes(e.target.value)}
                    placeholder="Brief background on why the motion was brought up..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Formal Resolution Text (Optional)</label>
                  <input
                    type="text"
                    value={motionResolution}
                    onChange={(e) => setMotionResolution(e.target.value)}
                    placeholder="Be it resolved by the House that the Executive Governor..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 text-white font-bold rounded-lg hover:bg-emerald-900 transition-colors shadow-xs flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Log Motion & Award Performance Points</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BILLS LOGGING */}
          {activeTab === 'bills' && (
            <form onSubmit={handleSubmitBill} className="space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Log New Assembly Bill</h4>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bill Title</label>
                  <input
                    type="text"
                    required
                    value={billTitle}
                    onChange={(e) => setBillTitle(e.target.value)}
                    placeholder="e.g. Oyo State Agricultural Land Leasing and Smallholder Protection Bill..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Primary Sponsor</label>
                    <select
                      value={billSponsor}
                      onChange={(e) => setBillSponsor(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      {database.lawmakers.map((lm) => (
                        <option key={lm.id} value={lm.id}>
                          {lm.name} ({lm.constituency})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Gazette Number</label>
                    <input
                      type="text"
                      required
                      value={billGazette}
                      onChange={(e) => setBillGazette(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Current Reading Stage</label>
                    <select
                      value={billStage}
                      onChange={(e) => setBillStage(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="First Reading">First Reading</option>
                      <option value="Second Reading">Second Reading</option>
                      <option value="Committee Stage">Committee Stage</option>
                      <option value="Third Reading">Third Reading</option>
                      <option value="Passed & Assented">Passed & Assented into Law</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Legislative Objective / Summary</label>
                  <textarea
                    rows={3}
                    value={billSummary}
                    onChange={(e) => setBillSummary(e.target.value)}
                    placeholder="Describe key clauses and civic purpose of the bill..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 text-white font-bold rounded-lg hover:bg-emerald-900 transition-colors shadow-xs flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Bill & Credit Sponsor</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: CONSTITUENCY PROJECTS */}
          {activeTab === 'projects' && (
            <form onSubmit={handleSubmitProject} className="space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Constituency Project Verification Entry</h4>
                <p className="text-slate-500 text-[11px]">
                  Document verified grassroots projects facilitated by lawmakers in their respective constituencies.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Lawmaker</label>
                    <select
                      value={projLawmaker}
                      onChange={(e) => {
                        setProjLawmaker(e.target.value);
                        const lm = database.lawmakers.find((l) => l.id === e.target.value);
                        if (lm) setProjLga(lm.lga);
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      {database.lawmakers.map((lm) => (
                        <option key={lm.id} value={lm.id}>
                          {lm.name} ({lm.constituency})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Project Title</label>
                    <input
                      type="text"
                      required
                      value={projTitle}
                      onChange={(e) => setProjTitle(e.target.value)}
                      placeholder="e.g. Drilling of 3 Solar-Powered Boreholes"
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Local Govt Area (LGA)</label>
                    <input
                      type="text"
                      required
                      value={projLga}
                      onChange={(e) => setProjLga(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Community / Ward</label>
                    <input
                      type="text"
                      required
                      value={projCommunity}
                      onChange={(e) => setProjCommunity(e.target.value)}
                      placeholder="e.g. Ward 4, Oke-Ado"
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Sector</label>
                    <select
                      value={projSector}
                      onChange={(e) => setProjSector(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="Education">Education</option>
                      <option value="Health">Health</option>
                      <option value="Water/Sanitation">Water/Sanitation</option>
                      <option value="Roads">Roads & Drainage</option>
                      <option value="Electrification">Electrification / Solar</option>
                      <option value="Youth Empowerment">Youth Empowerment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Budget Allocation (₦)</label>
                    <input
                      type="number"
                      value={projBudget}
                      onChange={(e) => setProjBudget(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Execution Status</label>
                    <select
                      value={projStatus}
                      onChange={(e) => setProjStatus(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Tender/Budgeted">Tender / Budgeted</option>
                      <option value="Stalled">Stalled / Abandoned</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="projVerified"
                      checked={projVerified}
                      onChange={(e) => setProjVerified(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="projVerified" className="text-slate-800 font-semibold">
                      Verified on Site by Liaison Officer
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Civil Society Audit Note</label>
                  <input
                    type="text"
                    value={projAuditNote}
                    onChange={(e) => setProjAuditNote(e.target.value)}
                    placeholder="e.g. Inspected on 14th Oct 2026. Solar panels and inverters functioning properly..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 text-white font-bold rounded-lg hover:bg-emerald-900 transition-colors shadow-xs flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Project Record</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: CUSTOMIZE METRICS & WEIGHTS */}
          {activeTab === 'customise' && (
            <div className="space-y-6 text-xs">
              {/* Performance Formula Weight Customizer */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-emerald-700" />
                      <span>Legislative Index Formula Weighting</span>
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Adjust the relative priority of each legislative function in the overall composite ranking (0-100 pts).
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Formula Balance</span>
                    <span className="font-mono font-bold text-slate-800">
                      {weights.attendance + weights.motionsMoved + weights.motionsSupported + weights.bills + weights.debateContributions}%
                    </span>
                  </div>
                </div>

                {/* Weight Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex justify-between font-semibold text-slate-800 mb-1">
                      <span>Plenary Attendance Weight</span>
                      <span className="text-emerald-700 font-bold">{weights.attendance}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={60}
                      value={weights.attendance}
                      onChange={(e) => setWeights({ ...weights, attendance: Number(e.target.value) })}
                      className="w-full accent-emerald-700"
                    />
                    <div className="text-[10px] text-slate-400 mt-1">Consistency in Chamber sessions</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex justify-between font-semibold text-slate-800 mb-1">
                      <span>Motions Moved (Primary Sponsor)</span>
                      <span className="text-amber-700 font-bold">{weights.motionsMoved}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      value={weights.motionsMoved}
                      onChange={(e) => setWeights({ ...weights, motionsMoved: Number(e.target.value) })}
                      className="w-full accent-amber-700"
                    />
                    <div className="text-[10px] text-slate-400 mt-1">Drafting & presenting key policy motions</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex justify-between font-semibold text-slate-800 mb-1">
                      <span>Motions Supported / Seconded</span>
                      <span className="text-teal-700 font-bold">{weights.motionsSupported}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={30}
                      value={weights.motionsSupported}
                      onChange={(e) => setWeights({ ...weights, motionsSupported: Number(e.target.value) })}
                      className="w-full accent-teal-700"
                    />
                    <div className="text-[10px] text-slate-400 mt-1">Consensus building & cross-bench support</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex justify-between font-semibold text-slate-800 mb-1">
                      <span>Bills Sponsored & Enacted</span>
                      <span className="text-purple-700 font-bold">{weights.bills}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={40}
                      value={weights.bills}
                      onChange={(e) => setWeights({ ...weights, bills: Number(e.target.value) })}
                      className="w-full accent-purple-700"
                    />
                    <div className="text-[10px] text-slate-400 mt-1">Primary private members bills introduced</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 sm:col-span-2">
                    <div className="flex justify-between font-semibold text-slate-800 mb-1">
                      <span>Floor Debate & Hansard Speeches</span>
                      <span className="text-rose-700 font-bold">{weights.debateContributions}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={30}
                      value={weights.debateContributions}
                      onChange={(e) => setWeights({ ...weights, debateContributions: Number(e.target.value) })}
                      className="w-full accent-rose-700"
                    />
                    <div className="text-[10px] text-slate-400 mt-1">Active oral contribution during plenary debates</div>
                  </div>
                </div>
              </div>

              {/* Add Custom Metric Field on the fly */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Add New Custom Tracking Metric ("Perform More Function")</span>
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Extend the tracker with unique civil society indicators (e.g. "Town Hall Consultations", "Public Petitions Presented", "Youth Skill Grants").
                </p>

                <form onSubmit={handleAddCustomMetric} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">Metric Title</label>
                    <input
                      type="text"
                      required
                      value={newMetricName}
                      onChange={(e) => setNewMetricName(e.target.value)}
                      placeholder="e.g. Grassroots Town Halls Held"
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Unit Label</label>
                    <input
                      type="text"
                      value={newMetricUnit}
                      onChange={(e) => setNewMetricUnit(e.target.value)}
                      placeholder="e.g. Town halls, Petitions"
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Weight Factor (1-15)</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newMetricWeight}
                      onChange={(e) => setNewMetricWeight(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-slate-700 font-semibold mb-1">Description / Definition</label>
                    <input
                      type="text"
                      value={newMetricDesc}
                      onChange={(e) => setNewMetricDesc(e.target.value)}
                      placeholder="Explanation of what constitutes a verified entry..."
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-900 text-white font-semibold rounded-md hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Metric</span>
                    </button>
                  </div>
                </form>

                {/* Existing Custom Metrics */}
                {database.settings.customMetrics.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">
                      Active Custom Metrics ({database.settings.customMetrics.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {database.settings.customMetrics.map((cm) => (
                        <div key={cm.id} className="p-2.5 bg-white border border-slate-200 rounded-lg">
                          <div className="font-bold text-slate-900">{cm.name}</div>
                          <div className="text-[11px] text-slate-500">{cm.description}</div>
                          <div className="text-[10px] text-emerald-700 font-medium mt-1">
                            Unit: {cm.unit} · Weight: {cm.weight} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Charity Branding Settings */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Charity & Organization White-Labeling</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Organization / Charity Name</label>
                    <input
                      type="text"
                      value={charityName}
                      onChange={(e) => setCharityName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Mission Tagline</label>
                    <input
                      type="text"
                      value={charityTagline}
                      onChange={(e) => setCharityTagline(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Public Inquiries Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Charity Donation / Support URL</label>
                    <input
                      type="url"
                      value={donationUrl}
                      onChange={(e) => setDonationUrl(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Reset all tracker records to default Oyo State 10th Assembly initial data?')) {
                      await onResetData();
                      showNotification('Tracker records reset to authentic Oyo State baseline.');
                    }
                  }}
                  className="px-3 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Factory Baseline</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-6 py-2.5 bg-emerald-800 text-white font-bold rounded-lg hover:bg-emerald-900 transition-colors shadow-xs flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Configuration & Recalculate Rankings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: EMBED CODE FOR CHARITY WEBSITE */}
          {activeTab === 'embed' && (
            <div className="space-y-6 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-emerald-700" />
                  <h4 className="text-base font-bold text-slate-900">
                    Deploy On Your Charity Website / Blog
                  </h4>
                </div>

                <p className="text-slate-600 leading-relaxed">
                  You can deploy this full legislative tracking application directly into your charity’s WordPress, Wix, Squarespace, or custom NGO website with a responsive iframe snippet or standalone sub-domain link.
                </p>

                {/* Embed Snippet Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-700">Responsive IFrame Snippet</span>
                    <button
                      type="button"
                      onClick={() => {
                        const snippet = `<iframe src="${window.location.origin}" width="100%" height="900" frameborder="0" style="border:none;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);" title="Oyo State Legislative Tracker" allow="clipboard-write"></iframe>`;
                        navigator.clipboard.writeText(snippet);
                        showNotification('Embed HTML copied to clipboard!');
                      }}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Copy HTML Code
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-900 text-emerald-300 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed select-all">
{`<iframe
  src="${window.location.origin}"
  width="100%"
  height="900"
  frameborder="0"
  style="border:none; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.08);"
  title="Oyo State Legislative Performance Tracker"
  allow="clipboard-write">
</iframe>`}
                  </pre>
                </div>

                {/* CSV Scorecard Download */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Download Civil Society Report Card (CSV)</h5>
                    <p className="text-slate-500 text-[11px]">
                      Export all 32 lawmakers' computed attendance rates, motions moved, supported, bills, and scores for your NGO's quarterly press release.
                    </p>
                  </div>

                  <a
                    href="/api/export/csv"
                    download="oyha_legislative_scorecard.csv"
                    className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
