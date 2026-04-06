import { Plus, Trash2 } from 'lucide-react';
import type { PostMetrics } from '../../types';

interface MetricsSectionProps {
  metrics: PostMetrics;
  onChange: (metrics: PostMetrics) => void;
}

const METRIC_FIELDS: { key: keyof PostMetrics; label: string }[] = [
  { key: 'reach', label: 'Охват (Reach)' },
  { key: 'impressions', label: 'Показы (Impressions)' },
  { key: 'likes', label: 'Лайки (Likes)' },
  { key: 'comments', label: 'Комментарии (Comments)' },
  { key: 'shares', label: 'Репосты (Shares)' },
  { key: 'saves', label: 'Сохранения (Saves)' },
  { key: 'linkClicks', label: 'Клики по ссылке' },
  { key: 'followsGained', label: 'Подписки (Follows)' },
];

export function MetricsSection({ metrics, onChange }: MetricsSectionProps) {
  function handleChange(key: string, value: string) {
    const num = value === '' ? undefined : Number(value);
    onChange({ ...metrics, [key]: num });
  }

  function addCustomMetric() {
    const custom = metrics.custom || [];
    onChange({ ...metrics, custom: [...custom, { name: '', value: 0 }] });
  }

  function updateCustomMetric(index: number, field: 'name' | 'value', val: string) {
    const custom = [...(metrics.custom || [])];
    if (field === 'name') {
      custom[index] = { ...custom[index], name: val };
    } else {
      custom[index] = { ...custom[index], value: Number(val) || 0 };
    }
    onChange({ ...metrics, custom });
  }

  function removeCustomMetric(index: number) {
    const custom = [...(metrics.custom || [])];
    custom.splice(index, 1);
    onChange({ ...metrics, custom });
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Метрики</h3>
      <div className="grid grid-cols-2 gap-2">
        {METRIC_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="text-xs text-gray-500 dark:text-gray-400">{label}</label>
            <input
              type="number"
              min="0"
              value={metrics[key as keyof PostMetrics] as number ?? ''}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full mt-0.5 px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
              placeholder="0"
            />
          </div>
        ))}
      </div>

      {/* Custom metrics */}
      {(metrics.custom || []).map((cm, i) => (
        <div key={i} className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Название</label>
            <input
              type="text"
              value={cm.name}
              onChange={(e) => updateCustomMetric(i, 'name', e.target.value)}
              className="w-full mt-0.5 px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
              placeholder="Метрика"
            />
          </div>
          <div className="w-28">
            <label className="text-xs text-gray-500 dark:text-gray-400">Значение</label>
            <input
              type="number"
              value={cm.value}
              onChange={(e) => updateCustomMetric(i, 'value', e.target.value)}
              className="w-full mt-0.5 px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => removeCustomMetric(i)}
            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button
        onClick={addCustomMetric}
        className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
      >
        <Plus size={14} /> Добавить метрику
      </button>
    </div>
  );
}
