import { useState, useEffect } from 'react';
import { getImageCounts, onImagesChange } from '../utils/imageStore';

export function usePostImageCounts(): Map<string, number> {
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await getImageCounts();
      if (!cancelled) setCounts(result);
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
