import type { SocialPlatform, PostStatus, ContentFormat } from '../types';

export const PLATFORM_CONFIG: Record<SocialPlatform, { label: string; color: string; bg: string }> = {
  instagram: { label: 'Instagram', color: '#E1306C', bg: 'rgba(225,48,108,0.15)' },
  telegram: { label: 'Telegram', color: '#0088cc', bg: 'rgba(0,136,204,0.15)' },
  youtube: { label: 'YouTube', color: '#FF0000', bg: 'rgba(255,0,0,0.15)' },
  tiktok: { label: 'TikTok', color: '#69C9D0', bg: 'rgba(105,201,208,0.15)' },
  linkedin: { label: 'LinkedIn', color: '#0A66C2', bg: 'rgba(10,102,194,0.15)' },
  facebook: { label: 'Facebook', color: '#1877F2', bg: 'rgba(24,119,242,0.15)' },
  twitter: { label: 'Twitter/X', color: '#808080', bg: 'rgba(128,128,128,0.15)' },
  threads: { label: 'Threads', color: '#000000', bg: 'rgba(0,0,0,0.15)' },
  vk: { label: 'VK', color: '#0077FF', bg: 'rgba(0,119,255,0.15)' },
  other: { label: 'Другое', color: '#6B7280', bg: 'rgba(107,114,128,0.15)' },
};

export const STATUS_CONFIG: Record<PostStatus, { label: string; emoji: string; color: string; bg: string }> = {
  idea: { label: 'Идея', emoji: '🔘', color: '#9CA3AF', bg: 'rgba(156,163,175,0.2)' },
  draft: { label: 'Черновик', emoji: '✏️', color: '#F59E0B', bg: 'rgba(245,158,11,0.2)' },
  review: { label: 'На согласовании', emoji: '👀', color: '#F97316', bg: 'rgba(249,115,22,0.2)' },
  ready: { label: 'Готов к публикации', emoji: '✅', color: '#3B82F6', bg: 'rgba(59,130,246,0.2)' },
  published: { label: 'Опубликован', emoji: '🚀', color: '#10B981', bg: 'rgba(16,185,129,0.2)' },
  cancelled: { label: 'Отменён', emoji: '❌', color: '#EF4444', bg: 'rgba(239,68,68,0.2)' },
};

export const FORMAT_CONFIG: Record<ContentFormat, string> = {
  post: 'Пост',
  stories: 'Stories/Reels',
  video: 'Видео',
  carousel: 'Carousel',
  article: 'Статья',
  poll: 'Опрос',
  other: 'Другое',
};

export const PLATFORMS = Object.keys(PLATFORM_CONFIG) as SocialPlatform[];
export const STATUSES = Object.keys(STATUS_CONFIG) as PostStatus[];
export const FORMATS = Object.keys(FORMAT_CONFIG) as ContentFormat[];
