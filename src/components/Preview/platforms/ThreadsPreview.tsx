import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Heart, MessageCircle, Repeat2, Send, User } from 'lucide-react';

import type { Post } from '../../../types';
import type { PreviewImageWithUrl } from '../../../hooks/usePreviewImages';
import { fromISODate } from '../../../utils/dateUtils';

interface Props {
  post: Post;
  images: PreviewImageWithUrl[];
}

export function ThreadsPreview({ post, images }: Props) {
  const scheduledDate = fromISODate(post.scheduledDate);
  const hoursAgo = format(scheduledDate, 'H', { locale: ru });
  const timeLabel = `${hoursAgo}ч`;
  const firstImage = images.length > 0 ? images[0] : null;
  const imageCount = images.length;

  return (
    <div className="border-b border-gray-100 bg-white text-black">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-semibold">contentboard</span>
          <span className="text-[15px] text-gray-500">&middot;</span>
          <span className="text-[15px] text-gray-500">{timeLabel}</span>
        </div>
      </div>

      {/* Post text */}
      {post.content && (
        <div className="px-4 pt-2">
          <p className="whitespace-pre-wrap text-[15px]">{post.content}</p>
        </div>
      )}

      {/* Image */}
      {firstImage ? (
        <div className="relative mx-4 mt-3 overflow-hidden rounded-lg">
          <div className="aspect-square bg-gray-100">
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
      <div className="flex items-center gap-5 px-4 pt-3 text-gray-500">
        <Heart className="h-5 w-5" />
        <MessageCircle className="h-5 w-5" />
        <Repeat2 className="h-5 w-5" />
        <Send className="h-5 w-5" />
      </div>

      {/* Stats */}
      <div className="px-4 pb-3 pt-2">
        <span className="text-[13px] text-gray-400">
          0 ответов &middot; 0 лайков
        </span>
      </div>
    </div>
  );
}
