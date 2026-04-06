import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImageIcon } from 'lucide-react';
import type { Post } from '../../types';
import { PLATFORM_CONFIG, STATUS_CONFIG } from '../../utils/constants';

interface PostCardProps {
  post: Post;
  onClick: () => void;
  imageCount?: number;
}

export function PostCard({ post, onClick, imageCount }: PostCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post.id, data: { post } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const platform = PLATFORM_CONFIG[post.platform];
  const status = STATUS_CONFIG[post.status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer transition-all overflow-hidden"
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: platform.color }}
      />
      <div className="pl-3.5 pr-3 py-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{ color: platform.color, backgroundColor: platform.bg }}
          >
            {platform.label}
          </span>
          {post.scheduledTime && (
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              {post.scheduledTime}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium leading-snug line-clamp-2 mb-1.5">
          {post.title || 'Без заголовка'}
        </p>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ color: status.color, backgroundColor: status.bg }}
          >
            {status.emoji} {status.label}
          </span>
          {post.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
          {post.tags.length > 2 && (
            <span className="text-[10px] text-gray-400">+{post.tags.length - 2}</span>
          )}
          {!!imageCount && (
            <span className="text-[10px] inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 ml-auto">
              <ImageIcon size={10} /> {imageCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
