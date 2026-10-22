import React, { useState, useMemo } from 'react';
import { Lawmaker, GeopoliticalZone } from '../../types.ts';
import { BarChart3, TrendingUp, Users, Award, ChevronRight, Filter } from 'lucide-react';

interface PerformanceBarChartProps {
  lawmakers: Lawmaker[];
  onSelectLawmaker: (lawmaker: Lawmaker) => void;
}

type MetricKey = 'score' | 'attendanceRate' | 'motionsMoved' | 'motionsSupported' | 'billsSponsored' | 'debateInterventions';

export const PerformanceBarChart: React.FC<PerformanceBarChartProps> = ({ lawmakers, onSelectLawmaker }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('score');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const metricConfig: Record<MetricKey, { label: string; max: number; unit: string; color: string }> = {
    score: { label: 'Composite Index Score', max: 100, unit: 'pts', color: 'bg-emerald-600' },
    attendanceRate: { label: 'Plenary Attendance Rate', max: 100, unit: '%', color: 'bg-blue-600' },
    motionsMoved: { label: 'Motions Moved (Primary)', max: 12, unit: 'motions', color: 'bg-amber-600' },
    motionsSupported: { label: 'Motions Supported (Co-sponsor)', max: 30, unit: 'motions', color: 'bg-teal-600' },
    billsSponsored: { label: 'Bills Sponsored', max: 8, unit: 'bills', color: 'bg-purple-600' },
    debateInterventions: { label: 'Hansard Floor Debates', max: 70, unit: 'interventions', color: 'bg-rose-600' },
  };

  const filteredLawmakers = useMemo(() => {
    let list = [...lawmakers];
    if (selectedZone !== 'all') {
      list = list.filter((l) => l.zone === selectedZone);
    }
    // Sort descending by active metric
    return list.sort((a, b) => (b[selectedMetric] as number) - (a[selectedMetric] as number));
  }, [lawmakers, selectedZone, selectedMetric]);

  const activeConfig = metricConfig[selectedMetric];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Interactive Assembly Rankings</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Lawmaker Performance Comparison Graph</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Click on any bar to inspect individual attendance, motions moved, supported bills, and community audit logs.
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
          {(Object.keys(metricConfig) as MetricKey[]).map((key) => {
            const active = selectedMetric === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedMetric(key)}
                className={`px-2.5 py-1.5 font-medium rounded-md transition-all ${
                  active ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {metricConfig[key].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Geopolitical Zone Filter Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">Geopolitical Zone:</span>
          <div className="flex flex-wrap gap-1">
            {['all', 'Ibadan', 'Oyo', 'Ogbomoso', 'Oke-Ogun', 'Ibarapa'].map((zone) => (
              <button
                key={zone}
                type="button"
                onClick={() => setSelectedZone(zone)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedZone === zone
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {zone === 'all' ? 'All Zones (32)' : `${zone} Zone`}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filteredLawmakers.length}</span> lawmakers
        </div>
      </div>

      {/* Main Bar Graph List */}
      <div className="space-y-2.5 pt-2 max-h-[560px] overflow-y-auto pr-2">
        {filteredLawmakers.map((lawmaker, index) => {
          const rawValue = lawmaker[selectedMetric] as number;
          const percentage = Math.min(100, Math.max(4, (rawValue / activeConfig.max) * 100));
          const isHovered = hoveredId === lawmaker.id;

          const partyColor =
            lawmaker.party === 'PDP'
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : lawmaker.party === 'APC'
              ? 'text-blue-700 bg-blue-50 border-blue-200'
              : 'text-amber-700 bg-amber-50 border-amber-200';

          return (
            <div
              key={lawmaker.id}
              onClick={() => onSelectLawmaker(lawmaker)}
              onMouseEnter={() => setHoveredId(lawmaker.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`group cursor-pointer p-2.5 rounded-lg border transition-all ${
                isHovered
                  ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                  : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 text-right font-mono font-bold text-slate-400 group-hover:text-emerald-700">
                    #{index + 1}
                  </span>
                  <span className="font-semibold text-slate-900 truncate group-hover:text-emerald-900">
                    {lawmaker.name}
                  </span>
                  <span className="hidden sm:inline text-slate-500 text-[11px]">
                    · {lawmaker.constituency} ({lawmaker.zone})
                  </span>
                  <span className={`px-1.5 py-0.2 text-[10px] font-medium border rounded ${partyColor}`}>
                    {lawmaker.party}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">
                      {rawValue}
                      {activeConfig.unit === '%' ? '%' : ''}
                    </span>
                    {activeConfig.unit !== '%' && (
                      <span className="text-[11px] text-slate-500 ml-1">{activeConfig.unit}</span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden flex items-center">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedMetric === 'score'
                      ? rawValue >= 90
                        ? 'bg-emerald-600'
                        : rawValue >= 80
                        ? 'bg-emerald-500'
                        : rawValue >= 70
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                      : activeConfig.color
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Secondary Breakdown Line on Hover */}
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                <span>Attendance: <strong className="text-slate-700">{lawmaker.attendanceRate}%</strong></span>
                <span>·</span>
                <span>Motions Moved: <strong className="text-slate-700">{lawmaker.motionsMoved}</strong></span>
                <span>·</span>
                <span>Supported: <strong className="text-slate-700">{lawmaker.motionsSupported}</strong></span>
                <span>·</span>
                <span>Bills: <strong className="text-slate-700">{lawmaker.billsSponsored}</strong></span>
                <span>·</span>
                <span>Debates: <strong className="text-slate-700">{lawmaker.debateInterventions}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
