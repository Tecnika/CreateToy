import { ArrowLeft, Check, Clock3, Package, Ruler, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { services } from '../core/container';
import { Money } from '../core/domain/Money';
import { useTheme } from '../state/ThemeContext';
import { Configurator } from '../components/configurator/Configurator';
import { ProductCard } from '../components/product/ProductCard';
import { ProductMedia } from '../components/product/ProductMedia';
import { EmptyState } from '../components/ui/EmptyState';
import { LinkButton } from '../components/ui/Button';

export function ProductPage() {
  const { slug } = useParams();
  const { themes } = useTheme();
  const product = slug ? services.catalog.bySlug(slug) : undefined;
  const template = product ? services.configurator.getById(product.templateId) : undefined;

  if (!product || !template) {
    return (
      <section className="container-page pt-12">
        <EmptyState
          title="Сувенир не найден"
          description="Возможно, ссылка устарела или товар убрали из каталога. Загляните в каталог — там много других идей."
          action={<LinkButton to="/catalog">Вернуться в каталог</LinkButton>}
        />
      </section>
    );
  }

  const related = services.catalog.related(product);
  const inStock = product.inStock !== false;
  const productThemes = themes.filter((theme) => product.holidayIds.includes(theme.id));
  const features = [
    { icon: Clock3, title: 'Печать', text: `${product.productionDays}–${product.productionDays + 2} дня` },
    { icon: Ruler, title: 'Размер', text: product.size },
    { icon: Package, title: 'Материал', text: product.materials },
  ];

  return (
    <>
      <section className="container-page pt-6">
        <Link to="/catalog" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted transition hover:text-accent">
          <ArrowLeft size={15} />
          Каталог
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div
              className="relative overflow-hidden rounded-5xl border border-line shadow-soft"
              style={{
                background: `radial-gradient(circle at 78% 18%, ${product.art.colors[2]} 0, transparent 45%), linear-gradient(145deg, ${product.art.colors[1]} 0%, ${product.art.colors[0]} 100%)`,
              }}
            >
              <ProductMedia
                art={product.art}
                imageUrl={product.imageUrl}
                label={product.title}
                className="aspect-square w-full object-cover"
              />
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                {product.badge && <span className="badge bg-white/85 text-ink backdrop-blur">{product.badge}</span>}
                {!inStock && <span className="badge bg-rose-600/90 text-white backdrop-blur">Нет в продаже</span>}
                {productThemes.map((theme) => (
                  <span key={theme.id} className="badge bg-black/25 text-white backdrop-blur">
                    {theme.data.shortName}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-3xl border border-line bg-surface p-4">
                  <feature.icon size={18} className="text-accent" />
                  <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted">{feature.title}</p>
                  <p className="mt-1 text-sm font-bold">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="eyebrow mb-4">
              <Sparkles size={13} className="text-accent" />
              {productThemes[0]?.data.name ?? 'Круглый год'}
            </span>
            <h1 className="display-title text-4xl leading-[1.02] sm:text-5xl">{product.title}</h1>
            <p className="mt-3 text-lg font-semibold text-muted">{product.subtitle}</p>
            <p className="mt-5 text-sm leading-7 text-muted">{product.description}</p>

            <div className="mt-6 flex items-end gap-3">
              <span className="font-display text-3xl font-semibold">{Money.from(product.price).format()}</span>
              <span className="pb-1 text-xs text-muted">базовая цена · без доставки</span>
            </div>

            {!inStock && (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                Нет в продаже. Товар временно недоступен для заказа.
              </div>
            )}

            <div className="mt-6 grid gap-3 rounded-3xl border border-line bg-surface p-4 text-sm">
              {[
                'Можно изменить цвет, размер и надпись',
                'Проверим макет перед печатью',
                'Упакуем так, чтобы можно было дарить',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Check size={12} />
                  </span>
                  <span className="text-muted">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-bold text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Truck size={14} className="text-accent" /> Доставка по России
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-accent" /> Ручная проверка
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-10">
        <Configurator product={product} template={template} />
      </section>

      {related.length > 0 && (
        <section className="container-page mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow mb-3">Ещё идеи</span>
              <h2 className="display-title text-3xl sm:text-4xl">Может понравиться</h2>
            </div>
            <LinkButton to="/catalog" variant="secondary">
              Весь каталог
            </LinkButton>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
