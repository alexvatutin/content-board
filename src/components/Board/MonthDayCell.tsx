import { useDroppable } from '@dnd-kit/core';
import { isToday } from '../../utils/dateUtils';
import { PLATFORM_CONFIG } from '../../utils/constants';
import { format } from 'date-fns';
import type { Post } from '../../types';

const MAX_DOTS = 5;

interface MonthDayCellProps {
  date: Date;
  dateStr: string;
  posts: Post[];
  isOtherMonth: boolean;
  onClick: (dateStr: string, date: Date) => void;
}

export function MonthDayCell({ date, dateStr, posts, isOtherMonth, onClick }: MonthDayCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: dateStr });
  const today = isToday(date);
  const count = posts.length;
  const sorted = [...posts].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  const dots = sorted.slice(0, MAX_DOTS);
  const extraDots = count - MAX_DOTS;

  return (
    <div
      ref={setNodeRef}
      onClick={() => onClick(dateStr, date)}
      className={`flex flex-col rounded-lg cursor-pointer transition-all h-full select-none ${
        isOtherMonth ? 'opacity-35' : ''
      } ${
        isOver
          ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400'
          : 'bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 pt-1.5 pb-1">
        <span
          className={`text-xs font-semibold leading-none ${
            today
              ? 'bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {format(date, 'd')}
        </span>
        {count > 0 && (
          <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-full px-1.5 py-0.5 leading-none">
            {count}
          </span>
        )}
      </div>

      {/* Platform dots */}
      {count > 0 && (
        <div className="flex items-center gap-0.5 px-2 pb-1.5 flex-wrap">
          {dots.map((post) => (
            <div
              key={post.id}
              className="w-[6px] h-[6px] rounded-full flex-shrink-0"
              style={{ backgroundColor: PLATFORM_CONFIG[post.platform].color }}
              title={`${post.scheduledTime} ${post.title || 'Без заголовка'}`}
            />
          ))}
          {extraDots > 0 && (
            <span className="text-[8px] text-gray-400 dark:text-gray-500 leading-none ml-0.5">
              +{extraDots}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
