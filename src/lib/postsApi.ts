import { supabase } from './supabase';
import type { Post } from '../types';

// ── snake_case ↔ camelCase mapping ──────────────────────

interface PostRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  platform: string;
  format: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  tags: string[];
  published_url: string | null;
  metrics: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function rowToPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    platform: row.platform as Post['platform'],
    format: row.format as Post['format'],
    scheduledDate: row.scheduled_date,
    scheduledTime: row.scheduled_time,
    status: row.status as Post['status'],
    tags: row.tags ?? [],
    publishedUrl: row.published_url ?? undefined,
    metrics: row.metrics as Post['metrics'],
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ensureUUID(id: string | undefined): string {
  if (id && UUID_RE.test(id)) return id;
  return crypto.randomUUID();
}

function postToRow(post: Partial<Post>, userId?: string): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (userId !== undefined) row.user_id = userId;
  if (post.id !== undefined) row.id = ensureUUID(post.id);
  if (post.title !== undefined) row.title = post.title;
  if (post.content !== undefined) row.content = post.content;
  if (post.platform !== undefined) row.platform = post.platform;
  if (post.format !== undefined) row.format = post.format;
  if (post.scheduledDate !== undefined) row.scheduled_date = post.scheduledDate;
  if (post.scheduledTime !== undefined) row.scheduled_time = post.scheduledTime;
  if (post.status !== undefined) row.status = post.status;
  if (post.tags !== undefined) row.tags = post.tags;
  if (post.publishedUrl !== undefined) row.published_url = post.publishedUrl || null;
  if (post.metrics !== undefined) row.metrics = post.metrics || null;
  if (post.notes !== undefined) row.notes = post.notes || null;
  if (post.createdAt !== undefined) row.created_at = post.createdAt;
  if (post.updatedAt !== undefined) row.updated_at = post.updatedAt;
  return row;
}

// ── API functions ───────────────────────────────────────

export async function fetchPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_date')
    .order('scheduled_time');

  if (error) throw error;
  return (data as PostRow[]).map(rowToPost);
}

export async function createPostApi(userId: string, post: Post): Promise<Post> {
  const row = postToRow(post, userId);
  const { data, error } = await supabase
    .from('posts')
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return rowToPost(data as PostRow);
}

export async function updatePostApi(id: string, updates: Partial<Post>): Promise<void> {
  const row = postToRow({ ...updates, updatedAt: new Date().toISOString() });
  const { error } = await supabase
    .from('posts')
    .update(row)
    .eq('id', id);

  if (error) throw error;
}

export async function deletePostApi(id: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function batchInsertPosts(userId: string, posts: Post[]): Promise<void> {
  if (posts.length === 0) return;
  const fixedPosts = posts.map((p) => ({ ...p, id: ensureUUID(p.id) }));
  const rows = fixedPosts.map((p) => postToRow(p, userId));

  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase
      .from('posts')
      .upsert(batch, { onConflict: 'id' });

    if (error) throw error;
  }
}

export async function deleteAllPosts(userId: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}
