import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { Post, DateRange } from '../../types';
import { usePostImageCounts } from '../../hooks/usePostImageCounts';
import { DayColumn } from './DayColumn';
import { PostCard } from './PostCard';
import { MonthDayCell } from './MonthDayCell';
import { DayDetailModal } from './DayDetailModal';
import { getWeekDays, toISODate, navigateWeek, navigateMonth, formatWeekRange } from '../../utils/dateUtils';
import { startOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

interface BoardViewProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onAddPost: (date: string) => void;
  onMovePost: (id: string, newDate: string) => void;
}

const WEEKDAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function BoardView({ posts, onPostClick, onAddPost, onMovePost }: BoardViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [selectedDay, setSelectedDay] = useState<{ date: Date; dateStr: string } | null>(null);
  const imageCounts = usePostImageCounts();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const days = useMemo(() => {
    if (dateRange === 'week') {
      return getWeekDays(currentDate);
    }
    // For month view, pad to full weeks (start from Monday of the first week)
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    // End on Sunday of the last week
    const lastDay = monthEnd.getDay(); // 0=Sun
    const calEnd = lastDay === 0 ? monthEnd : new Date(monthEnd);
    if (lastDay !== 0) {
      calEnd.setDate(calEnd.getDate() + (7 - lastDay));
    }
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate, dateRange]);

  const currentMonth = currentDate.getMonth();

  const postsByDate = useMemo(() => {
    const map: Record<string, Post[]> = {};
    days.forEach((d) => {
      map[toISODate(d)] = [];
    });
    posts.forEach((post) => {
      if (map[post.scheduledDate]) {
        map[post.scheduledDate].push(post);
      }
    });
    return map;
  }, [posts, days]);

  function handleNavigate(direction: 'prev' | 'next') {
    setCurrentDate((prev) =>
      dateRange === 'week' ? navigateWeek(prev, direction) : navigateMonth(prev, direction)
    );
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  function handleDragStart(event: DragStartEvent) {
    const post = posts.find((p) => p.id === event.active.id);
    if (post) setActivePost(post);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActivePost(null);
    const { active, over } = event;
    if (!over) return;

    const postId = active.id as string;
    const targetDate = over.id as string;

    if (targetDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const post = posts.find((p) => p.id === postId);
      if (post && post.scheduledDate !== targetDate) {
        onMovePost(postId, targetDate);
      }
    }
  }

  const rangeLabel = dateRange === 'week' ? formatWeekRange(currentDate) : format(currentDate, 'LLLL yyyy', { locale: ru });

  const isMonth = dateRange === 'month';

  return (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
          >
            Сегодня
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleNavigate('prev')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-base font-semibold text-gray-800 dark:text-gray-200 capitalize min-w-[200px] text-center">
              {rangeLabel}
            </span>
            <button
              onClick={() => handleNavigate('next')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
          <button
            onClick={() => setDateRange('week')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              dateRange === 'week'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CalendarDays size={14} className="inline mr-1" />
            Неделя
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              dateRange === 'month'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Месяц
          </button>
        </div>
      </div>

      {/* Board */}
      <div className={`flex-1 p-3 ${isMonth ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {isMonth ? (
            /* Month: calendar grid */
            <div className="flex flex-col h-full min-h-0">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAY_NAMES.map((name) => (
                  <div
                    key={name}
                    className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-1"
                  >
                    {name}
                  </div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1 flex-1 min-h-0 auto-rows-fr">
                {days.map((day) => {
                  const dateStr = toISODate(day);
                  const isOtherMonth = day.getMonth() !== currentMonth;
                  return (
                    <MonthDayCell
                      key={dateStr}
                      date={day}
                      dateStr={dateStr}
                      posts={postsByDate[dateStr] || []}
                      isOtherMonth={isOtherMonth}
                      onClick={(ds, d) => setSelectedDay({ date: d, dateStr: ds })}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            /* Week: flex columns filling the screen */
            <div className="flex gap-2">
              {days.map((day) => {
                const dateStr = toISODate(day);
                return (
                  <div key={dateStr} className="flex-1 min-w-0">
                    <DayColumn
                      date={day}
                      dateStr={dateStr}
                      posts={postsByDate[dateStr] || []}
                      onPostClick={onPostClick}
                      onAddPost={onAddPost}
                      imageCounts={imageCounts}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <DragOverlay>
            {activePost && (
              <div className="w-48 rotate-2 opacity-90">
                <PostCard post={activePost} onClick={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Day detail modal for month view */}
      <DayDetailModal
        isOpen={selectedDay !== null}
        date={selectedDay?.date ?? null}
        dateStr={selectedDay?.dateStr ?? ''}
        posts={selectedDay ? (postsByDate[selectedDay.dateStr] || []) : []}
        onClose={() => setSelectedDay(null)}
        onPostClick={(post) => {
          setSelectedDay(null);
          onPostClick(post);
        }}
        onAddPost={(date) => {
          setSelectedDay(null);
          onAddPost(date);
        }}
      />
    </div>
  );
}
