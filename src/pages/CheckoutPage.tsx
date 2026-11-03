import { useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, Check, MapPin, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { services } from '../core/container';
import type { Address } from '../core/domain/types';
import { useAuth } from '../state/AuthContext';
import { useCart } from '../state/CartContext';
import { useSettings } from '../state/SettingsContext';
import { PageHero } from '../components/ui/PageHero';
import { EmptyState } from '../components/ui/EmptyState';
import { LinkButton } from '../components/ui/Button';
import { SouvenirArt } from '../components/product/SouvenirArt';

interface AddressDraft {
  label: string;
  recipient: string;
  phone: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  postalCode: string;
}

const emptyAddress: AddressDraft = {
  label: 'Дом',
  recipient: '',
  phone: '',
  city: '',
  street: '',
  house: '',
  apartment: '',
  postalCode: '',
};

export function CheckoutPage() {
  const { user, updateProfile } = useAuth();
  const { lines, subtotal, clear } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const defaultAddress = user?.addresses.find((address) => address.isDefault) ?? user?.addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddress?.id ?? 'new');
  const [addressDraft, setAddressDraft] = useState<AddressDraft>({
    ...emptyAddress,
    recipient: user?.displayName ?? '',
    phone: user?.phone ?? '',
  });
  const [saveAddress, setSaveAddress] = useState(true);
  const [customerName, setCustomerName] = useState(user?.displayName ?? '');
  const [customerEmail, setCustomerEmail] = useState(user?.email ?? '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone ?? '');
  const [deliveryMethod, setDeliveryMethod] = useState(settings.deliveryMethods[0] ?? 'СДЭК');
  const [paymentMethod, setPaymentMethod] = useState(settings.paymentMethods[0] ?? 'Перевод по реквизитам');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const selectedAddress = useMemo(
    () => user?.addresses.find((address) => address.id === selectedAddressId),
    [user?.addresses, selectedAddressId],
  );

  function updateDraft(key: keyof AddressDraft, value: string) {
    setAddressDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    const nextErrors: string[] = [];
    if (customerName.trim().length < 2) nextErrors.push('Укажите имя получателя.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) nextErrors.push('Укажите корректный email.');
    if (customerPhone.trim().length < 6) nextErrors.push('Укажите телефон для связи.');
    if (!selectedAddress) {
      if (addressDraft.recipient.trim().length < 2) nextErrors.push('Заполните получателя в адресе.');
      if (addressDraft.city.trim().length < 2) nextErrors.push('Укажите город.');
      if (addressDraft.street.trim().length < 2) nextErrors.push('Укажите улицу.');
      if (!addressDraft.house.trim()) nextErrors.push('Укажите дом.');
      if (!/^\d{5,6}$/.test(addressDraft.postalCode.trim())) nextErrors.push('Укажите индекс (5–6 цифр).');
    }
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setErrors([]);

    let address: Address;
    if (selectedAddress) {
      address = selectedAddress;
    } else {
      address = {
        id: crypto.randomUUID(),
        label: addressDraft.label.trim() || 'Адрес',
        recipient: addressDraft.recipient.trim(),
        phone: addressDraft.phone.trim() || customerPhone.trim(),
        city: addressDraft.city.trim(),
        street: addressDraft.street.trim(),
        house: addressDraft.house.trim(),
        apartment: addressDraft.apartment.trim() || undefined,
        postalCode: addressDraft.postalCode.trim(),
        isDefault: user.addresses.length === 0,
      };
    }

    try {
      const order = await services.orders.createOrder(user, lines, {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        address,
        comment: comment.trim(),
        deliveryMethod,
        paymentMethod,
      });

      if (!selectedAddress && saveAddress) {
        try {
          await updateProfile({ addresses: [...user.addresses, address] });
        } catch (caught) {
          console.warn('Не удалось сохранить адрес в профиле:', caught);
        }
      }

      clear();
      navigate(`/account/orders/${order.data.id}`, { state: { justCreated: true } });
    } catch (caught) {
      setErrors([caught instanceof Error ? caught.message : 'Не удалось создать заказ. Попробуйте ещё раз.']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  if (lines.length === 0) {
    return (
      <section className="container-page pt-12">
        <EmptyState
          title="Нечего оформлять"
          description="Корзина пуста. Добавьте сувенир в каталоге или соберите подарок в конструкторе."
          action={<LinkButton to="/catalog">Перейти в каталог</LinkButton>}
        />
      </section>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Оформление"
        title="Последний"
        accent="шаг"
        description="Оставьте контакты и адрес. Менеджер свяжется по email, подтвердит состав, доставку и оплату — после этого заказ уйдёт в печать."
      />

      <section className="container-page mt-8">
        <Link to="/cart" className="mb-5 inline-flex items-center gap-1.5 text-xs font-bold text-muted transition hover:text-accent">
          <ArrowLeft size={15} /> Вернуться в корзину
        </Link>

        {errors.length > 0 && (
          <div className="mb-5 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <div className="space-y-5">
            <section className="surface-card p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <PackageCheck size={19} />
                </span>
                <div>
                  <h2 className="display-title text-xl">Контакты</h2>
                  <p className="text-xs text-muted">По ним менеджер подтвердит заказ</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor="checkout-name">Имя и фамилия</label>
                  <input
                    id="checkout-name"
                    className="input"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="checkout-email">Email</label>
                  <input
                    id="checkout-email"
                    type="email"
                    className="input"
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="checkout-phone">Телефон</label>
                  <input
                    id="checkout-phone"
                    className="input"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    autoComplete="tel"
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>
              </div>
            </section>

            <section className="surface-card p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <MapPin size={19} />
                </span>
                <div>
                  <h2 className="display-title text-xl">Адрес доставки</h2>
                  <p className="text-xs text-muted">Можно выбрать сохранённый или добавить новый</p>
                </div>
              </div>

              {user.addresses.length > 0 && (
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {user.addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition ${
                        selectedAddressId === address.id
                          ? 'border-accent bg-accent-soft/60'
                          : 'border-line bg-surface hover:border-accent/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="sr-only"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                      />
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold">{address.label}</span>
                        {address.isDefault && <span className="badge">по умолчанию</span>}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted">
                        {address.city}, {address.street}, {address.house}
                        {address.apartment ? `, кв. ${address.apartment}` : ''} · {address.postalCode}
                      </span>
                    </label>
                  ))}
                  <label
                    className={`cursor-pointer rounded-2xl border p-3.5 transition ${
                      selectedAddressId === 'new' ? 'border-accent bg-accent-soft/60' : 'border-line bg-surface hover:border-accent/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      className="sr-only"
                      checked={selectedAddressId === 'new'}
                      onChange={() => setSelectedAddressId('new')}
                    />
                    <span className="text-sm font-extrabold">+ Новый адрес</span>
                    <span className="mt-1 block text-xs text-muted">Заполнить вручную</span>
                  </label>
                </div>
              )}

              {!selectedAddress && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label" htmlFor="address-label">Название адреса</label>
                    <input id="address-label" className="input" value={addressDraft.label} onChange={(event) => updateDraft('label', event.target.value)} placeholder="Дом, работа..." />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="address-recipient">Получатель</label>
                    <input id="address-recipient" className="input" value={addressDraft.recipient} onChange={(event) => updateDraft('recipient', event.target.value)} />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="address-phone">Телефон получателя</label>
                    <input id="address-phone" className="input" value={addressDraft.phone} onChange={(event) => updateDraft('phone', event.target.value)} placeholder="+7..." />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="address-city">Город</label>
                    <input id="address-city" className="input" value={addressDraft.city} onChange={(event) => updateDraft('city', event.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor="address-street">Улица</label>
                    <input id="address-street" className="input" value={addressDraft.street} onChange={(event) => updateDraft('street', event.target.value)} />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="address-house">Дом</label>
                    <input id="address-house" className="input" value={addressDraft.house} onChange={(event) => updateDraft('house', event.target.value)} />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="address-apartment">Квартира / офис</label>
                    <input id="address-apartment" className="input" value={addressDraft.apartment} onChange={(event) => updateDraft('apartment', event.target.value)} />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="address-postal">Индекс</label>
                    <input id="address-postal" className="input" value={addressDraft.postalCode} onChange={(event) => updateDraft('postalCode', event.target.value)} inputMode="numeric" />
                  </div>
                  <label className="flex cursor-pointer items-center gap-2.5 self-end pb-2 text-xs font-semibold text-muted">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(event) => setSaveAddress(event.target.checked)}
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                    Сохранить адрес в аккаунте
                  </label>
                </div>
              )}
            </section>

            <section className="surface-card p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <Truck size={19} />
                </span>
                <div>
                  <h2 className="display-title text-xl">Доставка и оплата</h2>
                  <p className="text-xs text-muted">Стоимость доставки подтвердит менеджер</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="delivery-method">Способ доставки</label>
                  <select id="delivery-method" className="select" value={deliveryMethod} onChange={(event) => setDeliveryMethod(event.target.value)}>
                    {settings.deliveryMethods.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="payment-method">Способ оплаты</label>
                  <select id="payment-method" className="select" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                    {settings.paymentMethods.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor="checkout-comment">Комментарий к заказу</label>
                  <textarea
                    id="checkout-comment"
                    className="textarea"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Пожелания по цвету, упаковке, дате или надписи"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-surface-2/70 p-3.5 text-xs leading-5 text-muted">
                <ShieldCheck size={17} className="mt-0.5 shrink-0 text-accent" />
                Оплата подтверждается вручную после связи с менеджером. Мы не списываем деньги автоматически.
              </div>
            </section>
          </div>

          <aside className="surface-card sticky top-28 p-5 sm:p-6">
            <h2 className="display-title text-xl">Ваш заказ</h2>
            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {lines.map((line) => (
                <div key={line.id} className="flex items-center gap-3">
                  <div
                    className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl"
                    style={{ background: `linear-gradient(145deg, ${line.art.colors[1]}, ${line.art.colors[0]})` }}
                  >
                    <SouvenirArt art={line.art} label={line.productTitle} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{line.productTitle}</p>
                    <p className="text-xs text-muted">{line.quantity} шт.</p>
                  </div>
                  <p className="text-xs font-bold">{line.unitPrice * line.quantity} ₽</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Товары</span>
                <span className="font-bold">{subtotal.format()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Доставка</span>
                <span className="text-xs font-semibold text-muted">после согласования</span>
              </div>
              <div className="flex items-end justify-between pt-1">
                <span className="font-bold">Итого</span>
                <span className="font-display text-2xl font-semibold">{subtotal.format()}</span>
              </div>
            </div>

            <button type="submit" className="btn-primary mt-5 w-full" disabled={submitting}>
              {submitting ? 'Создаём заказ...' : 'Создать заказ'}
              {!submitting && <Check size={17} />}
            </button>
            <p className="mt-3 text-center text-[10px] leading-4 text-muted">
              Нажимая кнопку, вы соглашаетесь с условиями оферты и политикой конфиденциальности.
            </p>
          </aside>
        </form>
      </section>
    </>
  );
}
