import type { ComponentType } from 'react';
import type { Post, SocialPlatform } from '../../../types';
import type { PreviewImageWithUrl } from '../../../hooks/usePreviewImages';

import { InstagramPreview } from './InstagramPreview';
import { TelegramPreview } from './TelegramPreview';
import { TwitterPreview } from './TwitterPreview';
import { FacebookPreview } from './FacebookPreview';
import { LinkedInPreview } from './LinkedInPreview';
import { YouTubePreview } from './YouTubePreview';
import { TikTokPreview } from './TikTokPreview';
import { ThreadsPreview } from './ThreadsPreview';
import { VKPreview } from './VKPreview';

export interface PlatformPreviewProps {
  post: Post;
  images: PreviewImageWithUrl[];
}

export const PLATFORM_PREVIEWS: Record<
  Exclude<SocialPlatform, 'other'>,
  ComponentType<PlatformPreviewProps>
> = {
  instagram: InstagramPreview,
  telegram: TelegramPreview,
  twitter: TwitterPreview,
  facebook: FacebookPreview,
  linkedin: LinkedInPreview,
  youtube: YouTubePreview,
  tiktok: TikTokPreview,
  threads: ThreadsPreview,
  vk: VKPreview,
};

export const FEED_MAX_WIDTH: Record<Exclude<SocialPlatform, 'other'>, number> = {
  instagram: 470,
  threads: 470,
  tiktok: 480,
  telegram: 550,
  facebook: 590,
  linkedin: 590,
  vk: 590,
  twitter: 600,
  youtube: 600,
};

export const PREVIEW_PLATFORMS = Object.keys(PLATFORM_PREVIEWS) as Exclude<SocialPlatform, 'other'>[];
