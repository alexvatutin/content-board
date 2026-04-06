import { useState, useRef } from 'react';
import { Download, Upload, FileUp, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { downloadTemplate, importFromFile } from '../../utils/export';
import type { Post } from '../../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (posts: Post[], replace: boolean) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replace, setReplace] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setSelectedFile(null);
    setReplace(false);
    setError(null);
    setLoading(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFileChange(file: File | undefined) {
    if (!file) return;
    setSelectedFile(file);
    setError(null);
  }

  async function handleImport() {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      const posts = await importFromFile(selectedFile);
      onImport(posts, replace);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка импорта');
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Импорт контент-плана">
      <div className="space-y-5">
        {/* Section 1: Download template */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Download size={16} className="text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Скачать шаблон
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Скачайте шаблон, заполните его и загрузите обратно
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => downloadTemplate('json')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              JSON
            </button>
            <button
              onClick={() => downloadTemplate('csv')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              CSV
            </button>
            <button
              onClick={() => downloadTemplate('xlsx')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Excel
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Section 2: Upload file */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Upload size={16} className="text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Загрузить контент-план
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Поддерживаемые форматы: .json, .csv, .xlsx
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
          >
            {selectedFile ? (
              <>
                <FileSpreadsheet size={28} className="text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-gray-400">
                  Нажмите, чтобы выбрать другой файл
                </span>
              </>
            ) : (
              <>
                <FileUp size={28} className="text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Выберите файл или перетащите сюда
                </span>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".json,.csv,.xlsx"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              className="hidden"
            />
          </div>

          {/* Replace checkbox */}
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={replace}
              onChange={(e) => setReplace(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Заменить существующие данные
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 mt-3 p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
            </div>
          )}

          {/* Import button */}
          <button
            onClick={handleImport}
            disabled={!selectedFile || loading}
            className="w-full mt-4 px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Импортирую...' : 'Импортировать'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
