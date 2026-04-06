import { useState, useMemo } from 'react';
import type { Post, SocialPlatform } from '../../types';
import { PLATFORM_CONFIG } from '../../utils/constants';
import { usePreviewImages } from '../../hooks/usePreviewImages';
import { PreviewFeed } from './PreviewFeed';
import { PreviewDetailModal } from './PreviewDetailModal';
import { PREVIEW_PLATFORMS } from './platforms';

interface PreviewViewProps {
  posts: Post[];
}

export function PreviewView({ posts }: PreviewViewProps) {
  // Count posts per platform to find default
  const platformCounts = useMemo(() => {
    const counts: Partial<Record<SocialPlatform, number>> = {};
    posts.forEach((p) => {
      if (p.platform !== 'other') {
        counts[p.platform] = (counts[p.platform] || 0) + 1;
      }
    });
    return counts;
  }, [posts]);

  // Default to platform with most posts, or 'instagram'
  const defaultPlatform = useMemo(() => {
    let max = 0;
    let best: Exclude<SocialPlatform, 'other'> = 'instagram';
    for (const p of PREVIEW_PLATFORMS) {
      const count = platformCounts[p] || 0;
      if (count > max) {
        max = count;
        best = p;
      }
    }
    return best;
  }, [platformCounts]);

  const [selectedPlatform, setSelectedPlatform] = useState<Exclude<SocialPlatform, 'other'>>(defaultPlatform);
  const [detailPost, setDetailPost] = useState<Post | null>(null);

  const filteredPosts = useMemo(
    () => posts.filter((p) => p.platform === selectedPlatform),
    [posts, selectedPlatform]
  );

  const postIds = useMemo(() => filteredPosts.map((p) => p.id), [filteredPosts]);
  const { imagesByPostId } = usePreviewImages(postIds);

  // Also load images for detail post if it's different
  const detailPostIds = useMemo(
    () => (detailPost ? [detailPost.id] : []),
    [detailPost]
  );
  const { imagesByPostId: detailImages } = usePreviewImages(detailPostIds);

  function handlePostClick(post: Post) {
    setDetailPost(post);
  }

  function handleCloseDetail() {
    setDetailPost(null);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with platform selector */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="px-4 py-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Предпросмотр
          </h2>
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 scrollbar-thin">
            {PREVIEW_PLATFORMS.map((platform) => {
              const config = PLATFORM_CONFIG[platform];
              const count = platformCounts[platform] || 0;
              const active = selectedPlatform === platform;
              return (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={active ? { backgroundColor: config.color } : undefined}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: active ? 'rgba(255,255,255,0.7)' : config.color }}
                  />
                  {config.label}
                  <span
                    className={`ml-0.5 px-1.5 py-0 rounded-full text-[10px] font-bold ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feed */}
      <PreviewFeed
        posts={filteredPosts}
        platform={selectedPlatform}
        imagesByPostId={imagesByPostId}
        onPostClick={handlePostClick}
      />

      {/* Detail modal */}
      <PreviewDetailModal
        post={detailPost}
        isOpen={detailPost !== null}
        onClose={handleCloseDetail}
        images={detailPost ? (detailImages.get(detailPost.id) || imagesByPostId.get(detailPost.id) || []) : []}
      />
    </div>
  );
}
