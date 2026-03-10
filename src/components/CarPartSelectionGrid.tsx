import React, { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { CarPartView } from '@/types/database';
import { cn, calculateHighestLevel, getRarityBackground, getRarityDisplay, getCollectionRarityDisplay } from '@/lib/utils';

// Helper function to get stat background color based on value position in range
const getStatBackgroundColor = (value: number, min: number, max: number, median: number, isPitStopTime = false): string => {
  if (value === 0) return '';

  if (isPitStopTime) {
    if (value === min) return 'bg-green-400';
    if (value === median) return 'bg-white';
    if (value === max) return 'bg-red-400';
    if (value < median) {
      const ratio = (value - min) / (median - min);
      if (ratio < 0.25) return 'bg-green-400';
      if (ratio < 0.5) return 'bg-green-300';
      if (ratio < 0.75) return 'bg-green-200';
      return 'bg-green-100';
    } else {
      const ratio = (value - median) / (max - median);
      if (ratio < 0.25) return 'bg-red-100';
      if (ratio < 0.5) return 'bg-red-200';
      if (ratio < 0.75) return 'bg-red-300';
      return 'bg-red-400';
    }
  }

  if (value === max) return 'bg-green-400';
  if (value === median) return 'bg-white';
  if (value === min) return 'bg-red-400';

  if (value < median) {
    const ratio = (value - min) / (median - min);
    if (ratio < 0.25) return 'bg-red-400';
    if (ratio < 0.5) return 'bg-red-300';
    if (ratio < 0.75) return 'bg-red-200';
    return 'bg-red-100';
  } else {
    const ratio = (value - median) / (max - median);
    if (ratio < 0.25) return 'bg-green-100';
    if (ratio < 0.5) return 'bg-green-200';
    if (ratio < 0.75) return 'bg-green-300';
    return 'bg-green-400';
  }
};

interface CarPartSelectionGridProps {
  /** All user car parts (will be filtered to partType internally) */
  parts: CarPartView[];
  /** The part type number to filter to (0=Gearbox,1=Brake,2=Engine,3=Suspension,4=FrontWing,5=RearWing) */
  partType: number;
  /** The currently selected part id */
  selectedPartId: string;
  /** Called when the user selects a part */
  onPartSelect: (partId: string) => void;
  /** Set of part ids that have bonus checked */
  bonusCheckedItems: Set<string>;
  /** Called when a bonus checkbox is toggled */
  onBonusToggle: (partId: string) => void;
  /** Global bonus % string */
  bonusPercentage: string;
  /** Initial max series filter value */
  initialMaxSeries?: number;
}

export function CarPartSelectionGrid({
  parts,
  partType,
  selectedPartId,
  onPartSelect,
  bonusCheckedItems,
  onBonusToggle,
  bonusPercentage,
  initialMaxSeries = 12,
}: CarPartSelectionGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [localMaxSeries, setLocalMaxSeries] = useState(initialMaxSeries);
  const [showHighestLevel, setShowHighestLevel] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter parts to the specific type
  const partsForType = useMemo(() => {
    return parts.filter(p => {
      const matchesType = p.car_part_type === partType;
      const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeries = p.series <= localMaxSeries;
      const notStarter = p.series > 0;
      return matchesType && matchesSearch && matchesSeries && notStarter;
    });
  }, [parts, partType, searchTerm, localMaxSeries]);

  // Helper to get a stat value for a given part at its effective level
  const getStatValue = useCallback((part: CarPartView, statName: string): number => {
    let userLevel = part.level || 0;
    if (userLevel === 0) return 0;

    if (showHighestLevel) {
      userLevel = calculateHighestLevel(userLevel, part.card_count || 0, part.rarity);
    }

    if (!part.stats_per_level || !Array.isArray(part.stats_per_level)) return 0;
    const stats = part.stats_per_level;
    if (stats.length < userLevel) return 0;

    let baseValue = stats[userLevel - 1][statName] || 0;

    const bonusPct = parseFloat(bonusPercentage) || 0;
    if (bonusCheckedItems.has(part.id) && bonusPct > 0) {
      if (statName === 'pitStopTime') {
        baseValue = Math.round((baseValue * (1 - bonusPct / 100)) * 100) / 100;
      } else {
        baseValue = Math.ceil(baseValue * (1 + bonusPct / 100));
      }
    }

    return baseValue;
  }, [showHighestLevel, bonusCheckedItems, bonusPercentage]);

  // Calculate column stats for color coding
  const columnStats = useMemo(() => {
    const statNames = ['speed', 'cornering', 'powerUnit', 'qualifying', 'drs', 'pitStopTime'];
    const result: Record<string, { min: number; max: number; median: number }> = {};

    statNames.forEach(statName => {
      const values: number[] = [];
      partsForType.forEach(part => {
        const v = getStatValue(part, statName);
        if (v > 0) values.push(v);
      });
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        const median = sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
        result[statName] = { min: sorted[0], max: sorted[sorted.length - 1], median };
      }
    });

    return result;
  }, [partsForType, getStatValue]);

  // Sorted parts
  const sortedParts = useMemo(() => {
    return [...partsForType].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortBy === 'rarity') {
        cmp = a.rarity - b.rarity;
      } else if (sortBy === 'level') {
        cmp = (a.level || 0) - (b.level || 0);
      } else if (sortBy === 'series') {
        cmp = a.series - b.series;
      } else {
        cmp = getStatValue(a, sortBy) - getStatValue(b, sortBy);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [partsForType, sortBy, sortOrder, getStatValue]);

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      // Default to desc for numeric stats, asc for text
      setSortOrder(['name', 'rarity', 'series', 'level'].includes(col) ? 'asc' : 'desc');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'rarity', label: 'Rarity' },
    { key: 'level', label: 'Level' },
    { key: 'bonus', label: 'Bonus', sortable: false },
    { key: 'speed', label: 'Speed' },
    { key: 'cornering', label: 'Cornering' },
    { key: 'powerUnit', label: 'Power Unit' },
    { key: 'qualifying', label: 'Qualifying' },
    { key: 'drs', label: 'DRS' },
    { key: 'pitStopTime', label: 'Pit Stop' },
    { key: 'series', label: 'Series' },
  ];

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 max-w-xs">
          <Input
            placeholder="Search parts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Max Series:</label>
          <select
            className="rounded-lg border-gray-300 text-sm px-3 py-2"
            value={localMaxSeries}
            onChange={(e) => setLocalMaxSeries(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={12 - i} value={12 - i}>{12 - i}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Highest Level:</label>
          <input
            type="checkbox"
            checked={showHighestLevel}
            onChange={(e) => setShowHighestLevel(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto bg-white rounded-lg border border-gray-200 w-fit max-h-[50vh]">
        <table className="table divide-y divide-gray-200">
          <thead className="bg-gray-700 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider',
                    col.sortable !== false ? 'cursor-pointer hover:bg-gray-600' : ''
                  )}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center">
                    {col.label}
                    {col.sortable !== false && sortBy === col.key && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedParts.map((part) => {
              const isSelected = part.id === selectedPartId;
              const speed = getStatValue(part, 'speed');
              const cornering = getStatValue(part, 'cornering');
              const powerUnit = getStatValue(part, 'powerUnit');
              const qualifying = getStatValue(part, 'qualifying');
              const drs = getStatValue(part, 'drs');
              const pitStopTime = getStatValue(part, 'pitStopTime');
              const effectiveLevel = showHighestLevel
                ? calculateHighestLevel(part.level || 0, part.card_count || 0, part.rarity)
                : (part.level || 0);

              return (
                <tr
                  key={part.id}
                  className={cn(
                    'hover:bg-gray-50 transition-colors cursor-pointer',
                    isSelected && 'bg-blue-50'
                  )}
                  onClick={() => onPartSelect(part.id === selectedPartId ? '' : part.id)}
                >
                  {/* Name */}
                  <td className={cn('px-3 py-1 whitespace-nowrap', getRarityBackground(part.rarity))}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => onPartSelect(part.id === selectedPartId ? '' : part.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-900">{part.name}</span>
                    </div>
                  </td>
                  {/* Rarity */}
                  <td className={cn('px-3 py-1 whitespace-nowrap', getRarityBackground(part.rarity))}>
                    <span className="text-sm font-medium text-gray-900">
                      {part.rarity === 5
                        ? getCollectionRarityDisplay(part.collection_theme ?? null, part.collection_sub_name ?? null)
                        : getRarityDisplay(part.rarity)}
                    </span>
                  </td>
                  {/* Level */}
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <span className={cn(
                      'text-sm text-gray-900',
                      showHighestLevel && calculateHighestLevel(part.level || 0, part.card_count || 0, part.rarity) > (part.level || 0) ? 'text-red-600' : ''
                    )}>
                      {effectiveLevel}
                    </span>
                  </td>
                  {/* Bonus */}
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    {(part.level || 0) > 0 && (
                      <input
                        type="checkbox"
                        checked={bonusCheckedItems.has(part.id)}
                        onChange={(e) => { e.stopPropagation(); onBonusToggle(part.id); }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    )}
                  </td>
                  {/* Stats */}
                  <td className={cn('px-3 py-1 whitespace-nowrap text-center', columnStats['speed'] && getStatBackgroundColor(speed, columnStats['speed'].min, columnStats['speed'].max, columnStats['speed'].median))}>
                    <span className="text-sm text-gray-900">{speed || ''}</span>
                  </td>
                  <td className={cn('px-3 py-1 whitespace-nowrap text-center', columnStats['cornering'] && getStatBackgroundColor(cornering, columnStats['cornering'].min, columnStats['cornering'].max, columnStats['cornering'].median))}>
                    <span className="text-sm text-gray-900">{cornering || ''}</span>
                  </td>
                  <td className={cn('px-3 py-1 whitespace-nowrap text-center', columnStats['powerUnit'] && getStatBackgroundColor(powerUnit, columnStats['powerUnit'].min, columnStats['powerUnit'].max, columnStats['powerUnit'].median))}>
                    <span className="text-sm text-gray-900">{powerUnit || ''}</span>
                  </td>
                  <td className={cn('px-3 py-1 whitespace-nowrap text-center', columnStats['qualifying'] && getStatBackgroundColor(qualifying, columnStats['qualifying'].min, columnStats['qualifying'].max, columnStats['qualifying'].median))}>
                    <span className="text-sm text-gray-900">{qualifying || ''}</span>
                  </td>
                  <td className={cn('px-3 py-1 whitespace-nowrap text-center', columnStats['drs'] && getStatBackgroundColor(drs, columnStats['drs'].min, columnStats['drs'].max, columnStats['drs'].median))}>
                    <span className="text-sm text-gray-900">{drs || ''}</span>
                  </td>
                  <td className={cn('px-3 py-1 whitespace-nowrap text-center', columnStats['pitStopTime'] && getStatBackgroundColor(pitStopTime, columnStats['pitStopTime'].min, columnStats['pitStopTime'].max, columnStats['pitStopTime'].median, true))}>
                    <span className="text-sm text-gray-900">{pitStopTime > 0 ? pitStopTime.toFixed(2) : ''}</span>
                  </td>
                  {/* Series */}
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-900">{part.series}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedParts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No parts found</div>
            <div className="text-gray-400 text-sm">Try adjusting your search or filter criteria</div>
          </div>
        )}
      </div>
    </div>
  );
}
