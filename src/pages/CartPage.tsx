import { ArrowRight, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { services } from '../core/container';
import { Money } from '../core/domain/Money';
import { useCart } from '../state/CartContext';
import { PageHero } from '../components/ui/PageHero';
import { EmptyState } from '../components/ui/EmptyState';
import { LinkButton } from '../components/ui/Button';
import { QuantityControl } from '../components/ui/QuantityControl';
import { ProductMedia } from '../components/product/ProductMedia';
import { plural } from '../utils/format';

export function CartPage() {
  const { lines, count, subtotal, updateQuantity, remove } = useCart();
  const unavailableLines = lines.filter((line) => {
    const product = services.catalog.byId(line.productId);
    return !product || product.inStock === false;
  });

  return (
    <>
      <PageHero
        eyebrow="Корзина"
        title="Почти"
        accent="готово"
        description="Проверьте состав заказа и количество. Доставку и способ оплаты согласует менеджер после оформления."
        aside={
          <div className="rounded-3xl border border-line bg-surface-2/60 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white">
                <ShoppingBag size={20} />
              </span>
              <div>
                <p className="font-display text-xl font-semibold">
                  {count} {plural(count, 'товар', 'товара', 'товаров')}
                </p>
                <p className="text-xs text-muted">в корзине</p>
              </div>
            </div>
          </div>
        }
      />

      <section className="container-page mt-8">
        {lines.length === 0 ? (
          <EmptyState
            title="Корзина пока пуста"
            description="Выберите готовый сувенир или соберите свой в конструкторе. Мы сохраним выбор, пока вы гуляете по каталогу."
            action={<LinkButton to="/catalog">Перейти в каталог</LinkButton>}
          />
        ) : (
          <div className="space-y-4">
            {unavailableLines.length > 0 && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                Некоторые товары больше не в продаже. Удалите их из корзины, чтобы оформить заказ.
              </div>
            )}
            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
            <div className="space-y-3">
              {lines.map((line) => {
                const product = services.catalog.byId(line.productId);
                const unavailable = !product || product.inStock === false;
                return (
                  <div key={line.id} className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                    <Link
                      to={`/product/${line.productSlug}`}
                      className="relative h-28 w-full shrink-0 overflow-hidden rounded-3xl sm:h-24 sm:w-24"
                      style={{
                        background: `linear-gradient(145deg, ${line.art.colors[1]} 0%, ${line.art.colors[0]} 100%)`,
                      }}
                    >
                      <ProductMedia
                        art={line.art}
                        imageUrl={product ? product.imageUrl : line.imageUrl}
                        label={line.productTitle}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/product/${line.productSlug}`} className="display-title text-lg hover:text-accent">
                          {line.productTitle}
                        </Link>
                        {unavailable && <span className="badge bg-rose-100 text-rose-700">Нет в продаже</span>}
                      </div>
                      {line.configurationLabel && (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{line.configurationLabel}</p>
                      )}
                      <p className="mt-2 text-xs font-bold text-muted">{Money.from(line.unitPrice).format()} / шт.</p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <QuantityControl value={line.quantity} onChange={(value) => updateQuantity(line.id, value)} />
                      <p className="font-display text-lg font-semibold">
                        {Money.from(line.unitPrice).multiply(line.quantity).format()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(line.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-full text-muted transition hover:bg-rose-50 hover:text-rose-600 sm:self-center"
                      aria-label={`Удалить ${line.productTitle}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                );
              })}
            </div>

            <aside className="surface-card sticky top-28 p-5 sm:p-6">
              <h2 className="display-title text-2xl">Итого</h2>
              <div className="mt-5 space-y-3 border-b border-line pb-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Товары</span>
                  <span className="font-bold">{subtotal.format()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Доставка</span>
                  <span className="text-right text-xs font-semibold text-muted">рассчитает менеджер</span>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-sm font-bold">К оплате</span>
                <span className="font-display text-2xl font-semibold">{subtotal.format()}</span>
              </div>
              {unavailableLines.length > 0 ? (
                <button type="button" disabled className="btn-primary mt-5 w-full opacity-50">
                  Оформить заказ
                </button>
              ) : (
                <LinkButton to="/checkout" className="mt-5 w-full">
                  Оформить заказ
                  <ArrowRight size={17} />
                </LinkButton>
              )}
              <p className="mt-3 flex items-start gap-2 text-[10px] leading-4 text-muted">
                <Truck size={14} className="mt-0.5 shrink-0 text-accent" />
                Стоимость доставки добавим после согласования. Оплата — только после подтверждения менеджера.
              </p>
              <Link to="/catalog" className="mt-4 block text-center text-xs font-bold text-accent hover:underline">
                Продолжить покупки
              </Link>
            </aside>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
