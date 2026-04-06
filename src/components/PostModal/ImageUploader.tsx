import { useState, useRef, useCallback } from 'react';
import { ImagePlus, X, AlertTriangle, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePostImages, type ImageWithUrl } from '../../hooks/usePostImages';
import { ImagePreview } from './ImagePreview';
import type { SocialPlatform, ContentFormat } from '../../types';
import { MAX_FILE_SIZE } from '../../utils/imageConstraints';

interface ImageUploaderProps {
  postId: string;
  platform: SocialPlatform;
  format: ContentFormat;
}

export function ImageUploader({ postId, platform, format }: ImageUploaderProps) {
  const {
    images,
    loading,
    addImages,
    removeImage,
    reorderImages,
    maxImages,
    canAddMore,
    remainingSlots,
    overLimit,
  } = usePostImages(postId, platform, format);

  const [dragOver, setDragOver] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const valid = Array.from(files).filter(
        (f) => f.type.startsWith('image/') && f.size <= MAX_FILE_SIZE
      );
      if (valid.length > 0) await addImages(valid);
    },
    [addImages]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newOrder = [...images];
      const [moved] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, moved);
      reorderImages(newOrder.map((img) => img.id));
    },
    [images, reorderImages]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Изображения
        </label>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {images.length} / {maxImages}
        </span>
      </div>

      {overLimit && (
        <div className="flex items-center gap-1.5 mb-2 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle size={13} />
          <span>
            Для этой платформы/формата допустимо не более {maxImages} фото. Удалите лишние.
          </span>
        </div>
      )}

      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {images.map((img, idx) => (
                <SortableThumb
                  key={img.id}
                  image={img}
                  onRemove={() => removeImage(img.id)}
                  onPreview={() => setPreviewIndex(idx)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {canAddMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          <ImagePlus size={20} className="text-gray-400 dark:text-gray-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {loading ? 'Загрузка...' : `Добавить фото (ещё ${remainingSlots})`}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {previewIndex !== null && (
        <ImagePreview
          images={images}
          currentIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
          onNavigate={setPreviewIndex}
        />
      )}
    </div>
  );
}

function SortableThumb({
  image,
  onRemove,
  onPreview,
}: {
  image: ImageWithUrl;
  onRemove: () => void;
  onPreview: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
    >
      <img
        src={image.thumbnailUrl}
        alt={image.filename}
        className="w-full h-full object-cover cursor-pointer"
        onClick={onPreview}
      />
      <div
        {...attributes}
        {...listeners}
        className="absolute top-0.5 left-0.5 p-0.5 bg-black/40 rounded text-white/70 hover:text-white cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={12} />
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-0.5 right-0.5 p-0.5 bg-black/40 rounded-full text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={12} />
      </button>
    </div>
  );
}
