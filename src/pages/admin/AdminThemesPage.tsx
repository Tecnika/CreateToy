import { useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { services } from '../../core/container';
import type { EffectId, HolidayThemeData } from '../../core/domain/types';
import { useTheme } from '../../state/ThemeContext';

const effectOptions: { id: EffectId; label: string }[] = [
  { id: 'sparkles', label: 'Искры' },
  { id: 'snow', label: 'Снег' },
  { id: 'pumpkins', label: 'Тыквы' },
  { id: 'notebook', label: 'Тетрадная клетка' },
  { id: 'hearts', label: 'Сердца' },
  { id: 'petals', label: 'Лепестки' },
  { id: 'stars', label: 'Звёзды' },
  { id: 'ribbon', label: 'Лента' },
  { id: 'leaves', label: 'Листья' },
  { id: 'eggs', label: 'Пасхальные яйца' },
  { id: 'scan', label: 'Сканирующая линия' },
  { id: 'fireworks', label: 'Фейерверк' },
];

const paletteFields: { key: keyof HolidayThemeData['palette']; label: string }[] = [
  { key: 'bg', label: 'Фон' },
  { key: 'surface', label: 'Карточки' },
  { key: 'surface2', label: 'Вторичный фон' },
  { key: 'ink', label: 'Текст' },
  { key: 'muted', label: 'Второстепенный текст' },
  { key: 'accent', label: 'Акцент' },
  { key: 'accent2', label: 'Второй акцент' },
  { key: 'accentSoft', label: 'Мягкий акцент' },
  { key: 'line', label: 'Линии' },
  { key: 'heroGlow', label: 'Свечение' },
];

function createDraft(base: HolidayThemeData): HolidayThemeData {
  return {
    ...base,
    id: `custom-${crypto.randomUUID().slice(0, 8)}`,
    name: '',
    shortName: '',
    tagline: '',
    description: '',
    dateLabel: 'Весь год',
    heroTitle: 'Новый праздник',
    heroAccent: 'своими руками',
    heroNote: 'Расскажите о поводе — подберём сувениры и настроение.',
    featuredProductIds: [],
    isCustom: true,
  };
}

export function AdminThemesPage() {
  const { themes, theme, setActiveTheme, addCustomTheme, removeCustomTheme } = useTheme();
  const base = themes.find((item) => item.id === 'base') ?? themes[0];
  const products = services.catalog.list();
  const [draft, setDraft] = useState<HolidayThemeData | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function openNew() {
    setDraft(createDraft(base.data));
    setMessage('');
    setError('');
  }

  function openEdit(id: string) {
    const item = themes.find((candidate) => candidate.id === id);
    if (!item) return;
    setDraft({ ...item.data, palette: { ...item.data.palette }, featuredProductIds: [...item.data.featuredProductIds] });
    setMessage('');
    setError('');
  }

  function update<K extends keyof HolidayThemeData>(key: K, value: HolidayThemeData[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateColor(key: keyof HolidayThemeData['palette'], value: string) {
    setDraft((current) =>
      current ? { ...current, palette: { ...current.palette, [key]: value } } : current,
    );
  }

  function toggleFeatured(id: string) {
    if (!draft) return;
    const selected = draft.featuredProductIds.includes(id)
      ? draft.featuredProductIds.filter((item) => item !== id)
      : [...draft.featuredProductIds, id];
    update('featuredProductIds', selected);
  }

  function saveTheme(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setError('');
    if (draft.name.trim().length < 2 || draft.shortName.trim().length < 2) {
      setError('Укажите название и короткое название темы.');
      return;
    }
    addCustomTheme({
      ...draft,
      name: draft.name.trim(),
      shortName: draft.shortName.trim(),
      tagline: draft.tagline.trim(),
      description: draft.description.trim(),
      dateLabel: draft.dateLabel.trim() || 'Весь год',
      isCustom: true,
    });
    setDraft(null);
    setMessage('Тема сохранена. Её можно активировать в списке.');
  }

  function activate(id: string) {
    setError('');
    try {
      setActiveTheme(id);
      setMessage('Тема применена к сайту.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось применить тему.');
    }
  }

  function remove(id: string) {
    if (!window.confirm('Удалить свою тему? Это действие нельзя отменить.')) return;
    removeCustomTheme(id);
    setMessage('Тема удалена.');
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow mb-3">Праздники</span>
          <h1 className="display-title text-3xl sm:text-4xl">Темы сайта</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Включите готовую тему или создайте свой праздник: палитра, эффект и тексты главной страницы.
          </p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary px-4 py-2.5 text-xs">
          <Plus size={15} /> Своя тема
        </button>
      </div>

      {(message || error) && (
        <p className={`rounded-2xl px-4 py-3 text-xs font-semibold ${error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </p>
      )}

      <div className="rounded-2xl border border-line bg-surface-2/50 p-3.5 text-xs leading-5 text-muted">
        <Sparkles size={15} className="mr-1.5 inline text-accent" />
        Сейчас активна <span className="font-bold text-ink">{theme.data.name}</span>. В демо-режиме выбор сохраняется в
        браузере. После подключения Firebase тема станет общей для всех посетителей.
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {themes.map((item) => (
          <div key={item.id} className="surface-card overflow-hidden">
            <div
              className="relative h-28 p-4"
              style={{
                background: `radial-gradient(circle at 80% 15%, ${item.data.palette.heroGlow} 0, transparent 48%), linear-gradient(135deg, ${item.data.palette.surface2}, ${item.data.palette.bg})`,
              }}
            >
              <div className="flex gap-1.5">
                {[item.data.palette.accent, item.data.palette.accent2, item.data.palette.heroGlow].map((color, index) => (
                  <span key={`${color}-${index}`} className="h-5 w-5 rounded-full border border-black/10" style={{ background: color }} />
                ))}
              </div>
              <p className="absolute bottom-3 left-4 right-4 truncate font-display text-lg font-semibold" style={{ color: item.data.palette.ink }}>
                {item.data.heroTitle} <span style={{ color: item.data.palette.accent }}>{item.data.heroAccent}</span>
              </p>
              {item.id === theme.id && (
                <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-white">
                  активна
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-extrabold">{item.data.name}</h2>
                  <p className="mt-1 text-[11px] text-muted">{item.data.dateLabel} · {effectOptions.find((effect) => effect.id === item.data.effect)?.label}</p>
                </div>
                {item.data.isCustom && <span className="badge">своя</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.id !== theme.id && (
                  <button type="button" onClick={() => activate(item.id)} className="btn-secondary px-3 py-2 text-[11px]">
                    <Check size={13} /> Включить
                  </button>
                )}
                {item.data.isCustom && (
                  <>
                    <button type="button" onClick={() => openEdit(item.id)} className="btn-icon h-8 w-8" aria-label="Редактировать тему">
                      <Pencil size={13} />
                    </button>
                    <button type="button" onClick={() => remove(item.id)} className="btn-icon h-8 w-8 text-rose-600" aria-label="Удалить тему">
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {draft && (
        <form onSubmit={saveTheme} className="surface-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="display-title text-2xl">{themes.some((item) => item.id === draft.id) ? 'Редактировать тему' : 'Новая тема'}</h2>
              <p className="mt-1 text-xs text-muted">Палитра применяется ко всем компонентам сайта.</p>
            </div>
            <button type="button" onClick={() => setDraft(null)} className="btn-icon h-9 w-9" aria-label="Закрыть форму">
              <X size={16} />
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Название</label>
              <input className="input" value={draft.name} onChange={(event) => update('name', event.target.value)} placeholder="Например, День рождения" />
            </div>
            <div>
              <label className="field-label">Короткое название</label>
              <input className="input" value={draft.shortName} onChange={(event) => update('shortName', event.target.value)} placeholder="Для шапки" />
            </div>
            <div>
              <label className="field-label">Слоган</label>
              <input className="input" value={draft.tagline} onChange={(event) => update('tagline', event.target.value)} />
            </div>
            <div>
              <label className="field-label">Даты</label>
              <input className="input" value={draft.dateLabel} onChange={(event) => update('dateLabel', event.target.value)} placeholder="1–10 марта" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Описание</label>
              <textarea className="textarea min-h-20" value={draft.description} onChange={(event) => update('description', event.target.value)} />
            </div>
            <div>
              <label className="field-label">Заголовок на главной</label>
              <input className="input" value={draft.heroTitle} onChange={(event) => update('heroTitle', event.target.value)} />
            </div>
            <div>
              <label className="field-label">Акцентная часть заголовка</label>
              <input className="input" value={draft.heroAccent} onChange={(event) => update('heroAccent', event.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Текст под заголовком</label>
              <textarea className="textarea min-h-20" value={draft.heroNote} onChange={(event) => update('heroNote', event.target.value)} />
            </div>
            <div>
              <label className="field-label">Эффект</label>
              <select className="select" value={draft.effect} onChange={(event) => update('effect', event.target.value as EffectId)}>
                {effectOptions.map((effect) => (
                  <option key={effect.id} value={effect.id}>{effect.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Палитра</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {paletteFields.map((field) => (
                <label key={field.key} className="rounded-2xl border border-line p-2.5">
                  <span className="mb-1.5 block text-[10px] font-bold text-muted">{field.label}</span>
                  <span className="flex items-center gap-2">
                    <input
                      type="color"
                      value={draft.palette[field.key]}
                      onChange={(event) => updateColor(field.key, event.target.value)}
                      className="h-8 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                    />
                    <span className="font-mono text-[10px] text-muted">{draft.palette[field.key]}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Товары на главной</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <label key={product.id} className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-line p-2.5 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={draft.featuredProductIds.includes(product.id)}
                    onChange={() => toggleFeatured(product.id)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  <span className="truncate">{product.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setDraft(null)} className="btn-secondary px-4 py-2.5 text-xs">Отмена</button>
            <button type="submit" className="btn-primary px-4 py-2.5 text-xs"><Check size={15} /> Сохранить тему</button>
          </div>
        </form>
      )}
    </div>
  );
}
