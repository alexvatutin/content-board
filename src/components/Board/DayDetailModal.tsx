import { Plus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { formatDayFull } from '../../utils/dateUtils';
import { PLATFORM_CONFIG, STATUS_CONFIG } from '../../utils/constants';
import type { Post } from '../../types';

interface DayDetailModalProps {
  isOpen: boolean;
  date: Date | null;
  dateStr: string;
  posts: Post[];
  onClose: () => void;
  onPostClick: (post: Post) => void;
  onAddPost: (date: string) => void;
}

export function DayDetailModal({ isOpen, date, dateStr, posts, onClose, onPostClick, onAddPost }: DayDetailModalProps) {
  const sorted = [...posts].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  const title = date ? formatDayFull(date) : '';
  // Capitalize first letter
  const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={capitalizedTitle} wide>
      <div className="space-y-2">
        {sorted.length === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <p className="text-sm">Нет запланированных постов</p>
          </div>
        )}

        {sorted.map((post) => {
          const platform = PLATFORM_CONFIG[post.platform];
          const status = STATUS_CONFIG[post.status];
          return (
            <div
              key={post.id}
              onClick={() => {
                onClose();
                onPostClick(post);
              }}
              className="relative flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors overflow-hidden"
            >
              {/* Platform color bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                style={{ backgroundColor: platform.color }}
              />

              {/* Platform badge */}
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded flex-shrink-0 ml-2"
                style={{ color: platform.color, backgroundColor: platform.bg }}
              >
                {platform.label}
              </span>

              {/* Time */}
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium flex-shrink-0 w-12">
                {post.scheduledTime}
              </span>

              {/* Title */}
              <span className="text-sm text-gray-900 dark:text-gray-100 font-medium truncate flex-1">
                {post.title || 'Без заголовка'}
              </span>

              {/* Status */}
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ color: status.color, backgroundColor: status.bg }}
              >
                {status.emoji} {status.label}
              </span>
            </div>
          );
        })}

        {/* Add post button */}
        <button
          onClick={() => {
            onClose();
            onAddPost(dateStr);
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
        >
          <Plus size={16} />
          Добавить пост
        </button>
      </div>
    </Modal>
  );
}
