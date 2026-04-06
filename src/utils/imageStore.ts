import type { PostImage } from '../types';

const DB_NAME = 'content-board-images';
const DB_VERSION = 1;
const STORE_NAME = 'images';

type ChangeListener = () => void;
const listeners: Set<ChangeListener> = new Set();

export function onImagesChange(fn: ChangeListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notifyChange() {
  listeners.forEach((fn) => fn());
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('postId', 'postId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function generateThumbnail(blob: Blob, maxWidth = 200): Promise<Blob> {
  const img = await createImageBitmap(blob);
  const scale = Math.min(1, maxWidth / img.width);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  img.close();
  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });
}

export interface StoredImage extends PostImage {
  blob: Blob;
  thumbnailBlob: Blob;
}

export async function addImage(
  postId: string,
  file: File,
  order: number
): Promise<PostImage> {
  const blob = file.slice();
  const thumbnailBlob = await generateThumbnail(blob);
  const record: StoredImage = {
    id: crypto.randomUUID(),
    postId,
    order,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    blob,
    thumbnailBlob,
    createdAt: new Date().toISOString(),
  };
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  notifyChange();
  const { blob: _b, thumbnailBlob: _t, ...meta } = record;
  return meta;
}

export async function getImagesByPostId(postId: string): Promise<StoredImage[]> {
  const db = await openDB();
  const results = await new Promise<StoredImage[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const idx = tx.objectStore(STORE_NAME).index('postId');
    const req = idx.getAll(postId);
    req.onsuccess = () => resolve(req.result as StoredImage[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return results.sort((a, b) => a.order - b.order);
}

export async function deleteImage(imageId: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(imageId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  notifyChange();
}

export async function deleteImagesByPostId(postId: string): Promise<void> {
  const images = await getImagesByPostId(postId);
  if (images.length === 0) return;
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const img of images) {
      store.delete(img.id);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  notifyChange();
}

export async function reorderImages(postId: string, orderedIds: string[]): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    orderedIds.forEach((id, index) => {
      const req = store.get(id);
      req.onsuccess = () => {
        const record = req.result;
        if (record && record.postId === postId) {
          record.order = index;
          store.put(record);
        }
      };
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  notifyChange();
}

export async function getImageCounts(): Promise<Map<string, number>> {
  const db = await openDB();
  const counts = new Map<string, number>();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        const pid = (cursor.value as StoredImage).postId;
        counts.set(pid, (counts.get(pid) || 0) + 1);
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return counts;
}

export async function getAllImages(): Promise<StoredImage[]> {
  const db = await openDB();
  const results = await new Promise<StoredImage[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as StoredImage[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return results;
}

export async function addImageFromBlob(
  postId: string,
  blob: Blob,
  filename: string,
  mimeType: string,
  order: number
): Promise<void> {
  const thumbnailBlob = await generateThumbnail(blob);
  const record: StoredImage = {
    id: crypto.randomUUID(),
    postId,
    order,
    filename,
    mimeType,
    size: blob.size,
    blob,
    thumbnailBlob,
    createdAt: new Date().toISOString(),
  };
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  notifyChange();
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
