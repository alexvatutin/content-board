import { useMemo } from 'react';
import type { Post } from '../../types';
import { PLATFORM_CONFIG, STATUS_CONFIG, PLATFORMS, STATUSES } from '../../utils/constants';

interface AnalyticsProps {
  posts: Post[];
}

export function Analytics({ posts }: AnalyticsProps) {
  const stats = useMemo(() => {
    const byPlatform: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const reachByPlatform: Record<string, { total: number; count: number }> = {};
    const byDate: Record<string, number> = {};

    posts.forEach((post) => {
      byPlatform[post.platform] = (byPlatform[post.platform] || 0) + 1;
      byStatus[post.status] = (byStatus[post.status] || 0) + 1;

      if (post.scheduledDate) {
        byDate[post.scheduledDate] = (byDate[post.scheduledDate] || 0) + 1;
      }

      if (post.metrics?.reach) {
        if (!reachByPlatform[post.platform]) {
          reachByPlatform[post.platform] = { total: 0, count: 0 };
        }
        reachByPlatform[post.platform].total += post.metrics.reach;
        reachByPlatform[post.platform].count += 1;
      }
    });

    return { byPlatform, byStatus, reachByPlatform, byDate };
  }, [posts]);

  const maxPlatformCount = Math.max(...Object.values(stats.byPlatform), 1);
  const maxStatusCount = Math.max(...Object.values(stats.byStatus), 1);

  // Calendar heatmap - last 90 days
  const heatmapDays = useMemo(() => {
    const days: { date: string; count: number; dayOfWeek: number }[] = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({
        date: dateStr,
        count: stats.byDate[dateStr] || 0,
        dayOfWeek: d.getDay(),
      });
    }
    return days;
  }, [stats.byDate]);

  const maxHeat = Math.max(...heatmapDays.map((d) => d.count), 1);

  function heatColor(count: number): string {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    const intensity = count / maxHeat;
    if (intensity <= 0.25) return 'bg-blue-200 dark:bg-blue-900';
    if (intensity <= 0.5) return 'bg-blue-300 dark:bg-blue-700';
    if (intensity <= 0.75) return 'bg-blue-500 dark:bg-blue-500';
    return 'bg-blue-700 dark:bg-blue-400';
  }

  if (posts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
        <p>Нет данных для аналитики. Создайте первый пост!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Аналитика</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Posts by platform */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Посты по соцсетям</h3>
          <div className="space-y-2.5">
            {PLATFORMS.filter((p) => stats.byPlatform[p]).map((p) => (
              <div key={p} className="flex items-center gap-3">
                <span
                  className="text-xs font-semibold w-24 text-right px-2 py-0.5 rounded"
                  style={{ color: PLATFORM_CONFIG[p].color }}
                >
                  {PLATFORM_CONFIG[p].label}
                </span>
                <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(stats.byPlatform[p] / maxPlatformCount) * 100}%`,
                      backgroundColor: PLATFORM_CONFIG[p].color,
                      opacity: 0.8,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8 text-right">
                  {stats.byPlatform[p]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts by status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Посты по статусам</h3>
          <div className="space-y-2.5">
            {STATUSES.filter((s) => stats.byStatus[s]).map((s) => (
              <div key={s} className="flex items-center gap-3">
                <span
                  className="text-xs font-medium w-32 text-right"
                  style={{ color: STATUS_CONFIG[s].color }}
                >
                  {STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}
                </span>
                <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(stats.byStatus[s] / maxStatusCount) * 100}%`,
                      backgroundColor: STATUS_CONFIG[s].color,
                      opacity: 0.7,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8 text-right">
                  {stats.byStatus[s]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Average reach */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Средний охват по соцсетям</h3>
          {Object.keys(stats.reachByPlatform).length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">Нет данных об охвате</p>
          ) : (
            <div className="space-y-3">
              {PLATFORMS.filter((p) => stats.reachByPlatform[p]).map((p) => {
                const { total, count } = stats.reachByPlatform[p];
                const avg = Math.round(total / count);
                return (
                  <div key={p} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: PLATFORM_CONFIG[p].color }}>
                      {PLATFORM_CONFIG[p].label}
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {avg.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Активность (90 дней)</h3>
          <div className="flex flex-wrap gap-1">
            {heatmapDays.map((day) => (
              <div
                key={day.date}
                className={`w-3 h-3 rounded-sm ${heatColor(day.count)}`}
                title={`${day.date}: ${day.count} постов`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-gray-500">
            <span>Меньше</span>
            <div className="flex gap-0.5">
              <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
              <div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-900" />
              <div className="w-3 h-3 rounded-sm bg-blue-300 dark:bg-blue-700" />
              <div className="w-3 h-3 rounded-sm bg-blue-500 dark:bg-blue-500" />
              <div className="w-3 h-3 rounded-sm bg-blue-700 dark:bg-blue-400" />
            </div>
            <span>Больше</span>
          </div>
        </div>
      </div>

      {/* Summary numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{posts.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Всего постов</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.byStatus['published'] || 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Опубликовано</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-500">{stats.byStatus['draft'] || 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Черновиков</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{Object.keys(stats.byPlatform).length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Платформ</div>
        </div>
      </div>
    </div>
  );
}
