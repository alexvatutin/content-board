import { LayoutDashboard, LayoutGrid, List, BarChart3, Smartphone, Download, Upload, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { ViewMode } from '../../types';

interface SidebarProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onExport: () => void;
  onImport: () => void;
  dark: boolean;
  onToggleTheme: () => void;
}

const NAV_ITEMS: { key: ViewMode; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Обзор', icon: LayoutDashboard },
  { key: 'board', label: 'Доска', icon: LayoutGrid },
  { key: 'list', label: 'Список', icon: List },
  { key: 'analytics', label: 'Аналитика', icon: BarChart3 },
  { key: 'preview', label: 'Превью', icon: Smartphone },
];

export function Sidebar({ view, onViewChange, onExport, onImport, dark, onToggleTheme }: SidebarProps) {
  const { user, signOut } = useAuth();

  return (
    <aside className="w-52 h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          Content Board
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 p-2 mt-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              onClick={() => onViewChange(key)}
              className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                active
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium border-l-2 border-blue-500 pl-[10px]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-transparent pl-[10px]'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Utilities */}
      <div className="flex flex-col gap-0.5 p-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onExport}
          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <Download size={15} /> Экспорт
        </button>
        <button
          onClick={onImport}
          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <Upload size={15} /> Импорт
        </button>
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
          title={dark ? 'Светлая тема' : 'Тёмная тема'}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
          {dark ? 'Светлая тема' : 'Тёмная тема'}
        </button>
      </div>

      {/* User & Logout */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        {user && (
          <div className="px-3 py-1 mb-1 text-xs text-gray-500 dark:text-gray-400 truncate" title={user.email}>
            {user.email}
          </div>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors w-full"
        >
          <LogOut size={15} /> Выход
        </button>
      </div>
    </aside>
  );
}
