import { User, MessageCircle, Repeat2, Heart, BarChart2 } from 'lucide-react';

import type { Post } from '../../../types';
import type { PreviewImageWithUrl } from '../../../hooks/usePreviewImages';

interface Props {
  post: Post;
  images: PreviewImageWithUrl[];
}

export function TwitterPreview({ post, images }: Props) {
  const timeStr = post.scheduledTime || '12:00';
  const firstImage = images.length > 0 ? images[0] : null;
  const imageCount = images.length;

  return (
    <div
      className="border-b border-gray-200 bg-white px-4 pb-3 pt-3 text-black"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1DA1F2]">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Name line */}
          <div className="flex items-center gap-1">
            <span className="text-[15px] font-bold">Content Board</span>
            <span className="text-[15px] text-gray-500">@contentboard</span>
            <span className="text-[15px] text-gray-500">&middot;</span>
            <span className="text-[15px] text-gray-500">{timeStr}</span>
          </div>

          {/* Tweet text */}
          {post.content && (
            <div className="mt-0.5">
              <p className="whitespace-pre-wrap text-[15px]">{post.content}</p>
            </div>
          )}

          {/* Image */}
          {firstImage ? (
            <div className="relative mt-3 overflow-hidden rounded-2xl border border-gray-200">
              <div className="aspect-video bg-gray-100">
                <img
                  src={firstImage.fullUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              {imageCount > 1 && (
                <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                  1/{imageCount}
                </div>
              )}
            </div>
          ) : null}

          {/* Action bar */}
          <div className="mt-3 flex items-center gap-10 text-gray-500">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-[18px] w-[18px]" />
              <span className="text-[13px]">0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Repeat2 className="h-[18px] w-[18px]" />
              <span className="text-[13px]">0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="h-[18px] w-[18px]" />
              <span className="text-[13px]">0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart2 className="h-[18px] w-[18px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
