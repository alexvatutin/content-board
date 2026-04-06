import { Filter, X } from 'lucide-react';
import type { Filters, SocialPlatform, PostStatus, ViewMode } from '../../types';
import { PLATFORM_CONFIG, STATUS_CONFIG, PLATFORMS, STATUSES } from '../../utils/constants';
import { DateRangeFilter } from './DateRangeFilter';

interface FilterBarProps {
  filters: Filters;
  view: ViewMode;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onDateRangeChange: (from: string | null, to: string | null) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  allTags: string[];
}

export function FilterBar({ filters, view, onFilterChange, onDateRangeChange, onReset, hasActiveFilters, allTags }: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0">
      <Filter size={14} className="text-gray-500 dark:text-gray-400" />

      {view === 'list' && (
        <DateRangeFilter
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onDateRangeChange={onDateRangeChange}
        />
      )}

      <select
        value={filters.platform}
        onChange={(e) => onFilterChange('platform', e.target.value as SocialPlatform | 'all')}
        className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-300"
      >
        <option value="all">Все соцсети</option>
        {PLATFORMS.map((p) => (
          <option key={p} value={p}>{PLATFORM_CONFIG[p].label}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => onFilterChange('status', e.target.value as PostStatus | 'all')}
        className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-300"
      >
        <option value="all">Все статусы</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}</option>
        ))}
      </select>

      <select
        value={filters.tag}
        onChange={(e) => onFilterChange('tag', e.target.value)}
        className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-300"
      >
        <option value="all">Все теги</option>
        {allTags.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <X size={12} /> Сбросить
        </button>
      )}
    </div>
  );
}
