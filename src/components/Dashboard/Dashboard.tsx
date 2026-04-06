import { useMemo } from 'react';
import { CalendarClock, Link2Off, TrendingUp, Eye, Heart, Send } from 'lucide-react';
import { subDays } from 'date-fns';
import type { Post } from '../../types';
import { PLATFORM_CONFIG, STATUS_CONFIG } from '../../utils/constants';
import { toISODate, formatDayFull, fromISODate } from '../../utils/dateUtils';

interface DashboardProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
}

export function Dashboard({ posts, onPostClick }: DashboardProps) {
  const today = toISODate(new Date());
  const weekAgo = toISODate(subDays(new Date(), 6));

  // Posts scheduled for today that aren't published/cancelled
  const todayPosts = useMemo(() => {
    return posts
      .filter(p => p.scheduledDate === today && p.status !== 'published' && p.status !== 'cancelled')
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [posts, today]);

  // Published posts missing a URL
  const missingUrlPosts = useMemo(() => {
    return posts.filter(p => p.status === 'published' && !p.publishedUrl);
  }, [posts]);

  // Last 7 days summary
  const weekSummary = useMemo(() => {
    const weekPosts = posts.filter(p => p.scheduledDate >= weekAgo && p.scheduledDate <= today);
    return {
      total: weekPosts.length,
      published: weekPosts.filter(p => p.status === 'published').length,
      totalReach: weekPosts.reduce((sum, p) => sum + (p.metrics?.reach || 0), 0),
      totalLikes: weekPosts.reduce((sum, p) => sum + (p.metrics?.likes || 0), 0),
    };
  }, [posts, weekAgo, today]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Обзор</h2>

      {/* Week summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={<Send size={18} />} label="Постов за неделю" value={weekSummary.total} color="text-blue-500" />
        <SummaryCard icon={<TrendingUp size={18} />} label="Опубликовано" value={weekSummary.published} color="text-green-500" />
        <SummaryCard icon={<Eye size={18} />} label="Суммарный охват" value={weekSummary.totalReach} color="text-purple-500" />
        <SummaryCard icon={<Heart size={18} />} label="Суммарные лайки" value={weekSummary.totalLikes} color="text-pink-500" />
      </div>

      {/* Today's posts */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <CalendarClock size={16} className="text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Посты на сегодня</h3>
          {todayPosts.length > 0 && (
            <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
              {todayPosts.length}
            </span>
          )}
        </div>
        {todayPosts.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
            Нет постов на сегодня
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {todayPosts.map(post => (
              <PostRow key={post.id} post={post} onClick={() => onPostClick(post)} />
            ))}
          </div>
        )}
      </section>

      {/* Missing URL */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Link2Off size={16} className="text-amber-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Нужна ссылка на публикацию</h3>
          {missingUrlPosts.length > 0 && (
            <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
              {missingUrlPosts.length}
            </span>
          )}
        </div>
        {missingUrlPosts.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
            Все ссылки на месте
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {missingUrlPosts.map(post => (
              <PostRow key={post.id} post={post} onClick={() => onPostClick(post)} showDate />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Sub-components ──────────────────────────

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className={`${color} mb-2`}>{icon}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

function PostRow({ post, onClick, showDate }: { post: Post; onClick: () => void; showDate?: boolean }) {
  const platformCfg = PLATFORM_CONFIG[post.platform];
  const statusCfg = STATUS_CONFIG[post.status];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: platformCfg.color }} />
      <span
        className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
        style={{ color: platformCfg.color, backgroundColor: platformCfg.bg }}
      >
        {platformCfg.label}
      </span>
      {showDate ? (
        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 w-24">
          {formatDayFull(fromISODate(post.scheduledDate))}
        </span>
      ) : (
        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 w-12">
          {post.scheduledTime || '—'}
        </span>
      )}
      <span className="text-sm text-gray-900 dark:text-white truncate flex-1">
        {post.title || 'Без заголовка'}
      </span>
      <span
        className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
        style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}
      >
        {statusCfg.emoji} {statusCfg.label}
      </span>
    </button>
  );
}
