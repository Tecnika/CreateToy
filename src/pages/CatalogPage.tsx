import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { services } from '../core/container';
import { useTheme } from '../state/ThemeContext';
import { ProductCard } from '../components/product/ProductCard';
import { PageHero } from '../components/ui/PageHero';
import { EmptyState } from '../components/ui/EmptyState';
import { LinkButton } from '../components/ui/Button';
import { plural } from '../utils/format';

export function CatalogPage() {
  const { themes } = useTheme();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const category = params.get('category') ?? 'all';
  const holidayId = params.get('holiday') ?? '';
  const categories = services.catalog.categories();

  const products = useMemo(
    () => services.catalog.filter({ query, category, holidayId: holidayId || undefined }),
    [query, category, holidayId],
  );

  const activeTheme = themes.find((theme) => theme.id === holidayId);
  const hasFilters = Boolean(query || category !== 'all' || holidayId);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    updateParam('q', query.trim());
  }

  function reset() {
    setQuery('');
    setParams({}, { replace: true });
  }

  return (
    <>
      <PageHero
        eyebrow="Каталог"
        title="Сувениры"
        accent="на любой праздник"
        description="Готовые подарки и модели, которые можно настроить под себя. Выберите праздник, категорию или найдите идею по названию."
        aside={
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: services.catalog.list().length, label: 'моделей' },
              { value: themes.length - 1, label: 'праздничных тем' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-line bg-surface-2/60 px-4 py-5 text-center">
                <p className="font-display text-3xl font-semibold">{item.value}</p>
                <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        }
      />

      <section className="container-page mt-8">
        <div className="surface-card p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <form onSubmit={submitSearch} className="relative flex-1">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="input pl-11 pr-24"
                placeholder="Найти сувенир: снеговик, брелок, вазон..."
                aria-label="Поиск по каталогу"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white">
                Найти
              </button>
            </form>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted">
                <SlidersHorizontal size={15} /> Фильтры
              </span>
              <select
                value={holidayId}
                onChange={(event) => updateParam('holiday', event.target.value)}
                className="select w-auto min-w-44 py-2.5"
                aria-label="Праздник"
              >
                <option value="">Все праздники</option>
                {themes
                  .filter((theme) => theme.id !== 'base')
                  .map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.data.name}
                    </option>
                  ))}
              </select>
              {hasFilters && (
                <button
                  type="button"
                  onClick={reset}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:text-ink"
                  aria-label="Сбросить фильтры"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateParam('category', item.id === 'all' ? '' : item.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${
                  category === item.id
                    ? 'border-accent bg-accent text-white'
                    : 'border-line bg-surface text-muted hover:border-accent/50 hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            Найдено <span className="font-bold text-ink">{products.length}</span>{' '}
            {plural(products.length, 'сувенир', 'сувенира', 'сувениров')}
            {activeTheme && (
              <>
                {' '}
                · тема <span className="font-bold text-ink">{activeTheme.data.shortName}</span>
              </>
            )}
          </p>
          {activeTheme && (
            <Link to="/holidays" className="text-xs font-bold text-accent hover:underline">
              Посмотреть все праздники →
            </Link>
          )}
        </div>

        {products.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              title="Ничего не нашлось"
              description="Попробуйте другой запрос или сбросьте фильтры. А если идеи пока нет — соберите подарок в конструкторе."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={reset} className="btn-secondary">
                    Сбросить фильтры
                  </button>
                  <LinkButton to="/product/custom-figure">Открыть конструктор</LinkButton>
                </div>
              }
            />
          </div>
        )}
      </section>
    </>
  );
}
