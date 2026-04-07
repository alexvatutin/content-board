import { supabase } from '../lib/supabase';
import type { PostImage } from '../types';

type ChangeListener = () => void;
const listeners: Set<ChangeListener> = new Set();

export function onImagesChange(fn: ChangeListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notifyChange() {
  listeners.forEach((fn) => fn());
}

export interface StoredImage extends PostImage {
  storagePath: string;
  thumbnailUrl: string;
  fullUrl: string;
}

function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from('post-images').getPublicUrl(path);
  return data.publicUrl;
}

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

export async function addImage(
  postId: string,
  file: File,
  order: number
): Promise<PostImage> {
  const userId = await getCurrentUserId();
  const imageId = crypto.randomUUID();
  const ext = file.name.split('.').pop() || 'jpg';
  const storagePath = `${userId}/${postId}/${imageId}.${ext}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('post-images')
    .upload(storagePath, file, { contentType: file.type });
  if (uploadError) throw uploadError;

  // Insert metadata row
  const { error: dbError } = await supabase
    .from('post_images')
    .insert({
      id: imageId,
      post_id: postId,
      user_id: userId,
      order,
      filename: file.name,
      mime_type: file.type,
      size: file.size,
      storage_path: storagePath,
    });
  if (dbError) throw dbError;

  notifyChange();
  return {
    id: imageId,
    postId,
    order,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    createdAt: new Date().toISOString(),
  };
}

export async function getImagesByPostId(postId: string): Promise<StoredImage[]> {
  const { data, error } = await supabase
    .from('post_images')
    .select('*')
    .eq('post_id', postId)
    .order('order');

  if (error) throw error;
  if (!data || data.length === 0) return [];

  return data.map((row) => ({
    id: row.id,
    postId: row.post_id,
    order: row.order,
    filename: row.filename,
    mimeType: row.mime_type,
    size: row.size,
    storagePath: row.storage_path,
    createdAt: row.created_at,
    thumbnailUrl: getPublicUrl(row.storage_path),
    fullUrl: getPublicUrl(row.storage_path),
  }));
}

export async function deleteImage(imageId: string): Promise<void> {
  // Get the storage path first
  const { data: row, error: fetchError } = await supabase
    .from('post_images')
    .select('storage_path')
    .eq('id', imageId)
    .single();
  if (fetchError) throw fetchError;

  // Delete from storage
  if (row) {
    await supabase.storage.from('post-images').remove([row.storage_path]);
  }

  // Delete metadata
  const { error } = await supabase
    .from('post_images')
    .delete()
    .eq('id', imageId);
  if (error) throw error;

  notifyChange();
}

export async function deleteImagesByPostId(postId: string): Promise<void> {
  const { data: rows } = await supabase
    .from('post_images')
    .select('storage_path')
    .eq('post_id', postId);

  if (rows && rows.length > 0) {
    const paths = rows.map((r) => r.storage_path);
    await supabase.storage.from('post-images').remove(paths);
  }

  await supabase
    .from('post_images')
    .delete()
    .eq('post_id', postId);

  notifyChange();
}

export async function reorderImages(postId: string, orderedIds: string[]): Promise<void> {
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('post_images')
      .update({ order: index })
      .eq('id', id)
      .eq('post_id', postId)
  );
  await Promise.all(updates);
  notifyChange();
}

export async function getImageCounts(): Promise<Map<string, number>> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('post_images')
    .select('post_id')
    .eq('user_id', userId);

  if (error) throw error;
  const counts = new Map<string, number>();
  if (data) {
    for (const row of data) {
      counts.set(row.post_id, (counts.get(row.post_id) || 0) + 1);
    }
  }
  return counts;
}

export async function getImagesByPostIds(postIds: string[]): Promise<Map<string, StoredImage[]>> {
  const result = new Map<string, StoredImage[]>();
  if (postIds.length === 0) return result;
  postIds.forEach((id) => result.set(id, []));

  const { data, error } = await supabase
    .from('post_images')
    .select('*')
    .in('post_id', postIds)
    .order('order');

  if (error) throw error;
  if (data) {
    for (const row of data) {
      const img: StoredImage = {
        id: row.id,
        postId: row.post_id,
        order: row.order,
        filename: row.filename,
        mimeType: row.mime_type,
        size: row.size,
        storagePath: row.storage_path,
        createdAt: row.created_at,
        thumbnailUrl: getPublicUrl(row.storage_path),
        fullUrl: getPublicUrl(row.storage_path),
      };
      const list = result.get(row.post_id) ?? [];
      list.push(img);
      result.set(row.post_id, list);
    }
  }
  return result;
}

export async function getAllImages(): Promise<StoredImage[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('post_images')
    .select('*')
    .eq('user_id', userId)
    .order('order');

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    postId: row.post_id,
    order: row.order,
    filename: row.filename,
    mimeType: row.mime_type,
    size: row.size,
    storagePath: row.storage_path,
    createdAt: row.created_at,
    thumbnailUrl: getPublicUrl(row.storage_path),
    fullUrl: getPublicUrl(row.storage_path),
  }));
}

export async function addImageFromBlob(
  postId: string,
  blob: Blob,
  filename: string,
  mimeType: string,
  order: number
): Promise<void> {
  const userId = await getCurrentUserId();
  const imageId = crypto.randomUUID();
  const ext = filename.split('.').pop() || 'jpg';
  const storagePath = `${userId}/${postId}/${imageId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('post-images')
    .upload(storagePath, blob, { contentType: mimeType });
  if (uploadError) throw uploadError;

  const { error: dbError } = await supabase
    .from('post_images')
    .insert({
      id: imageId,
      post_id: postId,
      user_id: userId,
      order,
      filename,
      mime_type: mimeType,
      size: blob.size,
      storage_path: storagePath,
    });
  if (dbError) throw dbError;
  notifyChange();
}

// Helper for export — fetch image blob from storage URL
export async function fetchImageBlob(storagePath: string): Promise<Blob> {
  const { data, error } = await supabase.storage
    .from('post-images')
    .download(storagePath);
  if (error) throw error;
  return data;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }
  return new Blob([arr], { type: mime });
}
