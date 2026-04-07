import { useState, useEffect } from 'react';
import { getImageCounts, onImagesChange } from '../utils/imageStore';

export function usePostImageCounts(): Map<string, number> {
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await getImageCounts();
        if (!cancelled) setCounts(result);
      } catch (err) {
        console.error('Failed to load image counts:', err);
      }
    }

    load();
    const unsub = onImagesChange(() => load());
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return counts;
}
