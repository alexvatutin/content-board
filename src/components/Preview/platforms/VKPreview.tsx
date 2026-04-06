import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Heart, MessageCircle, Share2, Eye, User } from 'lucide-react';

import type { Post } from '../../../types';
import type { PreviewImageWithUrl } from '../../../hooks/usePreviewImages';
import { fromISODate } from '../../../utils/dateUtils';

interface Props {
  post: Post;
  images: PreviewImageWithUrl[];
}

export function VKPreview({ post, images }: Props) {
  const scheduledDate = fromISODate(post.scheduledDate);
  const timeStr = post.scheduledTime || '12:00';
  const formattedDate = format(scheduledDate, 'd MMM', { locale: ru });
  const dateTimeLabel = `${formattedDate} в ${timeStr}`;
  const firstImage = images.length > 0 ? images[0] : null;
  const imageCount = images.length;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0077FF]">
          <User className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-black">Content Board</span>
          <span className="text-[13px] text-gray-500">{dateTimeLabel}</span>
        </div>
      </div>

      {/* Post text */}
      {post.content && (
        <div className="px-4 pt-2.5">
          <p className="whitespace-pre-wrap text-[14px] text-black">{post.content}</p>
        </div>
      )}

      {/* Image */}
      {firstImage ? (
        <div className="relative mt-3 overflow-hidden rounded-md mx-4">
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
      <div className="flex items-center justify-between px-4 py-3 text-[13px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <Heart className="h-5 w-5" />
          <span>0</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageCircle className="h-5 w-5" />
          <span>0</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Share2 className="h-5 w-5" />
          <span>0</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Eye className="h-5 w-5" />
          <span>---</span>
        </div>
      </div>
    </div>
  );
}
