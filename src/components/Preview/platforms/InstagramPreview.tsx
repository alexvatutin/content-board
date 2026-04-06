import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  User,
  Image as ImageIcon,
} from 'lucide-react';

import type { Post } from '../../../types';
import type { PreviewImageWithUrl } from '../../../hooks/usePreviewImages';
import { fromISODate } from '../../../utils/dateUtils';

interface Props {
  post: Post;
  images: PreviewImageWithUrl[];
}

export function InstagramPreview({ post, images }: Props) {
  const scheduledDate = fromISODate(post.scheduledDate);
  const formattedDate = format(scheduledDate, 'd MMM yyyy', { locale: ru });
  const firstImage = images.length > 0 ? images[0] : null;
  const imageCount = images.length;

  return (
    <div
      className="overflow-hidden rounded-lg border border-gray-200 bg-white text-black"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E1306C]">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold">Content Board</span>
        </div>
        <MoreHorizontal className="h-5 w-5 text-black" />
      </div>

      {/* Image */}
      <div className="relative aspect-square w-full bg-gray-100">
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
            <ImageIcon className="h-16 w-16 text-gray-300" />
          </div>
        )}
      </div>

      {/* Action icons */}
      <div className="flex items-center justify-between px-3 pt-2.5">
        <div className="flex items-center gap-4">
          <Heart className="h-6 w-6" strokeWidth={2} />
          <MessageCircle className="h-6 w-6" strokeWidth={2} />
          <Send className="h-6 w-6" strokeWidth={2} />
        </div>
        <Bookmark className="h-6 w-6" strokeWidth={2} />
      </div>

      {/* Likes count */}
      <div className="px-3 pt-1.5">
        <span className="text-sm font-bold">0 отметок &laquo;Нравится&raquo;</span>
      </div>

      {/* Caption */}
      <div className="px-3 pt-1">
        <p className="line-clamp-3 text-sm">
          <span className="font-bold">Content Board</span>{' '}
          {post.content}
        </p>
      </div>

      {/* Date */}
      <div className="px-3 pb-3 pt-1.5">
        <span className="text-[10px] uppercase text-gray-400">{formattedDate}</span>
      </div>
    </div>
  );
}
