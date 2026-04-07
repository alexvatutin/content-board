import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchPosts,
  createPostApi,
  updatePostApi,
  deletePostApi,
  batchInsertPosts,
  deleteAllPosts,
} from '../lib/postsApi';
import { deleteImagesByPostId } from '../utils/imageStore';
import type { Post, SocialPlatform, PostStatus, ContentFormat } from '../types';

function generateId(): string {
  return crypto.randomUUID();
}

const CACHE_KEY = 'content-board-cache';

function getCachedPosts(userId: string): Post[] {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}-${userId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

function setCachedPosts(userId: string, posts: Post[]) {
  try {
    localStorage.setItem(`${CACHE_KEY}-${userId}`, JSON.stringify(posts));
  } catch { /* quota exceeded — ignore */ }
}

export function usePosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(() =>
    user ? getCachedPosts(user.id) : []
  );
  const [loaded, setLoaded] = useState(false);

  // Reset state when user changes
  const userId = user?.id;
  const prevUserIdRef = useRef(userId);
  if (prevUserIdRef.current !== userId) {
    prevUserIdRef.current = userId;
    if (!userId) {
      setPosts([]);
      setLoaded(false);
    } else {
      const cached = getCachedPosts(userId);
      setPosts(cached);
      setLoaded(cached.length > 0);
    }
  }

  // Fetch fresh data from Supabase
  useEffect(() => {
    if (!user) return;
    // Fetch fresh data from Supabase in background
    let cancelled = false;
    fetchPosts(user.id).then((data) => {
      if (!cancelled) {
        setPosts(data);
        setCachedPosts(user.id, data);
        setLoaded(true);
      }
    }).catch((err) => {
      console.error('Failed to fetch posts:', err);
      if (!cancelled) setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [user]);

  const createPost = useCallback((partial: Partial<Post> & { scheduledDate: string }) => {
    if (!user) throw new Error('Not authenticated');
    const now = new Date().toISOString();
    const newPost: Post = {
      id: generateId(),
      title: partial.title || '',
      content: partial.content || '',
      platform: partial.platform || ('telegram' as SocialPlatform),
      format: partial.format || ('post' as ContentFormat),
      scheduledDate: partial.scheduledDate,
      scheduledTime: partial.scheduledTime || '12:00',
      status: partial.status || ('idea' as PostStatus),
      tags: partial.tags || [],
      notes: partial.notes || '',
      createdAt: now,
      updatedAt: now,
    };
    // Optimistic update
    setPosts((prev) => [...prev, newPost]);
    createPostApi(user.id, newPost).catch((err) => {
      console.error('Failed to create post:', err);
      // Rollback
      setPosts((prev) => prev.filter((p) => p.id !== newPost.id));
    });
    return newPost;
  }, [user]);

  const updatePost = useCallback((id: string, updates: Partial<Post>) => {
    const updatedAt = new Date().toISOString();
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt } : p
      )
    );
    updatePostApi(id, updates).catch((err) => {
      console.error('Failed to update post:', err);
    });
  }, []);

  const deletePost = useCallback((id: string) => {
    // Optimistic update
    setPosts((prev) => prev.filter((p) => p.id !== id));
    deletePostApi(id).catch((err) => {
      console.error('Failed to delete post:', err);
    });
    deleteImagesByPostId(id);
  }, []);

  const duplicatePost = useCallback((id: string) => {
    if (!user) return;
    setPosts((prev) => {
      const source = prev.find((p) => p.id === id);
      if (!source) return prev;
      const now = new Date().toISOString();
      const copy: Post = {
        ...source,
        id: generateId(),
        scheduledDate: '',
        scheduledTime: '12:00',
        status: 'idea',
        publishedUrl: undefined,
        metrics: undefined,
        createdAt: now,
        updatedAt: now,
      };
      createPostApi(user.id, copy).catch((err) => {
        console.error('Failed to duplicate post:', err);
        setPosts((prev) => prev.filter((p) => p.id !== copy.id));
      });
      return [...prev, copy];
    });
  }, [user]);

  const movePost = useCallback((id: string, newDate: string) => {
    updatePost(id, { scheduledDate: newDate });
  }, [updatePost]);

  const importPosts = useCallback((imported: Post[], replace: boolean) => {
    if (!user) return;
    // Ensure all IDs are valid UUIDs (imported files may have numeric IDs)
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const fixed = imported.map((p) => ({
      ...p,
      id: UUID_RE.test(p.id) ? p.id : crypto.randomUUID(),
    }));
    if (replace) {
      setPosts(fixed);
      // Delete all existing then batch insert
      deleteAllPosts(user.id)
        .then(() => batchInsertPosts(user.id, fixed))
        .catch((err) => console.error('Failed to import posts:', err));
    } else {
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newPosts = fixed.filter((p) => !existingIds.has(p.id));
        batchInsertPosts(user.id, newPosts).catch((err) =>
          console.error('Failed to import posts:', err)
        );
        return [...prev, ...newPosts];
      });
    }
  }, [user]);

  // Keep local cache in sync for instant load on next visit
  useEffect(() => {
    if (user && loaded) {
      setCachedPosts(user.id, posts);
    }
  }, [user, loaded, posts]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [posts]);

  return {
    posts,
    loaded,
    createPost,
    updatePost,
    deletePost,
    duplicatePost,
    movePost,
    importPosts,
    allTags,
  };
}
