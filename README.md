# Content Board

Веб-приложение для планирования и управления контентом в социальных сетях. Создано для маркетологов, SMM-специалистов и контент-менеджеров.

Полностью клиентское SPA — все данные хранятся в `localStorage` браузера, бэкенд не требуется.

---

## Возможности

### Доска (Board)
- **Недельный вид** — 7 колонок (Пн–Вс) с карточками постов, drag-and-drop между днями
- **Месячный вид** — компактная сетка-календарь с цветными индикаторами платформ; клик по дню открывает детальную модалку со списком постов
- Навигация по неделям/месяцам, кнопка «Сегодня»

### Список (List)
- Табличное представление всех постов
- Сортировка по дате, платформе, статусу, заголовку

### Аналитика (Analytics)
- Барчарты по платформам и статусам
- Heatmap активности за 90 дней
- Средний охват, общее количество постов и опубликованных

### Посты
- Создание, редактирование, дублирование, удаление
- 9 соцсетей, 6 статусов, 7 форматов контента
- Теги с автокомплитом
- Метрики для опубликованных постов (охват, показы, лайки, комментарии, репосты, сохранения, клики по ссылке, прирост подписчиков, кастомные метрики)
- Заметки, ссылка на опубликованный пост

### Импорт / Экспорт
- **Форматы:** JSON, CSV, Excel (.xlsx)
- CSV с UTF-8 BOM для корректного отображения кириллицы в Excel
- Скачивание шаблона с примером заполнения (JSON / CSV / Excel)
- Импорт: режим «заменить всё» или «объединить с существующими»

### Прочее
- Тёмная тема (по умолчанию) и светлая
- Фильтрация по платформе, статусу, тегу
- Горячие клавиши: `N` — новый пост, `Esc` — закрыть модалку
- Данные сохраняются в `localStorage` и не теряются при обновлении страницы

---

## Стек технологий

| Технология | Версия | Назначение |
|---|---|---|
| React | 19 | UI-фреймворк |
| TypeScript | 5.9 | Типизация |
| Vite | 8 | Сборщик / dev-сервер |
| Tailwind CSS | 4 | Стилизация (через @tailwindcss/vite) |
| @dnd-kit | core 6 + sortable 10 | Drag-and-drop |
| date-fns | 4 | Работа с датами (русская локаль) |
| lucide-react | 1.7 | Иконки |
| PapaParse | 5.5 | Парсинг и генерация CSV |
| SheetJS (xlsx) | 0.18 | Чтение и запись Excel-файлов |

---

## Установка и запуск

```bash
# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev
# → http://localhost:5173

# Собрать для продакшна
npm run build
# → Сборка в папке dist/

# Предпросмотр продакшн-сборки
npm run preview
```

---

## Структура проекта

```
src/
├── App.tsx                         — корневой компонент, управление состоянием и роутинг вьюх
├── main.tsx                        — точка входа React
├── index.css                       — Tailwind-импорт, кастомные анимации, скроллбары
│
├── types/
│   └── index.ts                    — все TypeScript-типы (Post, SocialPlatform, PostStatus и др.)
│
├── utils/
│   ├── constants.ts                — конфигурация платформ, статусов и форматов (цвета, лейблы, emoji)
│   ├── dateUtils.ts                — хелперы дат: форматирование, навигация по неделям/месяцам
│   └── export.ts                   — импорт/экспорт JSON/CSV/Excel, генерация шаблонов
│
├── hooks/
│   ├── usePosts.ts                 — CRUD-хук: createPost, updatePost, deletePost, duplicatePost,
│   │                                 movePost, importPosts, вычисляемый allTags
│   ├── useFilters.ts               — фильтрация по платформе/статусу/тегу, мемоизированный filteredPosts
│   └── useLocalStorage.ts          — обёртка над localStorage с синхронизацией между вкладками
│
├── components/
│   ├── Layout/
│   │   ├── Header.tsx              — навбар: переключатель вьюх, кнопки экспорт/импорт, тема
│   │   └── FilterBar.tsx           — дропдауны фильтрации по платформе, статусу, тегу
│   │
│   ├── Board/
│   │   ├── BoardView.tsx           — основной компонент доски (неделя + месяц), DnD-контекст
│   │   ├── DayColumn.tsx           — колонка дня для недельного вида (droppable + sortable)
│   │   ├── PostCard.tsx            — карточка поста с drag-and-drop (useSortable)
│   │   ├── MonthDayCell.tsx        — минимальная ячейка дня для месячной сетки (droppable)
│   │   └── DayDetailModal.tsx      — модалка со списком постов за выбранный день
│   │
│   ├── PostModal/
│   │   ├── PostModal.tsx           — полная форма создания/редактирования поста
│   │   └── MetricsSection.tsx      — секция метрик (для опубликованных постов)
│   │
│   ├── ListView/
│   │   └── ListView.tsx            — табличный вид с сортировкой по колонкам
│   │
│   ├── Analytics/
│   │   └── Analytics.tsx           — дашборд со статистикой и графиками
│   │
│   ├── ImportModal/
│   │   └── ImportModal.tsx         — модалка импорта: скачать шаблон / загрузить файл
│   │
│   └── common/
│       └── Modal.tsx               — переиспользуемый модальный компонент (Escape, overlay click, анимации)
```

