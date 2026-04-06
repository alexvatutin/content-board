import { Globe, ThumbsUp, MessageCircle, Share2, User } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { fromISODate } from '../../../utils/dateUtils';
import type { Post } from '../../../types';
import type { PreviewImageWithUrl } from '../../../hooks/usePreviewImages';

interface Props {
  post: Post;
  images: PreviewImageWithUrl[];
}

export function FacebookPreview({ post, images }: Props) {
  const date = fromISODate(post.scheduledDate);
  const formattedDate = format(date, 'd MMM', { locale: ru });
  const sortedImages = [...images].sort((a, b) => a.order - b.order);
  const firstImage = sortedImages[0] ?? null;
  const totalImages = sortedImages.length;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#1877F2' }}
        >
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-gray-900 leading-tight">
            Content Board
          </div>
          <div className="flex items-center gap-1 text-[13px] text-gray-500">
            <span>{formattedDate}</span>
            <span>·</span>
            <Globe className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3 text-[15px] text-gray-900 whitespace-pre-wrap">
          {post.content}
        </div>
      )}

      {/* Image */}
      {firstImage && (
        <div className="relative w-full aspect-video bg-gray-100">
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
      )}

      {/* Reactions */}
      <div className="flex items-center gap-1 px-4 py-1 text-[13px] text-gray-500">
        <span>👍</span>
        <span>😊</span>
        <span className="ml-0.5">0</span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Action bar */}
      <div className="flex justify-around py-2 px-4">
        <button className="flex items-center gap-1.5 text-[13px] text-gray-600 font-medium">
          <ThumbsUp className="w-4 h-4" />
          <span>Нравится</span>
        </button>
        <button className="flex items-center gap-1.5 text-[13px] text-gray-600 font-medium">
          <MessageCircle className="w-4 h-4" />
          <span>Комм.</span>
        </button>
        <button className="flex items-center gap-1.5 text-[13px] text-gray-600 font-medium">
          <Share2 className="w-4 h-4" />
          <span>Поделиться</span>
        </button>
      </div>
    </div>
  );
}
