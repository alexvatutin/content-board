import { LayoutGrid, List, BarChart3, Download, Upload, Sun, Moon } from 'lucide-react';
import type { ViewMode } from '../../types';

interface HeaderProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onExport: () => void;
  onImport: () => void;
  dark: boolean;
  onToggleTheme: () => void;
}

export function Header({ view, onViewChange, onExport, onImport, dark, onToggleTheme }: HeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          Content Board
        </h1>

        <div className="flex items-center gap-0.5 ml-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
          <button
            onClick={() => onViewChange('board')}
            className={`flex items-center gap-1 px-2.5 py-1 text-sm rounded-md transition-colors ${
              view === 'board'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid size={14} /> Доска
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`flex items-center gap-1 px-2.5 py-1 text-sm rounded-md transition-colors ${
              view === 'list'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <List size={14} /> Список
          </button>
          <button
            onClick={() => onViewChange('analytics')}
            className={`flex items-center gap-1 px-2.5 py-1 text-sm rounded-md transition-colors ${
              view === 'analytics'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 size={14} /> Аналитика
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onExport}
          className="flex items-center gap-1 px-2.5 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Экспорт"
        >
          <Download size={14} /> Экспорт
        </button>
        <button
          onClick={onImport}
          className="flex items-center gap-1 px-2.5 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Импорт"
        >
          <Upload size={14} /> Импорт
        </button>
        <button
          onClick={onToggleTheme}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title={dark ? 'Светлая тема' : 'Тёмная тема'}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
