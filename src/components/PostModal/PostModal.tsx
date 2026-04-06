import { useState, useEffect, useCallback } from 'react';
import { Copy, Trash2, Link, ClipboardCopy } from 'lucide-react';
import { Modal } from '../common/Modal';
import { MetricsSection } from './MetricsSection';
import { ImageUploader } from './ImageUploader';
import type { Post, SocialPlatform, PostStatus, ContentFormat } from '../../types';
import { PLATFORM_CONFIG, STATUS_CONFIG, FORMAT_CONFIG, PLATFORMS, STATUSES, FORMATS } from '../../utils/constants';

interface PostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Post>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  allTags: string[];
}

export function PostModal({ post, isOpen, onClose, onSave, onDelete, onDuplicate, allTags }: PostModalProps) {
  const [form, setForm] = useState<Partial<Post>>({});
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (post) {
      setForm({ ...post });
      setConfirmDelete(false);
    }
  }, [post]);

  const handleClose = useCallback(() => {
    if (post && form) {
      onSave(post.id, form);
    }
    onClose();
  }, [post, form, onSave, onClose]);

  function setField<K extends keyof Post>(key: K, value: Post[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const currentTags = form.tags || [];
    if (!currentTags.includes(trimmed)) {
      setField('tags', [...currentTags, trimmed]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  }

  function removeTag(tag: string) {
    setField('tags', (form.tags || []).filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  }

  const filteredSuggestions = allTags.filter(
    (t) => t.toLowerCase().includes(tagInput.toLowerCase()) && !(form.tags || []).includes(t)
  );

  function handleCopyContent() {
    if (form.content) {
      navigator.clipboard.writeText(form.content);
    }
  }

  if (!post) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Редактирование поста" wide>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Заголовок</label>
          <input
            type="text"
            value={form.title || ''}
            onChange={(e) => setField('title', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
            placeholder="Заголовок поста"
          />
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Текст поста</label>
            <button
              onClick={handleCopyContent}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Копировать текст"
            >
              <ClipboardCopy size={12} /> Копировать
            </button>
          </div>
          <textarea
            value={form.content || ''}
            onChange={(e) => setField('content', e.target.value)}
            rows={5}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white resize-y"
            placeholder="Текст поста..."
          />
        </div>

        {/* Platform, Format, Status row */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Соцсеть</label>
            <select
              value={form.platform || 'telegram'}
              onChange={(e) => setField('platform', e.target.value as SocialPlatform)}
              className="w-full px-2 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{PLATFORM_CONFIG[p].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Формат</label>
            <select
              value={form.format || 'post'}
              onChange={(e) => setField('format', e.target.value as ContentFormat)}
              className="w-full px-2 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>{FORMAT_CONFIG[f]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Статус</label>
            <select
              value={form.status || 'idea'}
              onChange={(e) => setField('status', e.target.value as PostStatus)}
              className="w-full px-2 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Images */}
        <ImageUploader
          postId={post.id}
          platform={(form.platform || 'telegram') as SocialPlatform}
          format={(form.format || 'post') as ContentFormat}
        />

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Дата публикации</label>
            <input
              type="date"
              value={form.scheduledDate || ''}
              onChange={(e) => setField('scheduledDate', e.target.value)}
              className="w-full px-2 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Время публикации</label>
            <input
              type="time"
              value={form.scheduledTime || '12:00'}
              onChange={(e) => setField('scheduledTime', e.target.value)}
              className="w-full px-2 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Теги / рубрики</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(form.tags || []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowTagSuggestions(true);
              }}
              onKeyDown={handleTagKeyDown}
              onFocus={() => setShowTagSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
              className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
              placeholder="Введите тег и нажмите Enter"
            />
            {showTagSuggestions && tagInput && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                {filteredSuggestions.map((tag) => (
                  <button
                    key={tag}
                    onMouseDown={() => addTag(tag)}
                    className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Published URL - only when status is published */}
        {form.status === 'published' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Link size={12} className="inline mr-1" />
              Ссылка на пост
            </label>
            <input
              type="url"
              value={form.publishedUrl || ''}
              onChange={(e) => setField('publishedUrl', e.target.value)}
              className="w-full px-2 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
              placeholder="https://..."
            />
          </div>
        )}

        {/* Metrics - only when status is published */}
        {form.status === 'published' && (
          <MetricsSection
            metrics={form.metrics || {}}
            onChange={(m) => setField('metrics', m)}
          />
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Заметки (внутренние)</label>
          <textarea
            value={form.notes || ''}
            onChange={(e) => setField('notes', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white resize-y"
            placeholder="Внутренние заметки..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onDuplicate(post.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Copy size={14} /> Дублировать
            </button>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={14} /> Удалить
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xs text-red-600 dark:text-red-400">Удалить?</span>
                <button
                  onClick={() => {
                    onDelete(post.id);
                    onClose();
                  }}
                  className="px-2 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Да
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Нет
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Готово
          </button>
        </div>
      </div>
    </Modal>
  );
}