---

## Модель данных

### Post

| Поле | Тип | Описание |
|---|---|---|
| `id` | `string` | Уникальный ID (crypto.randomUUID) |
| `title` | `string` | Заголовок поста |
| `content` | `string` | Текст поста |
| `platform` | `SocialPlatform` | Целевая соцсеть |
| `format` | `ContentFormat` | Формат контента |
| `scheduledDate` | `string` | Дата публикации (YYYY-MM-DD) |
| `scheduledTime` | `string` | Время публикации (HH:mm) |
| `status` | `PostStatus` | Текущий статус |
| `tags` | `string[]` | Массив тегов |
| `publishedUrl` | `string?` | Ссылка на опубликованный пост |
| `metrics` | `PostMetrics?` | Метрики (охват, лайки и т.д.) |
| `notes` | `string?` | Заметки |
| `createdAt` | `string` | Дата создания (ISO) |
| `updatedAt` | `string` | Дата обновления (ISO) |

---

## Платформы, статусы, форматы

### Соцсети (9)

| Ключ | Название | Цвет |
|---|---|---|
| `instagram` | Instagram | #E1306C |
| `telegram` | Telegram | #0088CC |
| `youtube` | YouTube | #FF0000 |
| `tiktok` | TikTok | #69C9D0 |
| `linkedin` | LinkedIn | #0A66C2 |
| `facebook` | Facebook | #1877F2 |
| `twitter` | Twitter/X | #808080 |
| `vk` | VK | #0077FF |
| `other` | Другое | #6B7280 |

### Статусы (6)

| Статус | Название | Emoji |
|---|---|---|
| `idea` | Идея | 🔘 |
| `draft` | Черновик | ✏️ |
| `review` | На согласовании | 👀 |
| `ready` | Готов к публикации | ✅ |
| `published` | Опубликован | 🚀 |
| `cancelled` | Отменён | ❌ |

### Форматы контента (7)

| Ключ | Название |
|---|---|
| `post` | Пост |
| `stories` | Stories/Reels |
| `video` | Видео |
| `carousel` | Carousel |
| `article` | Статья |
| `poll` | Опрос |
| `other` | Другое |

---

## Импорт и экспорт

### Экспорт
Кнопка «Экспорт» в шапке сохраняет все посты в JSON-файл (`content-board-YYYY-MM-DD.json`).

### Импорт
Кнопка «Импорт» открывает модалку с двумя секциями:

1. **Скачать шаблон** — выбор формата (JSON / CSV / Excel) → автозагрузка файла-шаблона с примером заполнения и всеми колонками
2. **Загрузить контент-план** — перетаскивание или выбор файла (.json / .csv / .xlsx), с опцией «Заменить все существующие посты»

### Колонки CSV/Excel

```
id, title, content, platform, format, scheduledDate, scheduledTime,
status, tags, publishedUrl, notes, createdAt, updatedAt,
metrics_reach, metrics_impressions, metrics_likes, metrics_comments,
metrics_shares, metrics_saves, metrics_linkClicks, metrics_followsGained,
metrics_custom
```

- `tags` — через запятую (`"маркетинг, SMM, контент"`)
- `metrics_custom` — JSON-строка (`[{"name":"ER","value":3.5}]`)
- `platform` — одно из: `instagram`, `telegram`, `youtube`, `tiktok`, `linkedin`, `facebook`, `twitter`, `vk`, `other`
- `status` — одно из: `idea`, `draft`, `review`, `ready`, `published`, `cancelled`
- `format` — одно из: `post`, `stories`, `video`, `carousel`, `article`, `poll`, `other`

---

## Архитектурные решения

- **Без бэкенда** — все данные в `localStorage`, приложение полностью автономно
- **State management** — React hooks (`usePosts`, `useFilters`, `useLocalStorage`), без Redux/Zustand
- **Drag-and-drop** — @dnd-kit с `useDroppable` + `useSortable` для перетаскивания постов между днями
- **Месячный вид** — CSS Grid (7 колонок, `auto-rows-fr`) с минимальными ячейками + модалка для деталей дня
- **Недельный вид** — Flexbox с `flex-1` для равномерного распределения колонок
- **CSV кириллица** — UTF-8 BOM-префикс (`\uFEFF`) для корректного отображения в Excel
- **Темы** — класс `dark` на `<html>` + Tailwind `dark:` варианты
