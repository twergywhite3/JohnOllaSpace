import React from 'react';
import { Lawmaker } from '../types.ts';
import { User, CheckCircle2, ChevronRight, MessageSquareHeart, Sparkles } from 'lucide-react';

interface LawmakerCardProps {
  lawmaker: Lawmaker;
  rank: number;
  onSelect: (lawmaker: Lawmaker) => void;
  onOpenFeedback: (lawmaker: Lawmaker) => void;
}

export const LawmakerCard: React.FC<LawmakerCardProps> = ({ lawmaker, rank, onSelect, onOpenFeedback }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 80) return 'text-teal-700 bg-teal-50 border-teal-300';
    if (score >= 70) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  const partyBadgeClass =
    lawmaker.party === 'PDP'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : lawmaker.party === 'APC'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-amber-100 text-amber-800 border-amber-200';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-400 hover:shadow-xs transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Rank, Party, Score */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-slate-400">#{rank}</span>
            <span className={`px-2 py-0.5 text-[11px] font-semibold border rounded-sm ${partyBadgeClass}`}>
              {lawmaker.party}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-500">{lawmaker.zone} Zone</span>
          </div>

          {/* Composite Score Tag */}
          <div className={`px-2.5 py-0.5 text-xs font-bold border rounded-md ${getScoreColor(lawmaker.score)}`}>
            {lawmaker.score} <span className="text-[10px] font-normal">/ 100</span>
          </div>
        </div>

        {/* Lawmaker Avatar & Name */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold text-sm">
            {lawmaker.gender === 'Female' ? '👩🏾' : '👨🏾'}
          </div>

          <div className="min-w-0 flex-1">
            <h4
              onClick={() => onSelect(lawmaker)}
              className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors cursor-pointer truncate text-sm"
              title={lawmaker.name}
            >
              {lawmaker.name}
            </h4>
            <div className="text-xs text-slate-500 truncate mt-0.5">
              {lawmaker.constituency} Constituency
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              LGA: {lawmaker.lga}
            </div>
          </div>
        </div>

        {/* Role in Assembly if applicable */}
        <div className="mt-3 text-xs text-slate-600 line-clamp-1 italic bg-slate-50 px-2 py-1 rounded border border-slate-100">
          {lawmaker.role}
        </div>

        {/* 4-Grid Key Performance Metrics */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-2 bg-slate-50 rounded">
            <div className="text-[10px] text-slate-400 uppercase font-medium">Plenary Presence</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {lawmaker.attendanceRate}%{' '}
              <span className="text-[10px] font-normal text-slate-500">
                ({lawmaker.sittingsAttended} sittings)
              </span>
            </div>
          </div>

          <div className="p-2 bg-slate-50 rounded">
            <div className="text-[10px] text-slate-400 uppercase font-medium">Motions Moved</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {lawmaker.motionsMoved}{' '}
              <span className="text-[10px] font-normal text-slate-500">
                ({lawmaker.motionsSupported} supported)
              </span>
            </div>
          </div>

          <div className="p-2 bg-slate-50 rounded">
            <div className="text-[10px] text-slate-400 uppercase font-medium">Bills Sponsored</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {lawmaker.billsSponsored}{' '}
              <span className="text-[10px] font-normal text-slate-500">bills</span>
            </div>
          </div>

          <div className="p-2 bg-slate-50 rounded">
            <div className="text-[10px] text-slate-400 uppercase font-medium">Hansard Debates</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {lawmaker.debateInterventions}{' '}
              <span className="text-[10px] font-normal text-slate-500">speeches</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenFeedback(lawmaker)}
          className="text-xs text-slate-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
          title="Constituent Review or Report"
        >
          <MessageSquareHeart className="w-3.5 h-3.5 text-slate-400" />
          <span>Feedback</span>
        </button>

        <button
          type="button"
          onClick={() => onSelect(lawmaker)}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-emerald-800 transition-colors flex items-center gap-1"
        >
          <span>Full Scorecard</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
