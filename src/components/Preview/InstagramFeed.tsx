import { useMemo } from 'react';
import {
  Grid3X3,
  Film,
  UserSquare2,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  User,
} from 'lucide-react';
import type { Post } from '../../types';
import type { PreviewImageWithUrl } from '../../hooks/usePreviewImages';

interface InstagramFeedProps {
  posts: Post[];
  imagesByPostId: Map<string, PreviewImageWithUrl[]>;
  onPostClick: (post: Post) => void;
}

export function InstagramFeed({ posts, imagesByPostId, onPostClick }: InstagramFeedProps) {
  const sorted = useMemo(
    () =>
      [...posts].sort((a, b) => {
        const da = `${a.scheduledDate}T${a.scheduledTime}`;
        const db = `${b.scheduledDate}T${b.scheduledTime}`;
        return db.localeCompare(da);
      }),
    [posts]
  );

  const totalPosts = sorted.length;

  if (totalPosts === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          Нет постов для этой платформы
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div
        className="mx-auto bg-white text-black"
        style={{
          maxWidth: 470,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        {/* Profile header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                }}
              >
                <div className="w-[74px] h-[74px] rounded-full bg-white flex items-center justify-center">
                  <div className="w-[70px] h-[70px] rounded-full bg-[#E1306C] flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-[16px] font-bold">{totalPosts}</div>
                <div className="text-[13px] text-gray-500">публикаций</div>
              </div>
              <div className="text-center">
                <div className="text-[16px] font-bold">---</div>
                <div className="text-[13px] text-gray-500">подписчики</div>
              </div>
              <div className="text-center">
                <div className="text-[16px] font-bold">---</div>
                <div className="text-[13px] text-gray-500">подписки</div>
              </div>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="mt-3">
            <div className="text-[14px] font-bold">Content Board</div>
            <div className="text-[14px] text-gray-500">Контент-план</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-200">
          <button className="flex-1 flex items-center justify-center py-2.5 border-b-2 border-black">
            <Grid3X3 size={13} className="text-black" />
          </button>
          <button className="flex-1 flex items-center justify-center py-2.5 border-b-2 border-transparent">
            <Film size={13} className="text-gray-400" />
          </button>
          <button className="flex-1 flex items-center justify-center py-2.5 border-b-2 border-transparent">
            <UserSquare2 size={13} className="text-gray-400" />
          </button>
        </div>

        {/* Photo grid */}
        <div className="grid grid-cols-3 gap-[2px]">
          {sorted.map((post) => {
            const images = imagesByPostId.get(post.id) || [];
            const firstImage = images.length > 0 ? images[0] : null;
            const imageCount = images.length;

            return (
              <button
                key={post.id}
                onClick={() => onPostClick(post)}
                className="relative aspect-square bg-gray-100 overflow-hidden group"
              >
                {firstImage ? (
                  <img
                    src={firstImage.fullUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gray-50">
                    <ImageIcon size={24} className="text-gray-300" />
                    <span className="text-[10px] text-gray-400 line-clamp-2 px-1 text-center leading-tight">
                      {post.title || post.content?.slice(0, 30) || 'Пост'}
                    </span>
                  </div>
                )}

                {/* Carousel indicator */}
                {imageCount > 1 && (
                  <div className="absolute top-1.5 right-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" fillOpacity="0.9">
                      <path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm0 2v14h14V5H5z"/>
                      <path d="M8 1h14a2 2 0 012 2v14" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.9"/>
                    </svg>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5">
                  <span className="flex items-center gap-1 text-white text-[14px] font-bold">
                    <Heart size={18} fill="white" className="text-white" />
                    {post.metrics?.likes ?? 0}
                  </span>
                  <span className="flex items-center gap-1 text-white text-[14px] font-bold">
                    <MessageCircle size={18} fill="white" className="text-white" />
                    {post.metrics?.comments ?? 0}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
