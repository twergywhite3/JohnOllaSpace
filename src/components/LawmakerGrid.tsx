import React, { useState, useMemo } from 'react';
import { Lawmaker, GeopoliticalZone, PoliticalParty } from '../types.ts';
import { LawmakerCard } from './LawmakerCard.tsx';
import { Search, SlidersHorizontal, Users, ArrowUpDown } from 'lucide-react';

interface LawmakerGridProps {
  lawmakers: Lawmaker[];
  onSelectLawmaker: (lawmaker: Lawmaker) => void;
  onOpenFeedback: (lawmaker: Lawmaker) => void;
}

type SortField = 'score' | 'attendance' | 'motionsMoved' | 'bills' | 'name';

export const LawmakerGrid: React.FC<LawmakerGridProps> = ({ lawmakers, onSelectLawmaker, onOpenFeedback }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [partyFilter, setPartyFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('score');

  const filteredAndSorted = useMemo(() => {
    let result = [...lawmakers];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (lm) =>
          lm.name.toLowerCase().includes(q) ||
          lm.constituency.toLowerCase().includes(q) ||
          lm.lga.toLowerCase().includes(q) ||
          lm.role.toLowerCase().includes(q)
      );
    }

    // Zone filter
    if (zoneFilter !== 'all') {
      result = result.filter((lm) => lm.zone === zoneFilter);
    }

    // Party filter
    if (partyFilter !== 'all') {
      result = result.filter((lm) => lm.party === partyFilter);
    }

    // Gender filter
    if (genderFilter !== 'all') {
      result = result.filter((lm) => lm.gender === genderFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'attendance') return b.attendanceRate - a.attendanceRate;
      if (sortBy === 'motionsMoved') return b.motionsMoved - a.motionsMoved;
      if (sortBy === 'bills') return b.billsSponsored - a.billsSponsored;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [lawmakers, searchQuery, zoneFilter, partyFilter, genderFilter, sortBy]);

  // Overall ranking lookup map
  const rankMap = useMemo(() => {
    const sortedAll = [...lawmakers].sort((a, b) => b.score - a.score);
    const map = new Map<string, number>();
    sortedAll.forEach((lm, index) => {
      map.set(lm.id, index + 1);
    });
    return map;
  }, [lawmakers]);

  return (
    <div className="space-y-6">
      {/* Control Bar: Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by lawmaker name, constituency (e.g. Ibadan, Saki, Ibarapa)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 shrink-0">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="score">Composite Score (Highest First)</option>
              <option value="attendance">Attendance Rate (%)</option>
              <option value="motionsMoved">Motions Moved</option>
              <option value="bills">Bills Sponsored</option>
              <option value="name">Alphabetical (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills / Tabs */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Geopolitical Zones */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Zone:</span>
            {['all', 'Ibadan', 'Oyo', 'Ogbomoso', 'Oke-Ogun', 'Ibarapa'].map((zone) => (
              <button
                key={zone}
                type="button"
                onClick={() => setZoneFilter(zone)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  zoneFilter === zone
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {zone === 'all' ? 'All (32)' : zone}
              </button>
            ))}
          </div>

          {/* Party and Gender */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-medium mr-1">Party:</span>
              {['all', 'PDP', 'APC'].map((party) => (
                <button
                  key={party}
                  type="button"
                  onClick={() => setPartyFilter(party)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    partyFilter === party
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {party.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-medium mr-1">Gender:</span>
              {['all', 'Male', 'Female'].map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setGenderFilter(gender)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    genderFilter === gender
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-bold text-slate-900">{filteredAndSorted.length}</span> of{' '}
          <span className="font-semibold text-slate-700">{lawmakers.length}</span> Assembly Members
        </div>
        {(searchQuery || zoneFilter !== 'all' || partyFilter !== 'all' || genderFilter !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setZoneFilter('all');
              setPartyFilter('all');
              setGenderFilter('all');
            }}
            className="text-emerald-700 hover:underline font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Grid of Lawmakers */}
      {filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSorted.map((lawmaker) => (
            <LawmakerCard
              key={lawmaker.id}
              lawmaker={lawmaker}
              rank={rankMap.get(lawmaker.id) || 1}
              onSelect={onSelectLawmaker}
              onOpenFeedback={onOpenFeedback}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-base font-semibold text-slate-700">No lawmakers match your criteria</h4>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query, geopolitical zone, or party filter.
          </p>
        </div>
      )}
    </div>
  );
};
