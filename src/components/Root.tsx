import { useState, useEffect, useRef, useCallback } from 'react';
import App from '../App';
import { AuthPage } from './Auth/AuthPage';
import { useAuth } from '../contexts/AuthContext';
import { needsMigration, migrateToSupabase, type MigrationProgress } from '../utils/migration';

export function Root() {
  const { user, loading } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);
  const migrationStarted = useRef(false);

  const runMigration = useCallback((userId: string) => {
    if (migrationStarted.current) return;
    migrationStarted.current = true;
    setMigrating(true);
    migrateToSupabase(userId, setMigrationProgress)
      .catch((err) => console.error('Migration failed:', err))
      .finally(() => setMigrating(false));
  }, []);

  useEffect(() => {
    if (user && needsMigration()) {
      // One-time migration from localStorage to Supabase on first login
      // eslint-disable-next-line react-hooks/set-state-in-effect
      runMigration(user.id);
    }
  }, [user, runMigration]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400 text-sm">Загрузка...</div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  if (migrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            Перенос данных в облако...
          </div>
          {migrationProgress && migrationProgress.phase !== 'done' && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {migrationProgress.phase === 'posts' ? 'Посты' : 'Изображения'}
              : {migrationProgress.current} / {migrationProgress.total}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <App />;
}
