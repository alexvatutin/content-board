import type { SocialPlatform, ContentFormat } from '../types';

const IMAGE_LIMITS: Record<string, number> = {
  'instagram:post': 1,
  'instagram:carousel': 10,
  'instagram:stories': 1,
  'instagram:video': 1,
  'telegram:post': 10,
  'telegram:carousel': 10,
  'telegram:stories': 10,
  'telegram:video': 1,
  'facebook:post': 10,
  'facebook:carousel': 10,
  'facebook:stories': 1,
  'facebook:video': 1,
  'twitter:post': 4,
  'twitter:carousel': 4,
  'twitter:video': 1,
  'linkedin:post': 9,
  'linkedin:article': 1,
  'linkedin:carousel': 9,
  'linkedin:video': 1,
  'tiktok:post': 35,
  'tiktok:carousel': 35,
  'tiktok:video': 1,
  'youtube:video': 1,
  'youtube:post': 1,
  'vk:post': 10,
  'vk:carousel': 10,
  'vk:stories': 1,
  'vk:video': 1,
  'threads:post': 10,
  'threads:carousel': 10,
  'threads:video': 1,
};

const PLATFORM_DEFAULTS: Record<SocialPlatform, number> = {
  instagram: 1,
  telegram: 10,
  facebook: 10,
  twitter: 4,
  linkedin: 9,
  tiktok: 1,
  youtube: 1,
  vk: 10,
  threads: 10,
  other: 10,
};

export function getMaxImages(platform: SocialPlatform, format: ContentFormat): number {
  return IMAGE_LIMITS[`${platform}:${format}`] ?? PLATFORM_DEFAULTS[platform] ?? 10;
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
