import { useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { services } from '../../core/container';
import { Money } from '../../core/domain/Money';
import type { ArtKind, Product } from '../../core/domain/types';
import { useTheme } from '../../state/ThemeContext';
import { SouvenirArt } from '../../components/product/SouvenirArt';

const artKinds: { id: ArtKind; label: string }[] = [
  { id: 'snowman', label: 'Снеговик' },
  { id: 'tree', label: 'Ёлка' },
  { id: 'pumpkin', label: 'Тыква' },
  { id: 'heart', label: 'Сердце' },
  { id: 'rocket', label: 'Ракета' },
  { id: 'bouquet', label: 'Букет' },
  { id: 'egg', label: 'Яйцо' },
  { id: 'organizer', label: 'Органайзер' },
  { id: 'badge', label: 'Значок / звезда' },
  { id: 'leaf', label: 'Лист / венок' },
  { id: 'vase', label: 'Вазон' },
  { id: 'box', label: 'Коробка' },
  { id: 'keychain', label: 'Брелок' },
  { id: 'cat', label: 'Кот' },
  { id: 'bunny', label: 'Кролик' },
  { id: 'gift', label: 'Подарок' },
];

function createDraft(templateId: string): Product {
  return {
    id: crypto.randomUUID(),
    slug: '',
    title: '',
    subtitle: '',
    description: '',
    price: 990,
    category: 'figurine',
    holidayIds: [],
    templateId,
    art: { kind: 'gift', colors: ['#c45d3a', '#f2b84b', '#f7f0e6'] },
    productionDays: 3,
    materials: 'PLA+',
    size: '10–15 см',
    featured: false,
  };
}

export function AdminProductsPage() {
  const { themes } = useTheme();
  const categories = services.catalog.categories().filter((category) => category.id !== 'all');
  const templates = services.configurator.list();
  const [version, setVersion] = useState(0);
  const [draft, setDraft] = useState<Product | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const products = services.catalog.list();

  function openNew() {
    setDraft(createDraft(templates[0]?.id ?? 'figure'));
    setMessage('');
    setError('');
  }

  function openEdit(product: Product) {
    setDraft({
      ...product,
      art: { ...product.art, colors: [...product.art.colors] as Product['art']['colors'] },
      holidayIds: [...product.holidayIds],
    });
    setMessage('');
    setError('');
  }

  function update<K extends keyof Product>(key: K, value: Product[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateArt(patch: Partial<Product['art']>) {
    setDraft((current) => (current ? { ...current, art: { ...current.art, ...patch } } : current));
  }

  function toggleHoliday(id: string) {
    if (!draft) return;
    update(
      'holidayIds',
      draft.holidayIds.includes(id) ? draft.holidayIds.filter((item) => item !== id) : [...draft.holidayIds, id],
    );
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setError('');
    const slug = draft.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (draft.title.trim().length < 2) {
      setError('Укажите название товара.');
      return;
    }
    if (!slug) {
      setError('Укажите slug латиницей — он нужен для ссылки.');
      return;
    }
    if (products.some((product) => product.slug === slug && product.id !== draft.id)) {
      setError('Товар с таким slug уже есть.');
      return;
    }
    if (!draft.price || draft.price < 1) {
      setError('Укажите цену больше нуля.');
      return;
    }
    services.catalog.save({
      ...draft,
      slug,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      description: draft.description.trim(),
    });
    setVersion((value) => value + 1);
    setDraft(null);
    setMessage('Товар сохранён.');
  }

  function remove(product: Product) {
    if (!window.confirm(`Удалить «${product.title}» из каталога?`)) return;
    services.catalog.remove(product.id);
    setVersion((value) => value + 1);
    setMessage('Товар удалён из каталога.');
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow mb-3">Каталог</span>
          <h1 className="display-title text-3xl sm:text-4xl">Товары</h1>
          <p className="mt-2 text-sm text-muted">Добавляйте сувениры и привязывайте их к шаблонам конструктора.</p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary px-4 py-2.5 text-xs">
          <Plus size={15} /> Добавить товар
        </button>
      </div>

      {(message || error) && (
        <p className={`rounded-2xl px-4 py-3 text-xs font-semibold ${error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </p>
      )}

      {draft && (
        <form onSubmit={save} className="surface-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="display-title text-2xl">{products.some((product) => product.id === draft.id) ? 'Редактировать товар' : 'Новый товар'}</h2>
              <p className="mt-1 text-xs text-muted">Превью генерируется из выбранного образа и цветов.</p>
            </div>
            <button type="button" onClick={() => setDraft(null)} className="btn-icon h-9 w-9" aria-label="Закрыть форму">
              <X size={16} />
            </button>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label">Название</label>
                <input className="input" value={draft.title} onChange={(event) => update('title', event.target.value)} />
              </div>
              <div>
                <label className="field-label">Slug</label>
                <input className="input" value={draft.slug} onChange={(event) => update('slug', event.target.value)} placeholder="snow-family" />
              </div>
              <div>
                <label className="field-label">Цена, ₽</label>
                <input type="number" className="input" value={draft.price} onChange={(event) => update('price', Number(event.target.value))} min={1} />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Подзаголовок</label>
                <input className="input" value={draft.subtitle} onChange={(event) => update('subtitle', event.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Описание</label>
                <textarea className="textarea" value={draft.description} onChange={(event) => update('description', event.target.value)} />
              </div>
              <div>
                <label className="field-label">Категория</label>
                <select className="select" value={draft.category} onChange={(event) => update('category', event.target.value)}>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Шаблон конструктора</label>
                <select className="select" value={draft.templateId} onChange={(event) => update('templateId', event.target.value)}>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>{template.data.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Срок печати, дней</label>
                <input type="number" className="input" value={draft.productionDays} onChange={(event) => update('productionDays', Number(event.target.value))} min={1} />
              </div>
              <div>
                <label className="field-label">Материал</label>
                <input className="input" value={draft.materials} onChange={(event) => update('materials', event.target.value)} />
              </div>
              <div>
                <label className="field-label">Размер</label>
                <input className="input" value={draft.size} onChange={(event) => update('size', event.target.value)} />
              </div>
              <div>
                <label className="field-label">Бейдж</label>
                <input className="input" value={draft.badge ?? ''} onChange={(event) => update('badge', event.target.value || undefined)} placeholder="Хит, Новинка..." />
              </div>
              <label className="flex items-center gap-2.5 self-end pb-2 text-xs font-semibold text-muted">
                <input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => update('featured', event.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
                Показывать в подборке
              </label>

              <div className="sm:col-span-2">
                <label className="field-label">Праздники</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {themes.filter((theme) => theme.id !== 'base').map((theme) => (
                    <label key={theme.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-semibold">
                      <input type="checkbox" checked={draft.holidayIds.includes(theme.id)} onChange={() => toggleHoliday(theme.id)} className="h-4 w-4 accent-[var(--accent)]" />
                      {theme.data.shortName}
                    </label>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="field-label">Образ</label>
                <select className="select" value={draft.art.kind} onChange={(event) => updateArt({ kind: event.target.value as ArtKind })}>
                  {artKinds.map((kind) => (
                    <option key={kind.id} value={kind.id}>{kind.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Цвета образа</label>
                <div className="flex gap-2">
                  {draft.art.colors.map((color, index) => (
                    <input
                      key={index}
                      type="color"
                      value={color}
                      onChange={(event) => {
                        const colors = [...draft.art.colors] as Product['art']['colors'];
                        colors[index] = event.target.value;
                        updateArt({ colors });
                      }}
                      className="h-11 flex-1 cursor-pointer rounded-xl border border-line bg-surface p-1"
                      aria-label={`Цвет ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div
                className="overflow-hidden rounded-3xl border border-line"
                style={{ background: `linear-gradient(145deg, ${draft.art.colors[1]}, ${draft.art.colors[0]})` }}
              >
                <SouvenirArt art={draft.art} label={draft.title || 'Превью'} className="aspect-square" />
              </div>
              <div className="rounded-2xl border border-line bg-surface-2/50 p-3">
                <p className="text-sm font-extrabold">{draft.title || 'Название товара'}</p>
                <p className="mt-1 text-xs text-muted">{draft.subtitle || 'Подзаголовок'}</p>
                <p className="mt-2 font-display text-lg font-semibold">{Money.from(draft.price || 0).format()}</p>
              </div>
              <p className="text-[10px] leading-4 text-muted">
                Нужен новый шаблон? <Link to="/admin/templates" className="font-bold text-accent hover:underline">Создайте его в разделе «Шаблоны»</Link>.
              </p>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setDraft(null)} className="btn-secondary px-4 py-2.5 text-xs">Отмена</button>
            <button type="submit" className="btn-primary px-4 py-2.5 text-xs"><Check size={15} /> Сохранить товар</button>
          </div>
        </form>
      )}

      <div className="surface-card overflow-hidden">
        <div className="border-b border-line bg-surface-2/50 px-4 py-3 text-xs font-bold text-muted">
          {products.length} товаров · <span className="text-ink">{products.filter((product) => product.featured).length}</span> в подборке
        </div>
        <div className="divide-y divide-line">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:gap-4">
              <div
                className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl"
                style={{ background: `linear-gradient(145deg, ${product.art.colors[1]}, ${product.art.colors[0]})` }}
              >
                <SouvenirArt art={product.art} label={product.title} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-extrabold">{product.title}</p>
                  {product.badge && <span className="badge">{product.badge}</span>}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted">{product.slug} · {product.category} · {product.materials}</p>
                <p className="mt-0.5 text-[10px] text-muted">Шаблон: {templates.find((template) => template.id === product.templateId)?.data.name ?? product.templateId}</p>
              </div>
              <p className="font-display text-base font-semibold sm:w-24 sm:text-right">{Money.from(product.price).format()}</p>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => openEdit(product)} className="btn-icon h-9 w-9" aria-label="Редактировать товар"><Pencil size={14} /></button>
                <button type="button" onClick={() => remove(product)} className="btn-icon h-9 w-9 text-rose-600" aria-label="Удалить товар"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
