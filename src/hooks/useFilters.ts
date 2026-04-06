import { useState, useCallback, useMemo } from 'react';
import type { Post, Filters } from '../types';

const DEFAULT_FILTERS: Filters = {
  platform: 'all',
  status: 'all',
  tag: 'all',
  dateFrom: null,
  dateTo: null,
};

export function useFilters(posts: Post[]) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const setFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setDateRange = useCallback((from: string | null, to: string | null) => {
    setFilters((prev) => ({ ...prev, dateFrom: from, dateTo: to }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (filters.platform !== 'all' && post.platform !== filters.platform) return false;
      if (filters.status !== 'all' && post.status !== filters.status) return false;
      if (filters.tag !== 'all' && !post.tags.includes(filters.tag)) return false;
      if (filters.dateFrom && post.scheduledDate < filters.dateFrom) return false;
      if (filters.dateTo && post.scheduledDate > filters.dateTo) return false;
      return true;
    });
  }, [posts, filters]);

  const hasActiveFilters =
    filters.platform !== 'all' ||
    filters.status !== 'all' ||
    filters.tag !== 'all' ||
    filters.dateFrom !== null ||
    filters.dateTo !== null;

  return { filters, setFilter, setDateRange, resetFilters, filteredPosts, hasActiveFilters };
}
