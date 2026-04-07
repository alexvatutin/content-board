import { useState, useEffect, useCallback } from 'react';
import type { SocialPlatform, ContentFormat } from '../types';
import { getMaxImages, MAX_FILE_SIZE } from '../utils/imageConstraints';
import {
  getImagesByPostId,
  addImage,
  deleteImage,
  reorderImages as reorderInStore,
  onImagesChange,
  type StoredImage,
} from '../utils/imageStore';

export interface ImageWithUrl {
  id: string;
  postId: string;
  order: number;
  filename: string;
  mimeType: string;
  size: number;
  thumbnailUrl: string;
  fullUrl: string;
  createdAt: string;
}

export function usePostImages(
  postId: string | null,
  platform: SocialPlatform,
  format: ContentFormat
) {
  const [images, setImages] = useState<ImageWithUrl[]>([]);
  const [loading, setLoading] = useState(false);

  const maxImages = getMaxImages(platform, format);
  const canAddMore = images.length < maxImages;
  const remainingSlots = Math.max(0, maxImages - images.length);
  const overLimit = images.length > maxImages;

  const loadImages = useCallback(async () => {
    if (!postId) {
      setImages([]);
      return;
    }
    setLoading(true);
    try {
      const stored = await getImagesByPostId(postId);
      const mapped = stored.map((img: StoredImage) => ({
        id: img.id,
        postId: img.postId,
        order: img.order,
        filename: img.filename,
        mimeType: img.mimeType,
        size: img.size,
        thumbnailUrl: img.thumbnailUrl,
        fullUrl: img.fullUrl,
        createdAt: img.createdAt,
      }));
      setImages(mapped);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadImages();
    const unsub = onImagesChange(() => loadImages());
    return () => { unsub(); };
  }, [loadImages]);

  const addImages = useCallback(
    async (files: File[]) => {
      if (!postId) return;
      const currentCount = images.length;
      const slotsLeft = Math.max(0, maxImages - currentCount);
      const toAdd = files.slice(0, slotsLeft);

      for (let i = 0; i < toAdd.length; i++) {
        const file = toAdd[i];
        if (!file.type.startsWith('image/')) continue;
        if (file.size > MAX_FILE_SIZE) continue;
        await addImage(postId, file, currentCount + i);
      }
    },
    [postId, images.length, maxImages]
  );

  const removeImage = useCallback(async (imageId: string) => {
    await deleteImage(imageId);
  }, []);

  const reorderImagesAction = useCallback(
    async (orderedIds: string[]) => {
      if (!postId) return;
      await reorderInStore(postId, orderedIds);
    },
    [postId]
  );

  return {
    images,
    loading,
    addImages,
    removeImage,
    reorderImages: reorderImagesAction,
    maxImages,
    canAddMore,
    remainingSlots,
    overLimit,
  };
}
