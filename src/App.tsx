import { useState, useEffect, useCallback } from 'react';
import { usePosts } from './hooks/usePosts';
import { useFilters } from './hooks/useFilters';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Sidebar } from './components/Layout/Sidebar';
import { FilterBar } from './components/Layout/FilterBar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { BoardView } from './components/Board/BoardView';
import { PostModal } from './components/PostModal/PostModal';
import { ImportModal } from './components/ImportModal/ImportModal';
import { ListView } from './components/ListView/ListView';
import { Analytics } from './components/Analytics/Analytics';
import { exportToJSON } from './utils/export';
import { toISODate } from './utils/dateUtils';
import type { Post, ViewMode } from './types';

export default function App() {
  const { posts, createPost, updatePost, deletePost, duplicatePost, movePost, importPosts, allTags } = usePosts();
  const { filters, setFilter, setDateRange, resetFilters, filteredPosts, hasActiveFilters } = useFilters(posts);
  const [view, setView] = useLocalStorage<ViewMode>('content-board-view', 'dashboard');
  const [dark, setDark] = useLocalStorage<boolean>('content-board-dark', true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleAddPost(toISODate(new Date()));
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  function handlePostClick(post: Post) {
    setSelectedPost(post);
    setModalOpen(true);
  }

  function handleAddPost(date: string) {
    const newPost = createPost({ scheduledDate: date });
    setSelectedPost(newPost);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedPost(null);
  }

  function handleExport() {
    exportToJSON(posts);
  }

  const handleImport = useCallback(() => {
    setImportModalOpen(true);
  }, []);

  return (
    <div className="h-screen flex flex-row bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <Sidebar
        view={view}
        onViewChange={setView}
        onExport={handleExport}
        onImport={handleImport}
        dark={dark}
        onToggleTheme={() => setDark(!dark)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {(view === 'board' || view === 'list') && (
          <FilterBar
            filters={filters}
            view={view}
            onFilterChange={setFilter}
            onDateRangeChange={setDateRange}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
            allTags={allTags}
          />
        )}

        <main className="flex-1 min-h-0 overflow-auto">
          {view === 'dashboard' && (
            <Dashboard posts={posts} onPostClick={handlePostClick} />
          )}
          {view === 'board' && (
            <BoardView
              posts={filteredPosts}
              onPostClick={handlePostClick}
              onAddPost={handleAddPost}
              onMovePost={movePost}
            />
          )}
          {view === 'list' && (
            <ListView posts={filteredPosts} onPostClick={handlePostClick} />
          )}
          {view === 'analytics' && (
            <Analytics posts={posts} />
          )}
        </main>
      </div>

      <PostModal
        post={selectedPost}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={updatePost}
        onDelete={deletePost}
        onDuplicate={duplicatePost}
        allTags={allTags}
      />

      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={importPosts}
      />
    </div>
  );
}
