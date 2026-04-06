import { useState } from 'react';
import { ArrowUpDown, ExternalLink, ImageIcon } from 'lucide-react';
import type { Post } from '../../types';
import { PLATFORM_CONFIG, STATUS_CONFIG } from '../../utils/constants';
import { formatDayFull, fromISODate } from '../../utils/dateUtils';
import { usePostImageCounts } from '../../hooks/usePostImageCounts';

interface ListViewProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
}

type SortKey = 'scheduledDate' | 'platform' | 'title' | 'status';

export function ListView({ posts, onPostClick }: ListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('scheduledDate');
  const [sortAsc, setSortAsc] = useState(true);
  const imageCounts = usePostImageCounts();

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const sorted = [...posts].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'scheduledDate':
        cmp = `${a.scheduledDate}T${a.scheduledTime}`.localeCompare(`${b.scheduledDate}T${b.scheduledTime}`);
        break;
      case 'platform':
        cmp = a.platform.localeCompare(b.platform);
        break;
      case 'title':
        cmp = a.title.localeCompare(b.title);
        break;
      case 'status':
        cmp = a.status.localeCompare(b.status);
        break;
    }
    return sortAsc ? cmp : -cmp;
  });

  function SortHeader({ label, field }: { label: string; field: SortKey }) {
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        {label}
        <ArrowUpDown size={12} className={sortKey === field ? 'text-blue-500' : 'opacity-30'} />
      </button>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
        <p>Нет постов для отображения</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-2 px-3"><SortHeader label="Дата" field="scheduledDate" /></th>
            <th className="text-left py-2 px-3 w-16">Время</th>
            <th className="text-left py-2 px-3"><SortHeader label="Соцсеть" field="platform" /></th>
            <th className="text-left py-2 px-3"><SortHeader label="Заголовок" field="title" /></th>
            <th className="text-left py-2 px-3"><SortHeader label="Статус" field="status" /></th>
            <th className="text-left py-2 px-3 w-14">Фото</th>
            <th className="text-left py-2 px-3">Охват</th>
            <th className="text-left py-2 px-3 w-16">Ссылка</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((post) => {
            const platform = PLATFORM_CONFIG[post.platform];
            const status = STATUS_CONFIG[post.status];
            return (
              <tr
                key={post.id}
                onClick={() => onPostClick(post)}
                className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {post.scheduledDate ? formatDayFull(fromISODate(post.scheduledDate)) : '—'}
                </td>
                <td className="py-2.5 px-3 text-gray-600 dark:text-gray-400">
                  {post.scheduledTime || '—'}
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ color: platform.color, backgroundColor: platform.bg }}
                  >
                    {platform.label}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-gray-900 dark:text-gray-100 font-medium max-w-xs truncate">
                  {post.title || 'Без заголовка'}
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ color: status.color, backgroundColor: status.bg }}
                  >
                    {status.emoji} {status.label}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-gray-500 dark:text-gray-400">
                  {(imageCounts.get(post.id) || 0) > 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-xs">
                      <ImageIcon size={12} /> {imageCounts.get(post.id)}
                    </span>
                  ) : '—'}
                </td>
                <td className="py-2.5 px-3 text-gray-600 dark:text-gray-400">
                  {post.metrics?.reach?.toLocaleString() ?? '—'}
                </td>
                <td className="py-2.5 px-3">
                  {post.publishedUrl && (
                    <a
                      href={post.publishedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
