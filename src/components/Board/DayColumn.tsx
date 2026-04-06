import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Post } from '../../types';
import { PostCard } from './PostCard';
import { formatDayShort, isToday } from '../../utils/dateUtils';

interface DayColumnProps {
  date: Date;
  dateStr: string;
  posts: Post[];
  onPostClick: (post: Post) => void;
  onAddPost: (date: string) => void;
  imageCounts: Map<string, number>;
}

export function DayColumn({ date, dateStr, posts, onPostClick, onAddPost, imageCounts }: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: dateStr });
  const today = isToday(date);

  const sorted = [...posts].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  return (
    <div
      className={`min-w-0 flex flex-col rounded-xl transition-colors ${
        isOver
          ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400'
          : 'bg-gray-50 dark:bg-gray-900/50'
      }`}
    >
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-t-xl border-b ${
          today
            ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800'
            : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <span
          className={`text-sm font-semibold capitalize ${
            today ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {formatDayShort(date)}
        </span>
        <button
          onClick={() => onAddPost(dateStr)}
          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          title="Добавить пост"
        >
          <Plus size={16} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="p-2 space-y-2 min-h-[120px]"
      >
        <SortableContext items={sorted.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {sorted.map((post) => (
            <PostCard key={post.id} post={post} onClick={() => onPostClick(post)} imageCount={imageCounts.get(post.id)} />
          ))}
        </SortableContext>

        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600 py-6">
            <p className="text-xs">Нет постов</p>
          </div>
        )}
      </div>
    </div>
  );
}
