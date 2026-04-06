import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Post, SocialPlatform, PostStatus, ContentFormat } from '../types';

function generateId(): string {
  return crypto.randomUUID();
}

export function usePosts() {
  const [posts, setPosts] = useLocalStorage<Post[]>('content-board-posts', []);

  const createPost = useCallback((partial: Partial<Post> & { scheduledDate: string }) => {
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
    setPosts((prev) => [...prev, newPost]);
    return newPost;
  }, [setPosts]);

  const updatePost = useCallback((id: string, updates: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
  }, [setPosts]);

  const deletePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, [setPosts]);

  const duplicatePost = useCallback((id: string) => {
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
      return [...prev, copy];
    });
  }, [setPosts]);

  const movePost = useCallback((id: string, newDate: string) => {
    updatePost(id, { scheduledDate: newDate });
  }, [updatePost]);

  const importPosts = useCallback((imported: Post[], replace: boolean) => {
    if (replace) {
      setPosts(imported);
    } else {
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newPosts = imported.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
    }
  }, [setPosts]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [posts]);

  return {
    posts,
    createPost,
    updatePost,
    deletePost,
    duplicatePost,
    movePost,
    importPosts,
    allTags,
  };
}
