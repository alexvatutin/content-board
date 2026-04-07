import { useState, useEffect, useCallback } from 'react';
import { getImagesByPostIds, onImagesChange, type StoredImage } from '../utils/imageStore';

export interface PreviewImageWithUrl {
  id: string;
  postId: string;
  order: number;
  filename: string;
  mimeType: string;
  thumbnailUrl: string;
  fullUrl: string;
}

export function usePreviewImages(postIds: string[]): {
  imagesByPostId: Map<string, PreviewImageWithUrl[]>;
  loading: boolean;
} {
  const [imagesByPostId, setImagesByPostId] = useState<Map<string, PreviewImageWithUrl[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const postIdsKey = postIds.join(',');

  const loadImages = useCallback(async () => {
    if (postIds.length === 0) {
      setImagesByPostId(new Map());
      return;
    }
    setLoading(true);
    try {
      const stored = await getImagesByPostIds(postIds);
      const mapped = new Map<string, PreviewImageWithUrl[]>();
      stored.forEach((images: StoredImage[], postId: string) => {
        mapped.set(
          postId,
          images.map((img) => ({
            id: img.id,
            postId: img.postId,
            order: img.order,
            filename: img.filename,
            mimeType: img.mimeType,
            thumbnailUrl: img.thumbnailUrl,
            fullUrl: img.fullUrl,
          }))
        );
      });
      setImagesByPostId(mapped);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postIdsKey]);

  useEffect(() => {
    loadImages();
    const unsub = onImagesChange(() => loadImages());
    return () => { unsub(); };
  }, [loadImages]);

  return { imagesByPostId, loading };
}
