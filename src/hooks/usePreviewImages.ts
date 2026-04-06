import { useState, useEffect, useRef, useCallback } from 'react';
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
  const urlsRef = useRef<string[]>([]);
  const postIdsKey = postIds.join(',');

  const revokeUrls = useCallback(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
  }, []);

  const loadImages = useCallback(async () => {
    if (postIds.length === 0) {
      revokeUrls();
      setImagesByPostId(new Map());
      return;
    }
    setLoading(true);
    try {
      const stored = await getImagesByPostIds(postIds);
      revokeUrls();
      const mapped = new Map<string, PreviewImageWithUrl[]>();
      stored.forEach((images: StoredImage[], postId: string) => {
        mapped.set(
          postId,
          images.map((img) => {
            const thumbUrl = URL.createObjectURL(img.thumbnailBlob);
            const fullUrl = URL.createObjectURL(img.blob);
            urlsRef.current.push(thumbUrl, fullUrl);
            return {
              id: img.id,
              postId: img.postId,
              order: img.order,
              filename: img.filename,
              mimeType: img.mimeType,
              thumbnailUrl: thumbUrl,
              fullUrl: fullUrl,
            };
          })
        );
      });
      setImagesByPostId(mapped);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postIdsKey, revokeUrls]);

  useEffect(() => {
    loadImages();
    const unsub = onImagesChange(() => loadImages());
    return () => {
      unsub();
      revokeUrls();
    };
  }, [loadImages, revokeUrls]);

  return { imagesByPostId, loading };
}
