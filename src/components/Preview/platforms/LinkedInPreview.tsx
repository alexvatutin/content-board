import { Globe, ThumbsUp, MessageCircle, Repeat2, Send, User } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { fromISODate } from '../../../utils/dateUtils';
import type { Post } from '../../../types';
import type { PreviewImageWithUrl } from '../../../hooks/usePreviewImages';

interface Props {
  post: Post;
  images: PreviewImageWithUrl[];
}

export function LinkedInPreview({ post, images }: Props) {
  const date = fromISODate(post.scheduledDate);
  const formattedTime = format(date, 'd MMM', { locale: ru });
  const sortedImages = [...images].sort((a, b) => a.order - b.order);
  const firstImage = sortedImages[0] ?? null;
  const totalImages = sortedImages.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-3 pb-2">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#0A66C2' }}
        >
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-gray-900 leading-tight">
            Content Board
          </div>
          <div className="text-[12px] text-gray-500 leading-tight mt-0.5">
            Content Creator
          </div>
          <div className="flex items-center gap-1 text-[12px] text-gray-500 mt-0.5">
            <span>{formattedTime}</span>
            <span>·</span>
            <Globe className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <div className="text-[14px] text-gray-900 line-clamp-3">
            {post.content}
          </div>
          <span className="text-[14px] text-gray-500 font-semibold cursor-pointer">
            ...ещё
          </span>
        </div>
      )}

      {/* Image */}
      {firstImage && (
        <div className="relative w-full bg-gray-100">
          <img
            src={firstImage.fullUrl}
            alt=""
            className="w-full object-cover"
          />
          {totalImages > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded">
              1/{totalImages}
            </div>
          )}
        </div>
      )}

      {/* Reactions */}
      <div className="flex items-center gap-1 px-4 py-1.5 text-[12px] text-gray-500">
        <span>👍</span>
        <span>❤</span>
        <span className="ml-0.5">0</span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Action bar */}
      <div className="flex justify-around py-2 px-4">
        <button className="flex items-center gap-1 text-[12px] text-gray-600 font-semibold">
          <ThumbsUp className="w-4 h-4" />
          <span>Нравится</span>
        </button>
        <button className="flex items-center gap-1 text-[12px] text-gray-600 font-semibold">
          <MessageCircle className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-1 text-[12px] text-gray-600 font-semibold">
          <Repeat2 className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-1 text-[12px] text-gray-600 font-semibold">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
