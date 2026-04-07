import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { Post, PostMetrics, SocialPlatform, PostStatus, ContentFormat } from '../types';
import { format } from 'date-fns';
import {
  getImagesByPostId,
  fetchImageBlob,
  blobToDataUrl,
  dataUrlToBlob,
  addImageFromBlob,
  getImageCounts,
} from './imageStore';

// ── Helpers ──────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function dateSuffix() {
  return format(new Date(), 'yyyy-MM-dd');
}

// ── Flat row mapping ─────────────────────────────────────

const FLAT_COLUMNS = [
  'id', 'title', 'content', 'platform', 'format',
  'scheduledDate', 'scheduledTime', 'status', 'tags',
  'publishedUrl', 'notes', 'createdAt', 'updatedAt',
  'imageCount',
  'metrics_reach', 'metrics_impressions', 'metrics_likes',
  'metrics_comments', 'metrics_shares', 'metrics_saves',
  'metrics_linkClicks', 'metrics_followsGained', 'metrics_custom',
] as const;

type FlatRow = Record<string, string | number | undefined>;

function postToFlatRow(post: Post, imageCount = 0): FlatRow {
  const row: FlatRow = {
    id: post.id,
    title: post.title,
    content: post.content,
    platform: post.platform,
    format: post.format,
    scheduledDate: post.scheduledDate,
    scheduledTime: post.scheduledTime,
    status: post.status,
    tags: post.tags.join(', '),
    publishedUrl: post.publishedUrl || '',
    notes: post.notes || '',
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    imageCount,
    metrics_reach: post.metrics?.reach,
    metrics_impressions: post.metrics?.impressions,
    metrics_likes: post.metrics?.likes,
    metrics_comments: post.metrics?.comments,
    metrics_shares: post.metrics?.shares,
    metrics_saves: post.metrics?.saves,
    metrics_linkClicks: post.metrics?.linkClicks,
    metrics_followsGained: post.metrics?.followsGained,
    metrics_custom: post.metrics?.custom?.length
      ? JSON.stringify(post.metrics.custom)
      : '',
  };
  return row;
}

// ── Alias maps for flexible import ──────────────────────

const PLATFORM_ALIASES: Record<string, SocialPlatform> = {
  instagram: 'instagram', ig: 'instagram', insta: 'instagram', инстаграм: 'instagram',
  telegram: 'telegram', tg: 'telegram', телеграм: 'telegram',
  youtube: 'youtube', yt: 'youtube', ютуб: 'youtube',
  tiktok: 'tiktok', тикток: 'tiktok',
  linkedin: 'linkedin',
  facebook: 'facebook', fb: 'facebook', фейсбук: 'facebook',
  twitter: 'twitter', x: 'twitter', 'twitter/x': 'twitter', 'x/twitter': 'twitter',
  threads: 'threads', тредс: 'threads',
  vk: 'vk', вк: 'vk', вконтакте: 'vk',
  other: 'other', другое: 'other',
};

const STATUS_ALIASES: Record<string, PostStatus> = {
  idea: 'idea', идея: 'idea',
  draft: 'draft', черновик: 'draft',
  review: 'review', 'на согласовании': 'review', согласование: 'review',
  ready: 'ready', готов: 'ready', 'готов к публикации': 'ready',
  published: 'published', опубликован: 'published',
  cancelled: 'cancelled', отменён: 'cancelled', отменен: 'cancelled',
};

const FORMAT_ALIASES: Record<string, ContentFormat> = {
  post: 'post', пост: 'post',
  stories: 'stories', reels: 'stories', 'stories/reels': 'stories',
  video: 'video', видео: 'video',
  carousel: 'carousel', карусель: 'carousel',
  article: 'article', статья: 'article',
  poll: 'poll', опрос: 'poll',
  other: 'other', другое: 'other',
};

function normalizePlatform(raw: string | undefined): SocialPlatform {
  if (!raw) return 'other';
  return PLATFORM_ALIASES[raw.trim().toLowerCase()] ?? 'other';
}

