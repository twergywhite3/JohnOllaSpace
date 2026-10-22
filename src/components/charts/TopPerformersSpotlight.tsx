import React from 'react';
import { Lawmaker } from '../../types.ts';
import { Award, FileText, CheckCircle2, MessageSquare, ShieldCheck, HeartHandshake } from 'lucide-react';

interface TopPerformersSpotlightProps {
  lawmakers: Lawmaker[];
  onSelectLawmaker: (lawmaker: Lawmaker) => void;
}

export const TopPerformersSpotlight: React.FC<TopPerformersSpotlightProps> = ({ lawmakers, onSelectLawmaker }) => {
  const topAttendance = [...lawmakers].sort((a, b) => b.attendanceRate - a.attendanceRate)[0];
  const topMotions = [...lawmakers].sort((a, b) => b.motionsMoved - a.motionsMoved)[0];
  const topSupporter = [...lawmakers].sort((a, b) => b.motionsSupported - a.motionsSupported)[0];
  const topBills = [...lawmakers].sort((a, b) => b.billsSponsored - a.billsSponsored)[0];
  const topDebates = [...lawmakers].sort((a, b) => b.debateInterventions - a.debateInterventions)[0];

  const highlights = [
    {
      category: 'Top Plenary Attendance',
      lawmaker: topAttendance,
      stat: `${topAttendance?.attendanceRate}%`,
      subtext: `${topAttendance?.sittingsAttended} sittings present`,
      icon: ShieldCheck,
      color: 'border-l-blue-600 bg-blue-50/20 text-blue-800',
    },
    {
      category: 'Most Motions Moved',
      lawmaker: topMotions,
      stat: `${topMotions?.motionsMoved} motions`,
      subtext: 'Primary sponsor of motions',
      icon: FileText,
      color: 'border-l-amber-600 bg-amber-50/20 text-amber-800',
    },
    {
      category: 'Top Consensus Builder',
      lawmaker: topSupporter,
      stat: `${topSupporter?.motionsSupported} supported`,
      subtext: 'Motions co-sponsored/seconded',
      icon: HeartHandshake,
      color: 'border-l-emerald-600 bg-emerald-50/20 text-emerald-800',
    },
    {
      category: 'Most Bills Introduced',
      lawmaker: topBills,
      stat: `${topBills?.billsSponsored} bills`,
      subtext: 'Substantive private member bills',
      icon: Award,
      color: 'border-l-purple-600 bg-purple-50/20 text-purple-800',
    },
    {
      category: 'Top Debate Floor Contributor',
      lawmaker: topDebates,
      stat: `${topDebates?.debateInterventions} Hansard entries`,
      subtext: 'Active floor interventions',
      icon: MessageSquare,
      color: 'border-l-rose-600 bg-rose-50/20 text-rose-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {highlights.map((item, index) => {
        if (!item.lawmaker) return null;
        const Icon = item.icon;

        return (
          <div
            key={index}
            onClick={() => onSelectLawmaker(item.lawmaker)}
            className={`cursor-pointer border border-slate-200 border-l-4 rounded-lg p-3.5 bg-white hover:shadow-xs hover:border-slate-300 transition-all ${item.color}`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-600">
                {item.category}
              </span>
              <Icon className="w-4 h-4 text-slate-400" />
            </div>

            <div className="text-base font-bold text-slate-900 truncate mt-1">
              {item.lawmaker.name}
            </div>

            <div className="text-xs text-slate-500 mt-0.5 truncate">
              {item.lawmaker.constituency} · {item.lawmaker.party}
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-900">{item.stat}</span>
              <span className="text-[10px] text-slate-400">{item.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
