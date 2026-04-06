import { Heart, MessageCircle, Share2, Music2, User, Image as ImageIcon } from 'lucide-react';

import type { Post } from '../../../types';
import type { PreviewImageWithUrl } from '../../../hooks/usePreviewImages';

interface Props {
  post: Post;
  images: PreviewImageWithUrl[];
}

function renderContentWithHashtags(text: string) {
  const parts = text.split(/(#[\wа-яА-ЯёЁ]+)/gu);
  return parts.map((part, i) =>
    /^#[\wа-яА-ЯёЁ]+$/u.test(part) ? (
      <strong key={i}>{part}</strong>
    ) : (
      part
    ),
  );
}

export function TikTokPreview({ post, images }: Props) {
  const firstImage = images.length > 0 ? images[0] : null;
  const imageCount = images.length;

  return (
    <div className="overflow-hidden rounded-xl bg-[#121212] text-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#69C9D0]">
          <User className="h-5 w-5 text-white" />
        </div>
        <span className="text-[15px] font-semibold text-white">@contentboard</span>
      </div>

      {/* Text with hashtags */}
      {post.content && (
        <div className="px-3 pb-2">
          <p className="whitespace-pre-wrap text-[14px]">
            {renderContentWithHashtags(post.content)}
          </p>
        </div>
      )}

      {/* Music line */}
      <div className="flex items-center gap-1.5 px-3 pb-3">
        <Music2 className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-[13px] text-gray-400">
          Original Sound — Content Board
        </span>
      </div>

      {/* Image */}
      <div className="relative mx-3 mb-3 overflow-hidden rounded-lg bg-gray-800">
        <div className="aspect-[9/16]">
          {firstImage ? (
            <>
              <img
                src={firstImage.fullUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              {imageCount > 1 && (
                <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                  1/{imageCount}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-16 w-16 text-gray-600" />
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-around px-3 pb-3 text-[13px] text-gray-300">
        <div className="flex items-center gap-1.5">
          <Heart className="h-5 w-5" />
          <span>---</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageCircle className="h-5 w-5" />
          <span>---</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Share2 className="h-5 w-5" />
          <span>---</span>
        </div>
      </div>
    </div>
  );
}
