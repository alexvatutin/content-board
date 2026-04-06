export type SocialPlatform =
  | 'instagram' | 'telegram' | 'youtube' | 'tiktok'
  | 'linkedin' | 'facebook' | 'twitter' | 'threads' | 'vk' | 'other';

export type PostStatus =
  | 'idea' | 'draft' | 'review' | 'ready' | 'published' | 'cancelled';

export type ContentFormat =
  | 'post' | 'stories' | 'video' | 'carousel' | 'article' | 'poll' | 'other';

export interface PostMetrics {
  reach?: number;
  impressions?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  linkClicks?: number;
  followsGained?: number;
  custom?: Array<{ name: string; value: number }>;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  platform: SocialPlatform;
  format: ContentFormat;
  scheduledDate: string;
  scheduledTime: string;
  status: PostStatus;
  tags: string[];
  publishedUrl?: string;
  metrics?: PostMetrics;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'board' | 'list' | 'analytics';

export type DateRange = 'week' | 'month' | 'custom';

export interface Filters {
  platform: SocialPlatform | 'all';
  status: PostStatus | 'all';
  tag: string | 'all';
  dateFrom: string | null;
  dateTo: string | null;
}

export interface DatePreset {
  label: string;
  getRange: () => { from: string; to: string };
}
