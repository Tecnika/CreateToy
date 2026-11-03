import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Archive, Ban, Check, CircleCheck, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { services } from '../../core/container';
import { Money } from '../../core/domain/Money';
import type { ArtKind, Product } from '../../core/domain/types';
import { useTheme } from '../../state/ThemeContext';
import { ProductMedia } from '../product/ProductMedia';

interface ProductManagerProps {
  canDelete?: boolean;
  canArchive?: boolean;
  canRestore?: boolean;
  showHeader?: boolean;
  showTemplateLink?: boolean;
}

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

export function ProductManager({
  canDelete = false,
  canArchive = false,
  canRestore = false,
  showHeader = true,
  showTemplateLink = false,
}: ProductManagerProps) {
  const { themes } = useTheme();
  const categories = services.catalog.categories().filter((category) => category.id !== 'all');
  const templates = services.configurator.list();
  const [version, setVersion] = useState(0);
  const [draft, setDraft] = useState<Product | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialImageUrl, setInitialImageUrl] = useState<string | undefined>(undefined);
  const [showArchived, setShowArchived] = useState(false);

  const allProducts = services.catalog.listAll();
  const products = services.catalog.list();
  const archived = allProducts.filter((product) => product.archivedAt);
  const outOfStock = products.filter((product) => product.inStock === false);
  const visibleProducts = canRestore && showArchived ? allProducts : products;

  function openNew() {
    setDraft(createDraft(templates[0]?.id ?? 'figure'));
    setInitialImageUrl(undefined);
    setMessage('');
    setError('');
  }

  function openEdit(product: Product) {
    setDraft({
      ...product,
      art: { ...product.art, colors: [...product.art.colors] as Product['art']['colors'] },
      holidayIds: [...product.holidayIds],
    });
    setInitialImageUrl(product.imageUrl);
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

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !draft || uploading) return;

    setUploading(true);
    setError('');
    try {
      const url = await services.productImages.upload(file, draft.id);
      update('imageUrl', url);
      setMessage('Фото загружено. Сохраните товар, чтобы применить.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось загрузить фото.');
    } finally {
      setUploading(false);
    }
  }

  function clearPhoto() {
    update('imageUrl', undefined);
    setMessage('Фото будет убрано после сохранения товара.');
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft || busy) return;
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
    if (allProducts.some((product) => product.slug === slug && product.id !== draft.id)) {
      setError('Товар с таким slug уже есть.');
      return;
    }
    if (!draft.price || draft.price < 1) {
      setError('Укажите цену больше нуля.');
      return;
    }
    setBusy(true);
    try {
      await services.catalog.save({
        ...draft,
        slug,
        title: draft.title.trim(),
        subtitle: draft.subtitle.trim(),
        description: draft.description.trim(),
      });
      if (initialImageUrl && initialImageUrl !== draft.imageUrl) {
        void services.productImages.remove(initialImageUrl).catch((caught) => {
          console.warn('Не удалось удалить старое фото товара:', caught);
        });
      }
      setInitialImageUrl(draft.imageUrl);
      setVersion((value) => value + 1);
      setDraft(null);
      setMessage('Товар сохранён.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось сохранить товар.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleStock(product: Product) {
    if (busy) return;
    const nextInStock = product.inStock === false;
    setBusy(true);
    setError('');
    try {
      await services.catalog.save({ ...product, inStock: nextInStock });
      setVersion((value) => value + 1);
      setMessage(nextInStock ? 'Товар снова в продаже.' : 'Товар снят с продажи.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось изменить статус продажи.');
    } finally {
      setBusy(false);
    }
  }

  async function archive(product: Product) {
    if (busy) return;
    if (!window.confirm(`Скрыть «${product.title}» из каталога? Восстановить сможет только администратор.`)) return;
    setBusy(true);
    setError('');
    try {
      await services.catalog.archive(product.id);
      setVersion((value) => value + 1);
      setMessage('Товар скрыт из каталога. Восстановить сможет только администратор.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось скрыть товар.');
    } finally {
      setBusy(false);
    }
  }

  async function restore(product: Product) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await services.catalog.restore(product.id);
      setVersion((value) => value + 1);
      setMessage('Товар восстановлен и снова виден в каталоге.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось восстановить товар.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(product: Product) {
    if (busy) return;
    if (!window.confirm(`Удалить «${product.title}» навсегда? Это действие нельзя отменить.`)) return;
    setBusy(true);
    setError('');
    try {
      await services.catalog.remove(product.id);
      if (product.imageUrl) {
        void services.productImages.remove(product.imageUrl).catch((caught) => {
          console.warn('Не удалось удалить фото товара:', caught);
        });
      }
      setVersion((value) => value + 1);
      setMessage('Товар удалён навсегда.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось удалить товар.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {showHeader ? (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow mb-3">Каталог</span>
            <h1 className="display-title text-3xl sm:text-4xl">Товары</h1>
            <p className="mt-2 text-sm text-muted">Добавляйте сувениры и привязывайте их к шаблонам конструктора. Скрытые карточки не видны покупателям.</p>
          </div>
          <button type="button" onClick={openNew} className="btn-primary px-4 py-2.5 text-xs">
            <Plus size={15} /> Добавить товар
          </button>
        </div>
      ) : (
        <div className="flex justify-end">
          <button type="button" onClick={openNew} className="btn-primary px-4 py-2.5 text-xs">
            <Plus size={15} /> Добавить товар
          </button>
        </div>
      )}

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
              <p className="mt-1 text-xs text-muted">Можно загрузить фото или оставить сгенерированную графику из образа и цветов.</p>
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
                <ProductMedia
                  art={draft.art}
                  imageUrl={draft.imageUrl}
                  label={draft.title || 'Превью'}
                  className="aspect-square w-full object-cover"
                />
              </div>
              <div className="rounded-2xl border border-line bg-surface-2/50 p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted">Фото товара</p>
                <p className="mt-1 text-[10px] leading-4 text-muted">
                  JPG, PNG или WebP до 10 МБ. Без фото показывается сгенерированная графика.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <label className={`btn-secondary px-3 py-2 text-[10px] ${uploading || busy ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}>
                    {uploading ? 'Загружаем...' : draft.imageUrl ? 'Заменить фото' : 'Загрузить фото'}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={uploadPhoto}
                      disabled={uploading || busy}
                    />
                  </label>
                  {draft.imageUrl && (
                    <button type="button" onClick={clearPhoto} className="btn-secondary px-3 py-2 text-[10px]" disabled={uploading || busy}>
                      Убрать фото
                    </button>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-surface-2/50 p-3">
                <p className="text-sm font-extrabold">{draft.title || 'Название товара'}</p>
                <p className="mt-1 text-xs text-muted">{draft.subtitle || 'Подзаголовок'}</p>
                <p className="mt-2 font-display text-lg font-semibold">{Money.from(draft.price || 0).format()}</p>
              </div>
              {showTemplateLink && (
                <p className="text-[10px] leading-4 text-muted">
                  Нужен новый шаблон? <Link to="/admin/templates" className="font-bold text-accent hover:underline">Создайте его в разделе «Шаблоны»</Link>.
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setDraft(null)} className="btn-secondary px-4 py-2.5 text-xs">Отмена</button>
            <button type="submit" className="btn-primary px-4 py-2.5 text-xs" disabled={busy || uploading}><Check size={15} /> {busy ? 'Сохраняем...' : uploading ? 'Загружаем фото...' : 'Сохранить товар'}</button>
          </div>
        </form>
      )}

      <div className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2/50 px-4 py-3 text-xs font-bold text-muted">
          <span>
            {visibleProducts.length} товаров · <span className="text-ink">{visibleProducts.filter((product) => product.featured).length}</span> в подборке
            {outOfStock.length > 0 && <> · <span className="text-amber-600">{outOfStock.length} нет в продаже</span></>}
            {archived.length > 0 && <> · <span className="text-rose-600">{archived.length} скрыто</span></>}
          </span>
          {canRestore && archived.length > 0 && (
            <button type="button" onClick={() => setShowArchived((value) => !value)} className="btn-secondary px-3 py-1.5 text-[10px]">
              {showArchived ? 'Скрыть скрытые' : `Показать скрытые (${archived.length})`}
            </button>
          )}
        </div>
        <div className="divide-y divide-line">
          {visibleProducts.map((product) => {
            const isArchived = Boolean(product.archivedAt);
            const inStock = product.inStock !== false;
            return (
              <div key={product.id} className={`flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:gap-4 ${isArchived ? 'bg-surface-2/40' : ''}`}>
                <div
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl ${isArchived ? 'opacity-50 grayscale' : !inStock ? 'opacity-80 grayscale-[35%]' : ''}`}
                  style={{ background: `linear-gradient(145deg, ${product.art.colors[1]}, ${product.art.colors[0]})` }}
                >
                  <ProductMedia
                    art={product.art}
                    imageUrl={product.imageUrl}
                    label={product.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold">{product.title}</p>
                    {product.badge && <span className="badge">{product.badge}</span>}
                    {!inStock && !isArchived && <span className="badge bg-amber-100 text-amber-800">Нет в продаже</span>}
                    {isArchived && <span className="badge bg-rose-100 text-rose-700">Скрыт</span>}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted">{product.slug} · {product.category} · {product.materials}</p>
                  <p className="mt-0.5 text-[10px] text-muted">Шаблон: {templates.find((template) => template.id === product.templateId)?.data.name ?? product.templateId}</p>
                </div>
                <p className="font-display text-base font-semibold sm:w-24 sm:text-right">{Money.from(product.price).format()}</p>
                <div className="flex gap-1.5">
                  {isArchived ? (
                    canRestore && (
                      <button type="button" onClick={() => restore(product)} className="btn-icon h-9 w-9 text-emerald-600" aria-label="Восстановить товар" disabled={busy}>
                        <RotateCcw size={14} />
                      </button>
                    )
                  ) : (
                    <>
                      <button type="button" onClick={() => openEdit(product)} className="btn-icon h-9 w-9" aria-label="Редактировать товар"><Pencil size={14} /></button>
                      <button
                        type="button"
                        onClick={() => toggleStock(product)}
                        className={`btn-icon h-9 w-9 ${inStock ? 'text-sky-600' : 'text-emerald-600'}`}
                        aria-label={inStock ? 'Снять с продажи' : 'Вернуть в продажу'}
                        disabled={busy}
                      >
                        {inStock ? <Ban size={14} /> : <CircleCheck size={14} />}
                      </button>
                      {canArchive && (
                        <button type="button" onClick={() => archive(product)} className="btn-icon h-9 w-9 text-amber-600" aria-label="Скрыть товар" disabled={busy}><Archive size={14} /></button>
                      )}
                      {canDelete && (
                        <button type="button" onClick={() => remove(product)} className="btn-icon h-9 w-9 text-rose-600" aria-label="Удалить товар навсегда" disabled={busy}><Trash2 size={14} /></button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {visibleProducts.length === 0 && (
            <p className="px-4 py-8 text-center text-xs text-muted">Товаров пока нет.</p>
          )}
        </div>
      </div>
    </div>
  );
}
