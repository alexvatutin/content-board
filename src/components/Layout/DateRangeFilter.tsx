import { useState, useRef, useEffect, useMemo } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { getDatePresets, formatDateRange } from '../../utils/dateUtils';

interface DateRangeFilterProps {
  dateFrom: string | null;
  dateTo: string | null;
  onDateRangeChange: (from: string | null, to: string | null) => void;
}

export function DateRangeFilter({ dateFrom, dateTo, onDateRangeChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { future, past } = useMemo(() => getDatePresets(), []);
  const isActive = dateFrom !== null || dateTo !== null;
  const label = formatDateRange(dateFrom, dateTo);

  // Sync custom inputs when popover opens
  useEffect(() => {
    if (isOpen) {
      setCustomFrom(dateFrom ?? '');
      setCustomTo(dateTo ?? '');
    }
  }, [isOpen, dateFrom, dateTo]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  function selectPreset(from: string, to: string) {
    onDateRangeChange(from, to);
    setIsOpen(false);
  }

  function applyCustom() {
    onDateRangeChange(customFrom || null, customTo || null);
    setIsOpen(false);
  }

  function clearDates() {
    onDateRangeChange(null, null);
    setIsOpen(false);
  }

  // Check if a preset matches the current selection
  function isPresetActive(from: string, to: string): boolean {
    return dateFrom === from && dateTo === to;
  }

  return (
    <div ref={wrapperRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 text-sm border rounded-lg transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
        }`}
      >
        <CalendarDays size={14} />
        <span className="whitespace-nowrap">{label}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl animate-fade-in min-w-[400px]">
          {/* Presets */}
          <div className="grid grid-cols-2 gap-0 p-3">
            {/* Future column */}
            <div className="pr-3 border-r border-gray-200 dark:border-gray-700">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 px-2 pb-1.5">
                Вперёд
              </div>
              {future.map((preset) => {
                const { from, to } = preset.getRange();
                const active = isPresetActive(from, to);
                return (
                  <button
                    key={preset.label}
                    onClick={() => selectPreset(from, to)}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded-lg transition-colors ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Past column */}
            <div className="pl-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 px-2 pb-1.5">
                Назад
              </div>
              {past.map((preset) => {
                const { from, to } = preset.getRange();
                const active = isPresetActive(from, to);
                return (
                  <button
                    key={preset.label}
                    onClick={() => selectPreset(from, to)}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded-lg transition-colors ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom range */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 pb-2">
              Произвольный период
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={applyCustom}
                disabled={!customFrom && !customTo}
                className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Применить
              </button>
              {isActive && (
                <button
                  onClick={clearDates}
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Сбросить
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