function normalizeStatus(raw: string | undefined): PostStatus {
  if (!raw) return 'idea';
  return STATUS_ALIASES[raw.trim().toLowerCase()] ?? 'idea';
}

function normalizeFormat(raw: string | undefined): ContentFormat {
  if (!raw) return 'post';
  return FORMAT_ALIASES[raw.trim().toLowerCase()] ?? 'post';
}

function flatRowToPost(row: Record<string, string>): Post {
  const now = new Date().toISOString();

  const platform = normalizePlatform(row.platform);
  const status = normalizeStatus(row.status);
  const fmt = normalizeFormat(row.format);

  const parseNum = (v: string | undefined) => {
    if (!v || v.trim() === '') return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  };

  let customMetrics: Array<{ name: string; value: number }> | undefined;
  if (row.metrics_custom && row.metrics_custom.trim()) {
    try {
      customMetrics = JSON.parse(row.metrics_custom);
    } catch { /* ignore */ }
  }

  const metrics: PostMetrics = {};
  const reach = parseNum(row.metrics_reach);
  const impressions = parseNum(row.metrics_impressions);
  const likes = parseNum(row.metrics_likes);
  const comments = parseNum(row.metrics_comments);
  const shares = parseNum(row.metrics_shares);
  const saves = parseNum(row.metrics_saves);
  const linkClicks = parseNum(row.metrics_linkClicks);
  const followsGained = parseNum(row.metrics_followsGained);

  if (reach !== undefined) metrics.reach = reach;
  if (impressions !== undefined) metrics.impressions = impressions;
  if (likes !== undefined) metrics.likes = likes;
  if (comments !== undefined) metrics.comments = comments;
  if (shares !== undefined) metrics.shares = shares;
  if (saves !== undefined) metrics.saves = saves;
  if (linkClicks !== undefined) metrics.linkClicks = linkClicks;
  if (followsGained !== undefined) metrics.followsGained = followsGained;
  if (customMetrics?.length) metrics.custom = customMetrics;

  const hasMetrics = Object.keys(metrics).length > 0;

  return {
    id: row.id?.trim() || crypto.randomUUID(),
    title: row.title || '',
    content: row.content || '',
    platform,
    format: fmt,
    scheduledDate: row.scheduledDate || '',
    scheduledTime: row.scheduledTime || '12:00',
    status,
    tags: row.tags
      ? row.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    publishedUrl: row.publishedUrl || undefined,
    notes: row.notes || undefined,
    metrics: hasMetrics ? metrics : undefined,
    createdAt: row.createdAt || now,
    updatedAt: row.updatedAt || now,
  };
}

// ── Template ─────────────────────────────────────────────

const TEMPLATE_ROW: FlatRow = {
  id: '',
  title: 'Пример заголовка',
  content: 'Текст поста',
  platform: 'telegram',
  format: 'post',
  scheduledDate: '2026-04-07',
  scheduledTime: '12:00',
  status: 'idea',
  tags: 'тег1, тег2',
  publishedUrl: '',
  notes: '',
  createdAt: '',
  updatedAt: '',
  imageCount: 0,
  metrics_reach: '',
  metrics_impressions: '',
  metrics_likes: '',
  metrics_comments: '',
  metrics_shares: '',
  metrics_saves: '',
  metrics_linkClicks: '',
  metrics_followsGained: '',
  metrics_custom: '',
};

