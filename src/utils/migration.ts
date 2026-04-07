import { supabase } from '../lib/supabase';
import type { Post } from '../types';

const MIGRATION_KEY = 'content-board-migration-done';
const POSTS_KEY = 'content-board-posts';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ensureUUID(id: string | undefined): string {
  if (id && UUID_RE.test(id)) return id;
  return crypto.randomUUID();
}

interface OldStoredImage {
  id: string;
  postId: string;
  order: number;
  filename: string;
  mimeType: string;
  size: number;
  blob: Blob;
  thumbnailBlob: Blob;
  createdAt: string;
}

function openOldDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('content-board-images', 1);
      req.onupgradeneeded = () => {
        req.result.close();
        indexedDB.deleteDatabase('content-board-images');
        resolve(null);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function getOldImages(): Promise<OldStoredImage[]> {
  const db = await openOldDB();
  if (!db) return [];
  try {
    return await new Promise<OldStoredImage[]>((resolve, reject) => {
      const tx = db.transaction('images', 'readonly');
      const req = tx.objectStore('images').getAll();
      req.onsuccess = () => resolve(req.result as OldStoredImage[]);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  } finally {
    db.close();
  }
}

export function needsMigration(): boolean {
  if (localStorage.getItem(MIGRATION_KEY) === 'true') return false;
  const postsRaw = localStorage.getItem(POSTS_KEY);
  if (!postsRaw) return false;
  try {
    const posts = JSON.parse(postsRaw);
    return Array.isArray(posts) && posts.length > 0;
  } catch {
    return false;
  }
}

function cleanupLocal() {
  localStorage.setItem(MIGRATION_KEY, 'true');
  localStorage.removeItem(POSTS_KEY);
  try {
    indexedDB.deleteDatabase('content-board-images');
  } catch { /* ignore */ }
}

export interface MigrationProgress {
  phase: 'posts' | 'images' | 'done';
  current: number;
  total: number;
}

export async function migrateToSupabase(
  userId: string,
  onProgress?: (p: MigrationProgress) => void
): Promise<{ postCount: number; imageCount: number }> {
  const postsRaw = localStorage.getItem(POSTS_KEY);
  const posts: Post[] = postsRaw ? JSON.parse(postsRaw) : [];

  // Build a map of old ID → new UUID for non-UUID IDs
  const idMap = new Map<string, string>();
  for (const p of posts) {
    const newId = ensureUUID(p.id);
    idMap.set(p.id, newId);
  }

  try {
    // 1. Migrate posts
    if (posts.length > 0) {
      const rows = posts.map((p) => ({
        id: idMap.get(p.id)!,
        user_id: userId,
        title: p.title,
        content: p.content,
        platform: p.platform,
        format: p.format,
        scheduled_date: p.scheduledDate,
        scheduled_time: p.scheduledTime,
        status: p.status,
        tags: p.tags,
        published_url: p.publishedUrl || null,
        metrics: p.metrics || null,
        notes: p.notes || null,
        created_at: p.createdAt,
        updated_at: p.updatedAt,
      }));

      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50);
        const { error } = await supabase.from('posts').upsert(batch, { onConflict: 'id' });
        if (error) throw error;
        onProgress?.({ phase: 'posts', current: Math.min(i + 50, rows.length), total: rows.length });
      }
    }

    // 2. Migrate images (use mapped post IDs)
    const oldImages = await getOldImages();
    let imageCount = 0;

    for (let i = 0; i < oldImages.length; i++) {
      const img = oldImages[i];
      const mappedPostId = idMap.get(img.postId) || ensureUUID(img.postId);
      const imgId = ensureUUID(img.id);
      const ext = img.filename.split('.').pop() || 'jpg';
      const storagePath = `${userId}/${mappedPostId}/${imgId}.${ext}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(storagePath, img.blob, { contentType: img.mimeType });
        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from('post_images').upsert({
          id: imgId,
          post_id: mappedPostId,
          user_id: userId,
          order: img.order,
          filename: img.filename,
          mime_type: img.mimeType,
          size: img.size,
          storage_path: storagePath,
          created_at: img.createdAt,
        }, { onConflict: 'id' });
        if (dbError) throw dbError;
        imageCount++;
      } catch (err) {
        console.warn(`Failed to migrate image ${img.id}:`, err);
      }
      onProgress?.({ phase: 'images', current: i + 1, total: oldImages.length });
    }

    onProgress?.({ phase: 'done', current: 0, total: 0 });
    return { postCount: posts.length, imageCount };
  } finally {
    // Always clean up localStorage — even on failure, don't retry forever
    cleanupLocal();
  }
}
