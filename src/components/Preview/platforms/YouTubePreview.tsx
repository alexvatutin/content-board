import { ThumbsUp, ThumbsDown, MessageCircle, User } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { fromISODate } from '../../../utils/dateUtils';
import type { Post } from '../../../types';
import type { PreviewImageWithUrl } from '../../../hooks/usePreviewImages';

interface Props {
  post: Post;
  images: PreviewImageWithUrl[];
}

export function YouTubePreview({ post, images }: Props) {
  const date = fromISODate(post.scheduledDate);
  const formattedTime = format(date, 'd MMM', { locale: ru });
  const sortedImages = [...images].sort((a, b) => a.order - b.order);
  const firstImage = sortedImages[0] ?? null;
  const totalImages = sortedImages.length;

  return (
    <div className="bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#FF0000' }}
        >
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[14px] font-semibold text-gray-900">
            Content Board
          </span>
          <span className="text-[14px] text-gray-500">·</span>
          <span className="text-[14px] text-gray-500">{formattedTime}</span>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3 text-[14px] text-gray-900 whitespace-pre-wrap">
          {post.content}
        </div>
      )}

      {/* Image */}
      {firstImage && (
        <div className="relative px-4 pb-3">
          <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
            <img
              src={firstImage.fullUrl}
              alt=""
              className="w-full h-full object-cover"
            />
            {totalImages > 1 && (
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded">
                1/{totalImages}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 pb-3">
        <button className="flex items-center gap-1 text-[13px] text-gray-600">
          <ThumbsUp className="w-4 h-4" />
          <span>0</span>
        </button>
        <button className="flex items-center gap-1 text-[13px] text-gray-600">
          <ThumbsDown className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-1 text-[13px] text-gray-600">
          <MessageCircle className="w-4 h-4" />
          <span>0</span>
        </button>
      </div>
    </div>
  );
}
