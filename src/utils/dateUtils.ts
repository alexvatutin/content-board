import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isToday,
  isSameDay,
  parseISO,
} from 'date-fns';
import { ru } from 'date-fns/locale';

export function getWeekDays(date: Date): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  });
}

export function getMonthDays(date: Date): Date[] {
  return eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  });
}

export function navigateWeek(date: Date, direction: 'prev' | 'next'): Date {
  return direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1);
}

export function navigateMonth(date: Date, direction: 'prev' | 'next'): Date {
  return direction === 'next' ? addMonths(date, 1) : subMonths(date, 1);
}

export function formatDayShort(date: Date): string {
  return format(date, 'EEE, d MMM', { locale: ru });
}

export function formatDayFull(date: Date): string {
  return format(date, 'd MMMM yyyy', { locale: ru });
}

export function formatMonthYear(date: Date): string {
  return format(date, 'LLLL yyyy', { locale: ru });
}

export function formatWeekRange(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return `${format(start, 'd MMM', { locale: ru })} — ${format(end, 'd MMM yyyy', { locale: ru })}`;
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function fromISODate(str: string): Date {
  return parseISO(str);
}

export { isToday, isSameDay, format, parseISO };

// ── Date presets ────────────────────────────────────────

import type { DatePreset } from '../types';

export function getDatePresets(): { future: DatePreset[]; past: DatePreset[] } {
  const today = new Date();
  const weekOpts = { weekStartsOn: 1 as const };

  const future: DatePreset[] = [
    {
      label: 'Сегодня',
      getRange: () => ({ from: toISODate(today), to: toISODate(today) }),
    },
    {
      label: 'Ближайшие 7 дней',
      getRange: () => ({ from: toISODate(today), to: toISODate(addDays(today, 6)) }),
    },
    {
      label: 'Ближайшие 14 дней',
      getRange: () => ({ from: toISODate(today), to: toISODate(addDays(today, 13)) }),
    },
    {
      label: 'Ближайшие 30 дней',
      getRange: () => ({ from: toISODate(today), to: toISODate(addDays(today, 29)) }),
    },
    {
      label: 'Эта неделя',
      getRange: () => ({
        from: toISODate(startOfWeek(today, weekOpts)),
        to: toISODate(endOfWeek(today, weekOpts)),
      }),
    },
    {
      label: 'Следующая неделя',
      getRange: () => {
        const next = addWeeks(today, 1);
        return {
          from: toISODate(startOfWeek(next, weekOpts)),
          to: toISODate(endOfWeek(next, weekOpts)),
        };
      },
    },
    {
      label: 'Этот месяц',
      getRange: () => ({
        from: toISODate(startOfMonth(today)),
        to: toISODate(endOfMonth(today)),
      }),
    },
    {
      label: 'Следующий месяц',
      getRange: () => {
        const next = addMonths(today, 1);
        return { from: toISODate(startOfMonth(next)), to: toISODate(endOfMonth(next)) };
      },
    },
  ];

  const past: DatePreset[] = [
    {
      label: 'Последние 7 дней',
      getRange: () => ({ from: toISODate(subDays(today, 6)), to: toISODate(today) }),
    },
    {
      label: 'Последние 30 дней',
      getRange: () => ({ from: toISODate(subDays(today, 29)), to: toISODate(today) }),
    },
    {
      label: 'Прошлая неделя',
      getRange: () => {
        const prev = subWeeks(today, 1);
        return {
          from: toISODate(startOfWeek(prev, weekOpts)),
          to: toISODate(endOfWeek(prev, weekOpts)),
        };
      },
    },
    {
      label: 'Прошлый месяц',
      getRange: () => {
        const prev = subMonths(today, 1);
        return { from: toISODate(startOfMonth(prev)), to: toISODate(endOfMonth(prev)) };
      },
    },
  ];

  return { future, past };
}

export function formatDateRange(from: string | null, to: string | null): string {
  if (!from && !to) return 'Все даты';
  const fmt = (s: string) => format(parseISO(s), 'd MMM yyyy', { locale: ru });
  if (from && to) {
    if (from === to) return fmt(from);
    return `${format(parseISO(from), 'd MMM', { locale: ru })} — ${fmt(to)}`;
  }
  if (from) return `с ${fmt(from)}`;
  return `до ${fmt(to!)}`;
}
