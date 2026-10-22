import React, { useState } from 'react';
import { Lawmaker } from '../../types.ts';
import { Target, Info } from 'lucide-react';

interface QuadrantScatterPlotProps {
  lawmakers: Lawmaker[];
  onSelectLawmaker: (lawmaker: Lawmaker) => void;
}

export const QuadrantScatterPlot: React.FC<QuadrantScatterPlotProps> = ({ lawmakers, onSelectLawmaker }) => {
  const [hoveredLawmaker, setHoveredLawmaker] = useState<Lawmaker | null>(null);

  // X axis: Plenary Attendance (60% to 100%)
  // Y axis: Legislative Activity = motionsMoved + (billsSponsored * 1.5) (range 0 to 22)
  const minX = 75;
  const maxX = 100;
  const minY = 0;
  const maxY = 22;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Productivity Matrix</span>
          </div>
          <span className="text-xs text-slate-400">Attendance vs. Legislative Motions</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mt-1">Plenary Presence vs. Legislative Output</h3>
        <p className="text-xs text-slate-500 mt-0.5 mb-4">
          Hover over points to inspect individual lawmaker position. Quadrant threshold set at 90% attendance & 10 legislative acts.
        </p>

        {/* 2D Canvas / SVG Matrix */}
        <div className="relative w-full h-72 bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-hidden">
          {/* Quadrant Background Dividers */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
            <div className="border-r border-b border-dashed border-slate-300 p-2 text-[10px] font-semibold text-slate-400 flex items-start justify-start">
              High Output · Moderate Presence
            </div>
            <div className="border-b border-dashed border-slate-300 p-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50/20 flex items-start justify-end">
              ★ High-Impact Legislative Leaders
            </div>
            <div className="border-r border-dashed border-slate-300 p-2 text-[10px] font-semibold text-slate-400 flex items-end justify-start">
              Needs Civic Engagement
            </div>
            <div className="p-2 text-[10px] font-semibold text-blue-600 flex items-end justify-end">
              Consistent Plenary Anchors
            </div>
          </div>

          {/* Points Container */}
          <div className="relative w-full h-full">
            {lawmakers.map((lm) => {
              const activityScore = lm.motionsMoved + lm.billsSponsored * 1.5;
              const leftPercent = Math.min(95, Math.max(5, ((lm.attendanceRate - minX) / (maxX - minX)) * 100));
              const bottomPercent = Math.min(92, Math.max(8, ((activityScore - minY) / (maxY - minY)) * 100));
              const isSelected = hoveredLawmaker?.id === lm.id;

              return (
                <button
                  key={lm.id}
                  type="button"
                  onClick={() => onSelectLawmaker(lm)}
                  onMouseEnter={() => setHoveredLawmaker(lm)}
                  onMouseLeave={() => setHoveredLawmaker(null)}
                  style={{
                    left: `${leftPercent}%`,
                    bottom: `${bottomPercent}%`,
                    transform: 'translate(-50%, 50%)',
                  }}
                  className={`absolute w-3.5 h-3.5 rounded-full transition-transform cursor-pointer focus:outline-hidden ${
                    isSelected
                      ? 'scale-175 z-30 ring-4 ring-emerald-300 ring-offset-1 '
                      : 'hover:scale-140 z-10'
                  } ${
                    lm.party === 'PDP'
                      ? 'bg-emerald-600'
                      : lm.party === 'APC'
                      ? 'bg-blue-600'
                      : 'bg-amber-600'
                  }`}
                  aria-label={lm.name}
                />
              );
            })}
          </div>

          {/* Hover Tooltip Overlay */}
          {hoveredLawmaker && (
            <div className="absolute top-2 left-2 right-2 sm:right-auto sm:max-w-xs bg-slate-900 text-white rounded-lg p-3 text-xs shadow-lg z-40 pointer-events-none">
              <div className="font-bold text-white text-sm">{hoveredLawmaker.name}</div>
              <div className="text-slate-300 text-[11px] mt-0.5">
                {hoveredLawmaker.constituency} · {hoveredLawmaker.zone} Zone ({hoveredLawmaker.party})
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700 text-[11px]">
                <div>
                  <span className="text-slate-400">Attendance:</span>{' '}
                  <span className="font-semibold text-emerald-400">{hoveredLawmaker.attendanceRate}%</span>
                </div>
                <div>
                  <span className="text-slate-400">Motions Moved:</span>{' '}
                  <span className="font-semibold text-amber-400">{hoveredLawmaker.motionsMoved}</span>
                </div>
                <div>
                  <span className="text-slate-400">Bills Sponsored:</span>{' '}
                  <span className="font-semibold text-purple-400">{hoveredLawmaker.billsSponsored}</span>
                </div>
                <div>
                  <span className="text-slate-400">Score:</span>{' '}
                  <span className="font-bold text-white">{hoveredLawmaker.score}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Axis Labels & Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            PDP ({lawmakers.filter((l) => l.party === 'PDP').length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            APC ({lawmakers.filter((l) => l.party === 'APC').length})
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Horizontal: Attendance Rate · Vertical: Motions & Bills
        </div>
      </div>
    </div>
  );
};
