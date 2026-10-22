import React, { useState } from 'react';
import { Lawmaker, MotionRecord, BillRecord, ConstituencyProject, CitizenReport, PlenarySession } from '../types.ts';
import { X, Award, FileText, CheckCircle2, AlertCircle, Building2, MessageSquare, Star, Printer, HeartHandshake, Shield, MapPin } from 'lucide-react';

interface LawmakerModalProps {
  lawmaker: Lawmaker;
  allMotions: MotionRecord[];
  allBills: BillRecord[];
  allProjects: ConstituencyProject[];
  allCitizenReports: CitizenReport[];
  recentSessions: PlenarySession[];
  onClose: () => void;
  onSubmitCitizenFeedback: (report: Partial<CitizenReport>) => void;
}

export const LawmakerModal: React.FC<LawmakerModalProps> = ({
  lawmaker,
  allMotions,
  allBills,
  allProjects,
  allCitizenReports,
  recentSessions,
  onClose,
  onSubmitCitizenFeedback,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'motions' | 'bills' | 'projects' | 'feedback'>('overview');

  // Feedback form state
  const [constituentName, setConstituentName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<CitizenReport['category']>('Constituency Issue');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Filter motions where lawmaker is primary sponsor or supporting
  const motionsMoved = allMotions.filter((m) => m.primarySponsorId === lawmaker.id);
  const motionsSupported = allMotions.filter((m) => m.supportingLawmakerIds.includes(lawmaker.id));
  const bills = allBills.filter((b) => b.sponsorId === lawmaker.id || b.coSponsorIds.includes(lawmaker.id));
  const projects = allProjects.filter((p) => p.lawmakerId === lawmaker.id);
  const reports = allCitizenReports.filter((r) => r.lawmakerId === lawmaker.id);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!constituentName.trim() || !message.trim()) return;

    onSubmitCitizenFeedback({
      lawmakerId: lawmaker.id,
      constituentName: constituentName.trim(),
      email: email.trim(),
      lga: lawmaker.lga,
      category,
      message: message.trim(),
      rating,
    });

    setFormSubmitted(true);
    setTimeout(() => {
      setConstituentName('');
      setEmail('');
      setMessage('');
      setFormSubmitted(false);
    }, 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                {lawmaker.gender === 'Female' ? '👩🏾' : '👨🏾'}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {lawmaker.party}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-300 font-medium">
                    {lawmaker.constituency} Constituency
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-400">{lawmaker.zone} Zone</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {lawmaker.name}
                </h2>

                <p className="text-xs text-emerald-400 mt-0.5 font-medium">
                  {lawmaker.role}
                </p>
              </div>
            </div>

            {/* Score Pill / Badge */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
                  Legislative Index
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {lawmaker.score}
                  <span className="text-xs font-normal text-slate-400">/100</span>
                </span>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="mt-2 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Scorecard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="border-b border-slate-200 px-6 bg-slate-50 flex items-center gap-2 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Attendance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('motions')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'motions'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Motions ({motionsMoved.length} Moved · {motionsSupported.length} Supported)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bills')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'bills'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Bills ({bills.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Constituency Projects ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'feedback'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Constituent Voice ({reports.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Biography & Constituency */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Legislative Profile & Representation
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">{lawmaker.bio}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                  <span>Constituency: <strong className="text-slate-800">{lawmaker.constituency}</strong></span>
                  <span>·</span>
                  <span>Local Govt Area: <strong className="text-slate-800">{lawmaker.lga}</strong></span>
                  <span>·</span>
                  <span>Geopolitical Zone: <strong className="text-slate-800">{lawmaker.zone} Zone</strong></span>
                </div>
              </div>

              {/* 5-Metric Performance Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Plenary Attendance</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{lawmaker.attendanceRate}%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {lawmaker.sittingsAttended} attended · {lawmaker.sittingsExcused} excused
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Motions Moved</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{lawmaker.motionsMoved}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Primary sponsor of motions</div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Motions Supported</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{lawmaker.motionsSupported}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Co-sponsored & supported</div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Bills Introduced</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{lawmaker.billsSponsored}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Drafted & legislative stages</div>
                </div>
              </div>

              {/* Recent Plenary Sitting Roll-Call History */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">Recent Plenary Sitting Roll-Call</h4>
                <div className="space-y-2">
                  {recentSessions.map((session) => {
                    const status = session.attendance[lawmaker.id] || 'present';
                    const statusConfig = {
                      present: { label: 'Present in Chambers', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                      excused: { label: 'Excused with Leave', color: 'text-amber-700 bg-amber-50 border-amber-200' },
                      absent: { label: 'Absent without Apology', color: 'text-rose-700 bg-rose-50 border-rose-200' },
                      late: { label: 'Attended Late', color: 'text-blue-700 bg-blue-50 border-blue-200' },
                    }[status];

                    return (
                      <div
                        key={session.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{session.sessionName}</div>
                          <div className="text-slate-500 text-[11px]">
                            Date: {session.date} · Presided by: {session.presidingOfficer}
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border shrink-0 ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOTIONS */}
          {activeTab === 'motions' && (
            <div className="space-y-6">
              {/* Motions Moved as Primary Sponsor */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center justify-between">
                  <span>Motions Moved (Primary Sponsor)</span>
                  <span className="text-xs font-normal text-slate-500">{motionsMoved.length} recorded</span>
                </h4>
                {motionsMoved.length > 0 ? (
                  <div className="space-y-3">
                    {motionsMoved.map((motion) => (
                      <div key={motion.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-bold text-slate-900 text-sm">{motion.title}</h5>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                            {motion.status}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Category: <strong className="text-slate-700">{motion.category}</strong> · Date: {motion.date} · Sitting #{motion.sittingNumber || 'General'}
                        </div>
                        {motion.notes && <p className="text-slate-600 bg-white p-2.5 rounded border border-slate-100">{motion.notes}</p>}
                        {motion.resolutionText && (
                          <div className="text-emerald-800 text-[11px] font-medium bg-emerald-50/60 p-2 rounded border border-emerald-100">
                            House Resolution: {motion.resolutionText}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-lg">
                    No primary motions officially logged yet for this lawmaker.
                  </p>
                )}
              </div>

              {/* Motions Supported */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center justify-between">
                  <span>Motions Supported / Co-Sponsored</span>
                  <span className="text-xs font-normal text-slate-500">{motionsSupported.length} recorded</span>
                </h4>
                {motionsSupported.length > 0 ? (
                  <div className="space-y-2.5">
                    {motionsSupported.map((motion) => (
                      <div key={motion.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs">
                        <div className="font-semibold text-slate-900">{motion.title}</div>
                        <div className="text-slate-500 text-[11px] mt-1">
                          Category: {motion.category} · Date: {motion.date} · Status: {motion.status}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-lg">
                    No co-sponsored motions recorded.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BILLS */}
          {activeTab === 'bills' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 mb-2">Legislative Bills Sponsored</h4>
              {bills.length > 0 ? (
                bills.map((bill) => (
                  <div key={bill.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-slate-900 text-sm">{bill.title}</h5>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                        {bill.stage}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Gazette Ref: <strong className="text-slate-700">{bill.gazetteNumber}</strong> · Introduced: {bill.dateIntroduced}
                    </div>
                    <p className="text-slate-600 bg-white p-2.5 rounded border border-slate-100">{bill.summary}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic p-6 bg-slate-50 rounded-lg text-center">
                  No private member bills sponsored to date by this lawmaker.
                </p>
              )}
            </div>
          )}

          {/* TAB 4: CONSTITUENCY PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 mb-2">Verified Constituency Projects</h4>
              {projects.length > 0 ? (
                projects.map((proj) => (
                  <div key={proj.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">{proj.title}</h5>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {proj.community}, {proj.lga} LGA · Sector: <strong className="text-slate-700">{proj.sector}</strong>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${
                          proj.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {proj.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-600">
                        Appropriation: <strong className="text-slate-900">₦{proj.budgetAmount.toLocaleString()}</strong>
                      </span>
                      {proj.liaisonVerified && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Liaison Officer Verified ({proj.verificationDate})</span>
                        </span>
                      )}
                    </div>

                    {proj.verificationNote && (
                      <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-600 text-[11px]">
                        Audit Note: {proj.verificationNote}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic p-6 bg-slate-50 rounded-lg text-center">
                  No constituency projects documented or verified yet for this lawmaker.
                </p>
              )}
            </div>
          )}

          {/* TAB 5: CONSTITUENT VOICE & FEEDBACK FORM */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {/* Submission Form */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-slate-900">Submit Constituent Feedback or Report</h4>
                <p className="text-xs text-slate-600 mt-0.5 mb-3">
                  Are you a constituent of {lawmaker.constituency}? Rate your representative or submit a community issue for civil society tracking.
                </p>

                {formSubmitted ? (
                  <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-lg text-xs text-emerald-900 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Your report has been logged successfully and added to the civil society tracker.</span>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Your Full Name</label>
                        <input
                          type="text"
                          required
                          value={constituentName}
                          onChange={(e) => setConstituentName(e.target.value)}
                          placeholder="e.g. Adeola Adeyemi"
                          className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Email / Phone (Optional)</label>
                        <input
                          type="text"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. adeola@example.com"
                          className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Feedback Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as any)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                        >
                          <option value="Constituency Issue">Constituency Urgent Issue / Petition</option>
                          <option value="Project Verification">Constituency Project Audit / Update</option>
                          <option value="Question on Motion">Question on House Motion / Bill</option>
                          <option value="Commendation">Commendation / Appreciation</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Constituent Rating</label>
                        <div className="flex items-center gap-1.5 pt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="text-lg p-0.5 focus:outline-hidden"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-xs text-slate-500 ml-2 font-medium">{rating} of 5 stars</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Detailed Report or Review</label>
                      <textarea
                        required
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="State specific details about constituency project execution, town hall engagement, or community needs..."
                        className="w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-800 text-white font-semibold rounded-md hover:bg-emerald-900 transition-colors"
                    >
                      Submit Civic Report
                    </button>
                  </form>
                )}
              </div>

              {/* Existing Citizen Reports List */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">Verified Citizen Submissions</h4>
                {reports.length > 0 ? (
                  <div className="space-y-2.5">
                    {reports.map((report) => (
                      <div key={report.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{report.constituentName}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= report.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {report.category} · {report.date} · {report.lga} LGA
                        </div>
                        <p className="text-slate-700 mt-1">{report.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-lg">
                    No citizen reports logged yet for this constituency. Be the first to submit above.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
