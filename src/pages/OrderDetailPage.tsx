import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Copy, Mail, MapPin, Package, Phone, Truck, XCircle } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { services } from '../core/container';
import { Money } from '../core/domain/Money';
import { useAuth } from '../state/AuthContext';
import { useSettings } from '../state/SettingsContext';
import { OrderProgress, OrderTimeline } from '../components/order/OrderTimeline';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ProductMedia } from '../components/product/ProductMedia';
import { EmptyState } from '../components/ui/EmptyState';
import { LinkButton } from '../components/ui/Button';
import { formatDate, formatDateTime } from '../utils/format';

export function OrderDetailPage() {
  const { orderId } = useParams();
  const { user, isStaff } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const [, setVersion] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const justCreated = Boolean((location.state as { justCreated?: boolean } | null)?.justCreated);

  if (!user) return null;

  const order = orderId ? services.orders.getById(orderId) : undefined;
  if (!order) {
    return (
      <section className="container-page pt-12">
        <EmptyState
          title="Заказ не найден"
          description="Возможно, ссылка устарела. Все ваши заказы доступны в личном кабинете."
          action={<LinkButton to="/account">В личный кабинет</LinkButton>}
        />
      </section>
    );
  }

  if (order.data.userId !== user.uid && !isStaff) {
    return (
      <section className="container-page pt-12">
        <EmptyState
          title="Нет доступа"
          description="Этот заказ оформлен на другой аккаунт."
          action={<LinkButton to="/account">В личный кабинет</LinkButton>}
        />
      </section>
    );
  }

  const data = order.data;
  const managerEmail = settings.contactEmail;

  async function cancelOrder() {
    if (!user) return;
    if (!window.confirm('Отменить заказ? Это действие нельзя отменить.')) return;
    setError('');
    try {
      await services.orders.cancelByBuyer(data.id, user.uid);
      setVersion((value) => value + 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось отменить заказ.');
    }
  }

  async function copyTracking() {
    if (!data.trackingNumber) return;
    await navigator.clipboard.writeText(data.trackingNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const backLink = isStaff && data.userId !== user.uid ? '/manager' : '/account';
  const mailSubject = encodeURIComponent(`Заказ ${data.number}`);
  const mailBody = encodeURIComponent(
    `Здравствуйте! Пишу по заказу ${data.number} от ${formatDate(data.createdAt)}.`,
  );

  return (
    <>
      <section className="container-page pt-6">
        <Link to={backLink} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted transition hover:text-accent">
          <ArrowLeft size={15} />
          {backLink === '/manager' ? 'К заказам' : 'В личный кабинет'}
        </Link>

        {justCreated && (
          <div className="mt-5 flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-extrabold">Заказ создан</p>
              <p className="mt-1 text-xs leading-5">
                Менеджер свяжется с вами по email {data.customerEmail}, подтвердит состав, доставку и оплату.
              </p>
            </div>
          </div>
        )}

        {error && <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{error}</p>}

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow mb-3">Заказ</span>
            <h1 className="display-title text-3xl sm:text-4xl">{data.number}</h1>
            <p className="mt-2 text-sm text-muted">
              Оформлен {formatDate(data.createdAt)} · обновлён {formatDateTime(data.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={data.status} className="px-3 py-1.5 text-xs" />
            {order.canBuyerCancel && data.userId === user.uid && (
              <button type="button" onClick={cancelOrder} className="btn-secondary px-3 py-2 text-xs text-rose-600 hover:border-rose-300">
                <XCircle size={15} /> Отменить
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
          <div className="space-y-5">
            <OrderProgress order={data} />

            <div className="surface-card p-5 sm:p-6">
              <h2 className="display-title text-xl">Состав заказа</h2>
              <div className="mt-4 space-y-4">
                {data.items.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="flex gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
                    <div
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl"
                      style={{ background: `linear-gradient(145deg, ${item.art.colors[1]}, ${item.art.colors[0]})` }}
                    >
                      <ProductMedia
                        art={item.art}
                        imageUrl={item.imageUrl}
                        label={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold">{item.title}</p>
                      {item.configurationLabel && <p className="mt-1 text-xs leading-5 text-muted">{item.configurationLabel}</p>}
                      <p className="mt-1.5 text-xs text-muted">
                        {item.quantity} шт. × {Money.from(item.unitPrice).format()}
                      </p>
                    </div>
                    <p className="font-display text-lg font-semibold">{Money.from(item.total).format()}</p>
                  </div>
                ))}
              </div>
            </div>

            <OrderTimeline order={data} />
          </div>

          <aside className="space-y-5">
            <div className="surface-card p-5">
              <h2 className="display-title text-xl">Доставка</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <Truck size={16} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <p className="font-bold">{data.deliveryMethod || 'Согласуется с менеджером'}</p>
                    <p className="mt-0.5 text-xs text-muted">Стоимость: {data.shippingCost > 0 ? Money.from(data.shippingCost).format() : 'уточняется'}</p>
                  </div>
                </div>
                {data.address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-accent" />
                    <p className="text-xs leading-5 text-muted">
                      {data.address.recipient}<br />
                      {data.address.city}, {data.address.street}, {data.address.house}
                      {data.address.apartment ? `, кв. ${data.address.apartment}` : ''}<br />
                      {data.address.postalCode}
                    </p>
                  </div>
                )}
                {data.trackingNumber && (
                  <div className="rounded-2xl bg-surface-2/60 p-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted">Трек-номер</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="font-mono text-xs font-bold">{data.trackingNumber}</p>
                      <button type="button" onClick={copyTracking} className="btn-icon h-7 w-7" aria-label="Скопировать трек-номер">
                        {copied ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="surface-card p-5">
              <h2 className="display-title text-xl">Оплата</h2>
              <div className="mt-3 text-sm">
                <p className="font-bold">{data.paymentMethod || 'Согласуется с менеджером'}</p>
                <p className="mt-1 text-xs leading-5 text-muted">Оплата подтверждается вручную. Статус изменится после проверки.</p>
              </div>
              <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Товары</span>
                  <span>{Money.from(data.subtotal).format()}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Доставка</span>
                  <span>{data.shippingCost > 0 ? Money.from(data.shippingCost).format() : 'уточняется'}</span>
                </div>
                <div className="flex items-end justify-between pt-1 font-bold text-ink">
                  <span>Итого</span>
                  <span className="font-display text-2xl">{Money.from(data.total).format()}</span>
                </div>
              </div>
            </div>

            <div className="surface-card p-5">
              <h2 className="display-title text-xl">Связь</h2>
              <div className="mt-3 space-y-2.5 text-sm">
                <p className="flex items-center gap-2"><Phone size={15} className="text-accent" /> {data.customerPhone}</p>
                <p className="flex items-center gap-2 break-all"><Mail size={15} className="text-accent" /> {data.customerEmail}</p>
              </div>
              {data.comment && (
                <div className="mt-4 rounded-2xl bg-surface-2/60 p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted">Комментарий</p>
                  <p className="mt-1 text-xs leading-5">{data.comment}</p>
                </div>
              )}
              <a
                href={`mailto:${managerEmail}?subject=${mailSubject}&body=${mailBody}`}
                className="btn-secondary mt-4 w-full text-xs"
              >
                <Mail size={15} /> Написать менеджеру
              </a>
            </div>

            <div className="rounded-3xl border border-line bg-surface-2/50 p-4 text-xs leading-5 text-muted">
              <p className="flex items-start gap-2">
                <Package size={15} className="mt-0.5 shrink-0 text-accent" />
                Храните номер заказа — по нему менеджер быстро найдёт вашу заявку.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
