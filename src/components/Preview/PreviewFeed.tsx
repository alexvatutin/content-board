import { useMemo } from 'react';
import type { Post, SocialPlatform } from '../../types';
import type { PreviewImageWithUrl } from '../../hooks/usePreviewImages';
import { PLATFORM_PREVIEWS, FEED_MAX_WIDTH } from './platforms';

interface PreviewFeedProps {
  posts: Post[];
  platform: Exclude<SocialPlatform, 'other'>;
  imagesByPostId: Map<string, PreviewImageWithUrl[]>;
  onPostClick: (post: Post) => void;
}

export function PreviewFeed({ posts, platform, imagesByPostId, onPostClick }: PreviewFeedProps) {
  const PreviewComponent = PLATFORM_PREVIEWS[platform];
  const maxWidth = FEED_MAX_WIDTH[platform];

  const sorted = useMemo(
    () =>
      [...posts].sort((a, b) => {
        const da = `${a.scheduledDate}T${a.scheduledTime}`;
        const db = `${b.scheduledDate}T${b.scheduledTime}`;
        return db.localeCompare(da); // newest first
      }),
    [posts]
  );

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          Нет постов для этой платформы
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto py-6 px-4">
      <div className="mx-auto flex flex-col gap-4" style={{ maxWidth }}>
        {sorted.map((post) => (
          <div
            key={post.id}
            onClick={() => onPostClick(post)}
            className="cursor-pointer transition-transform hover:scale-[1.01]"
          >
            <PreviewComponent
              post={post}
              images={imagesByPostId.get(post.id) || []}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
