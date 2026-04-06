import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Post, SocialPlatform } from '../../types';
import type { PreviewImageWithUrl } from '../../hooks/usePreviewImages';
import { PLATFORM_PREVIEWS } from './platforms';
import { PLATFORM_CONFIG, STATUS_CONFIG } from '../../utils/constants';
import { fromISODate } from '../../utils/dateUtils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface PreviewDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  images: PreviewImageWithUrl[];
}

export function PreviewDetailModal({ post, isOpen, onClose, images }: PreviewDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  const platform = post.platform as Exclude<SocialPlatform, 'other'>;
  const PreviewComponent = PLATFORM_PREVIEWS[platform];
  if (!PreviewComponent) return null;

  const platformConfig = PLATFORM_CONFIG[post.platform];
  const statusConfig = STATUS_CONFIG[post.status];
  const dateStr = post.scheduledDate
    ? format(fromISODate(post.scheduledDate), 'd MMMM yyyy', { locale: ru })
    : '';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4 pt-[5vh]"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded"
              style={{ color: platformConfig.color, backgroundColor: platformConfig.bg }}
            >
              {platformConfig.label}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Предпросмотр поста
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Preview */}
        <div className="p-6">
          <div className="mx-auto" style={{ maxWidth: 500 }}>
            <PreviewComponent post={post} images={images} />
          </div>
        </div>

        {/* Info bar */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {dateStr && (
            <span>{dateStr}</span>
          )}
          {post.scheduledTime && (
            <span>{post.scheduledTime}</span>
          )}
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-medium"
            style={{ color: statusConfig.color, backgroundColor: statusConfig.bg }}
          >
            {statusConfig.emoji} {statusConfig.label}
          </span>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[11px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
