import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Eye } from 'lucide-react';

import type { Post } from '../../../types';
import type { PreviewImageWithUrl } from '../../../hooks/usePreviewImages';
import { fromISODate } from '../../../utils/dateUtils';

interface Props {
  post: Post;
  images: PreviewImageWithUrl[];
}

export function TelegramPreview({ post, images }: Props) {
  const scheduledDate = fromISODate(post.scheduledDate);
  const timeStr = post.scheduledTime || format(scheduledDate, 'HH:mm', { locale: ru });
  const firstImage = images.length > 0 ? images[0] : null;
  const imageCount = images.length;

  return (
    <div className="overflow-hidden rounded-xl bg-white p-4 text-black shadow-sm">
      {/* Channel name */}
      <div className="mb-2">
        <span className="text-sm font-bold text-[#0088cc]">Content Board</span>
      </div>

      {/* Post text */}
      {post.content && (
        <div className="mb-3">
          <p className="whitespace-pre-wrap text-sm">{post.content}</p>
        </div>
      )}

      {/* Image */}
      {firstImage && (
        <div className="relative mb-3 overflow-hidden rounded-lg">
          <img
            src={firstImage.fullUrl}
            alt=""
            className="w-full object-cover"
          />
          {imageCount > 1 && (
            <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
              1/{imageCount}
            </div>
          )}
        </div>
      )}

      {/* Footer: views + time */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          <span>---</span>
        </div>
        <span>{timeStr}</span>
      </div>
    </div>
  );
}
