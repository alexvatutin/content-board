-- Content Board: Supabase Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- ── Posts table ──────────────────────────────────────────
create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null default '',
  content text not null default '',
  platform text not null default 'telegram',
  format text not null default 'post',
  scheduled_date text not null default '',
  scheduled_time text not null default '12:00',
  status text not null default 'idea',
  tags text[] not null default '{}',
  published_url text,
  metrics jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Image metadata table ─────────────────────────────────
create table post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  "order" int not null default 0,
  filename text not null,
  mime_type text not null,
  size int not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- ── Row Level Security ───────────────────────────────────
alter table posts enable row level security;
create policy "Users manage own posts" on posts
  for all using (auth.uid() = user_id);

alter table post_images enable row level security;
create policy "Users manage own images" on post_images
  for all using (auth.uid() = user_id);

-- ── Storage bucket ───────────────────────────────────────
-- Create a bucket named 'post-images' in Supabase Dashboard > Storage
-- Then add this policy:
--
-- Bucket: post-images
-- Policy name: Users manage own images
-- Allowed operation: SELECT, INSERT, UPDATE, DELETE
-- Policy:
--   (bucket_id = 'post-images') AND (auth.uid()::text = (storage.foldername(name))[1])
--
-- This ensures users can only access files under their own user_id/ prefix.

-- ── Indexes (optional, for performance) ──────────────────
create index idx_posts_user_id on posts(user_id);
create index idx_posts_scheduled_date on posts(user_id, scheduled_date);
create index idx_post_images_post_id on post_images(post_id);
create index idx_post_images_user_id on post_images(user_id);