export function downloadTemplate(fmt: 'json' | 'csv' | 'xlsx') {
  const filename = `content-plan-template.${fmt === 'xlsx' ? 'xlsx' : fmt}`;

  if (fmt === 'json') {
    const examplePost: Partial<Post> = {
      title: 'Пример заголовка',
      content: 'Текст поста',
      platform: 'telegram',
      format: 'post',
      scheduledDate: '2026-04-07',
      scheduledTime: '12:00',
      status: 'idea',
      tags: ['тег1', 'тег2'],
    };
    const blob = new Blob(
      [JSON.stringify([examplePost], null, 2)],
      { type: 'application/json' },
    );
    triggerDownload(blob, filename);
    return;
  }

  if (fmt === 'csv') {
    const csv = '\uFEFF' + Papa.unparse({
      fields: [...FLAT_COLUMNS],
      data: [FLAT_COLUMNS.map((col) => TEMPLATE_ROW[col] ?? '')],
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    triggerDownload(blob, filename);
    return;
  }

  // xlsx
  const ws = XLSX.utils.json_to_sheet([{ ...TEMPLATE_ROW }], {
    header: [...FLAT_COLUMNS],
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Content Plan');
  XLSX.writeFile(wb, filename);
}

// ── JSON ─────────────────────────────────────────────────

export async function exportToJSON(posts: Post[]): Promise<void> {
  const postsWithImages = [];
  for (const post of posts) {
    const images = await getImagesByPostId(post.id);
    const imageData = [];
    for (const img of images) {
      try {
        const blob = await fetchImageBlob(img.storagePath);
        const dataUrl = await blobToDataUrl(blob);
        imageData.push({
          id: img.id,
          order: img.order,
          filename: img.filename,
          mimeType: img.mimeType,
          dataUrl,
        });
      } catch {
        // Skip images that fail to download
      }
    }
    postsWithImages.push({
      ...post,
      ...(imageData.length > 0 ? { images: imageData } : {}),
    });
  }
  const data = JSON.stringify(postsWithImages, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  triggerDownload(blob, `content-plan-${dateSuffix()}.json`);
}

export async function importFromJSON(file: File): Promise<Post[]> {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error('Неверный формат файла');

  const posts: Post[] = [];
  for (const item of data) {
    const { images, ...post } = item;
    posts.push(post as Post);

    if (Array.isArray(images)) {
      for (const img of images) {
        if (img.dataUrl && img.filename) {
          const blob = dataUrlToBlob(img.dataUrl);
          await addImageFromBlob(
            post.id,
            blob,
            img.filename,
            img.mimeType || 'image/jpeg',
            img.order ?? 0
          );
        }
      }
    }
  }
  return posts;
}

// ── CSV ──────────────────────────────────────────────────

export async function exportToCSV(posts: Post[]): Promise<void> {
  const counts = await getImageCounts();
  const rows = posts.map((p) => postToFlatRow(p, counts.get(p.id) || 0));
  const csv = '\uFEFF' + Papa.unparse(rows, { columns: [...FLAT_COLUMNS] });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, `content-plan-${dateSuffix()}.csv`);
}

export function importFromCSV(file: File): Promise<Post[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = Papa.parse<Record<string, string>>(e.target?.result as string, {
          header: true,
          skipEmptyLines: true,
        });
        if (result.errors.length > 0) {
          reject(new Error(`Ошибка CSV: ${result.errors[0].message}`));
          return;
        }
        resolve(result.data.map(flatRowToPost));
      } catch {
        reject(new Error('Ошибка при чтении CSV файла'));
      }
    };
    reader.onerror = () => reject(new Error('Ошибка при чтении файла'));
    reader.readAsText(file);
  });
}

// ── Excel ────────────────────────────────────────────────

export async function exportToExcel(posts: Post[]): Promise<void> {
  const counts = await getImageCounts();
  const rows = posts.map((p) => postToFlatRow(p, counts.get(p.id) || 0));
  const ws = XLSX.utils.json_to_sheet(rows, { header: [...FLAT_COLUMNS] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Content Plan');
  XLSX.writeFile(wb, `content-plan-${dateSuffix()}.xlsx`);
}

export function importFromExcel(file: File): Promise<Post[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result as ArrayBuffer, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { raw: false });
        resolve(data.map(flatRowToPost));
      } catch {
        reject(new Error('Ошибка при чтении Excel файла'));
      }
    };
    reader.onerror = () => reject(new Error('Ошибка при чтении файла'));
    reader.readAsArrayBuffer(file);
  });
}

// ── Universal importer ───────────────────────────────────

export function importFromFile(file: File): Promise<Post[]> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'json': return importFromJSON(file);
    case 'csv': return importFromCSV(file);
    case 'xlsx': return importFromExcel(file);
    default: return Promise.reject(new Error('Неподдерживаемый формат файла. Используйте .json, .csv или .xlsx'));
  }
}
