import React from 'react';
import { Lawmaker, GeopoliticalZone } from '../../types.ts';
import { MapPin, Users, FileText, CheckCircle2 } from 'lucide-react';

interface ZoneComparisonChartProps {
  lawmakers: Lawmaker[];
  onSelectZoneFilter?: (zone: GeopoliticalZone) => void;
}

export const ZoneComparisonChart: React.FC<ZoneComparisonChartProps> = ({ lawmakers }) => {
  const zones: GeopoliticalZone[] = ['Ibadan', 'Oke-Ogun', 'Ogbomoso', 'Oyo', 'Ibarapa'];

  const zoneStats = zones.map((zone) => {
    const list = lawmakers.filter((lm) => lm.zone === zone);
    const count = list.length;
    const avgAttendance = count > 0 ? Math.round(list.reduce((acc, l) => acc + l.attendanceRate, 0) / count) : 0;
    const totalMotions = list.reduce((acc, l) => acc + l.motionsMoved, 0);
    const totalBills = list.reduce((acc, l) => acc + l.billsSponsored, 0);
    const avgScore = count > 0 ? Number((list.reduce((acc, l) => acc + l.score, 0) / count).toFixed(1)) : 0;

    return {
      zone,
      count,
      avgAttendance,
      totalMotions,
      totalBills,
      avgScore,
    };
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Geopolitical Distribution</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">Zonal Legislative Performance Comparison</h3>
        </div>
        <span className="text-xs text-slate-500">5 Zones · 32 Seats</span>
      </div>

      <p className="text-xs text-slate-500 my-3">
        Comparative benchmark across the five administrative and electoral zones of Oyo State.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-2">
        {zoneStats.map((stat) => (
          <div
            key={stat.zone}
            className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg hover:border-emerald-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">{stat.zone}</span>
              <span className="text-xs font-mono font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {stat.count} seats
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-500 text-[11px] mb-1">
                  <span>Avg. Attendance</span>
                  <span className="font-semibold text-slate-800">{stat.avgAttendance}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${stat.avgAttendance}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-500 text-[11px] mb-1">
                  <span>Zonal Score Index</span>
                  <span className="font-bold text-emerald-700">{stat.avgScore}/100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${stat.avgScore}%` }} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Motions: <strong className="text-slate-800">{stat.totalMotions}</strong></span>
                <span>Bills: <strong className="text-slate-800">{stat.totalBills}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
