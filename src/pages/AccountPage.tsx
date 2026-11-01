import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, LayoutDashboard, LogOut, MapPin, Pencil, Plus, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { services } from '../core/container';
import { Money } from '../core/domain/Money';
import { ROLE_LABELS } from '../core/domain/Role';
import type { Address } from '../core/domain/types';
import { useAuth } from '../state/AuthContext';
import { PageHero } from '../components/ui/PageHero';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { LinkButton } from '../components/ui/Button';
import { formatDate } from '../utils/format';

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

export function AccountPage() {
  const { user, isStaff, isAdmin, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [editingProfile, setEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [showAddress, setShowAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState<AddressDraft>(emptyAddress);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;

  const currentUser = user;
  const orders = services.orders.listForUser(currentUser.uid);
  const activeOrders = orders.filter((order) => !['completed', 'cancelled'].includes(order.data.status));

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await updateProfile({ displayName: displayName.trim(), phone: phone.trim() });
      setEditingProfile(false);
      setMessage('Профиль обновлён.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось сохранить профиль.');
    }
  }

  async function addAddress(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!addressDraft.city.trim() || !addressDraft.street.trim() || !addressDraft.house.trim()) {
      setError('Заполните город, улицу и дом.');
      return;
    }
    const address: Address = {
      id: crypto.randomUUID(),
      label: addressDraft.label.trim() || 'Адрес',
      recipient: addressDraft.recipient.trim() || currentUser.displayName,
      phone: addressDraft.phone.trim() || currentUser.phone || '',
      city: addressDraft.city.trim(),
      street: addressDraft.street.trim(),
      house: addressDraft.house.trim(),
      apartment: addressDraft.apartment.trim() || undefined,
      postalCode: addressDraft.postalCode.trim(),
      isDefault: currentUser.addresses.length === 0,
    };
    try {
      await updateProfile({ addresses: [...currentUser.addresses, address] });
      setAddressDraft(emptyAddress);
      setShowAddress(false);
      setMessage('Адрес добавлен.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось добавить адрес.');
    }
  }

  async function removeAddress(id: string) {
    setError('');
    const next = currentUser.addresses.filter((address) => address.id !== id);
    if (next.length > 0 && !next.some((address) => address.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }
    try {
      await updateProfile({ addresses: next });
      setMessage('Адрес удалён.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось удалить адрес.');
    }
  }

  async function makeDefault(id: string) {
    setError('');
    try {
      await updateProfile({
        addresses: currentUser.addresses.map((address) => ({ ...address, isDefault: address.id === id })),
      });
      setMessage('Основной адрес изменён.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось изменить адрес.');
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <>
      <PageHero
        eyebrow="Личный кабинет"
        title={`Здравствуйте, ${user.displayName.split(' ')[0]}`}
        description="Здесь собраны ваши заказы, адреса и данные для связи. Статусы обновляет менеджер после каждого этапа."
        aside={
          <div className="rounded-3xl border border-line bg-surface-2/60 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white">
                <UserRound size={22} />
              </span>
              <div>
                <p className="text-sm font-extrabold">{ROLE_LABELS[user.role]}</p>
                <p className="text-xs text-muted">С нами с {formatDate(user.createdAt)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {isStaff && (
                <LinkButton to={isAdmin ? '/admin' : '/manager'} variant="secondary" className="px-3 py-2 text-xs">
                  <LayoutDashboard size={14} />
                  {isAdmin ? 'Админка' : 'Заказы'}
                </LinkButton>
              )}
              <button type="button" onClick={handleSignOut} className="btn-ghost px-3 py-2 text-xs">
                <LogOut size={14} />
                Выйти
              </button>
            </div>
          </div>
        }
      />

      <section className="container-page mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="space-y-5">
          <div className="surface-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="display-title text-xl">Профиль</h2>
              <button type="button" onClick={() => setEditingProfile((value) => !value)} className="btn-icon h-9 w-9" aria-label="Редактировать профиль">
                <Pencil size={15} />
              </button>
            </div>

            {editingProfile ? (
              <form onSubmit={saveProfile} className="mt-4 space-y-3">
                <div>
                  <label className="field-label" htmlFor="profile-name">Имя</label>
                  <input id="profile-name" className="input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
                </div>
                <div>
                  <label className="field-label" htmlFor="profile-phone">Телефон</label>
                  <input id="profile-phone" className="input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+7..." />
                </div>
                <button type="submit" className="btn-primary w-full py-2.5 text-xs">
                  <Check size={15} /> Сохранить
                </button>
              </form>
            ) : (
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <UserRound size={16} className="mt-0.5 shrink-0 text-accent" />
                  <span className="font-semibold">{user.displayName}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent" />
                  <span className="text-muted">{user.email}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-accent" />
                  <span className="text-muted">{user.phone || 'Телефон не указан'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="surface-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="display-title text-xl">Адреса</h2>
              <button type="button" onClick={() => setShowAddress((value) => !value)} className="btn-icon h-9 w-9" aria-label="Добавить адрес">
                <Plus size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {user.addresses.length === 0 && <p className="text-sm text-muted">Пока нет сохранённых адресов.</p>}
              {user.addresses.map((address) => (
                <div key={address.id} className="rounded-2xl border border-line bg-surface-2/40 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-extrabold">{address.label}</p>
                    {address.isDefault && <span className="badge">основной</span>}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {address.city}, {address.street}, {address.house}
                    {address.apartment ? `, кв. ${address.apartment}` : ''} · {address.postalCode}
                  </p>
                  <div className="mt-2 flex gap-2">
                    {!address.isDefault && (
                      <button type="button" onClick={() => makeDefault(address.id)} className="text-[10px] font-bold text-accent hover:underline">
                        Сделать основным
                      </button>
                    )}
                    <button type="button" onClick={() => removeAddress(address.id)} className="ml-auto flex items-center gap-1 text-[10px] font-bold text-muted hover:text-rose-600">
                      <Trash2 size={11} /> Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showAddress && (
              <form onSubmit={addAddress} className="mt-4 space-y-3 border-t border-line pt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Название</label>
                    <input className="input" value={addressDraft.label} onChange={(event) => setAddressDraft({ ...addressDraft, label: event.target.value })} />
                  </div>
                  <div>
                    <label className="field-label">Получатель</label>
                    <input className="input" value={addressDraft.recipient} onChange={(event) => setAddressDraft({ ...addressDraft, recipient: event.target.value })} placeholder={user.displayName} />
                  </div>
                  <div>
                    <label className="field-label">Город</label>
                    <input className="input" value={addressDraft.city} onChange={(event) => setAddressDraft({ ...addressDraft, city: event.target.value })} />
                  </div>
                  <div>
                    <label className="field-label">Улица</label>
                    <input className="input" value={addressDraft.street} onChange={(event) => setAddressDraft({ ...addressDraft, street: event.target.value })} />
                  </div>
                  <div>
                    <label className="field-label">Дом</label>
                    <input className="input" value={addressDraft.house} onChange={(event) => setAddressDraft({ ...addressDraft, house: event.target.value })} />
                  </div>
                  <div>
                    <label className="field-label">Квартира</label>
                    <input className="input" value={addressDraft.apartment} onChange={(event) => setAddressDraft({ ...addressDraft, apartment: event.target.value })} />
                  </div>
                  <div>
                    <label className="field-label">Индекс</label>
                    <input className="input" value={addressDraft.postalCode} onChange={(event) => setAddressDraft({ ...addressDraft, postalCode: event.target.value })} inputMode="numeric" />
                  </div>
                  <div>
                    <label className="field-label">Телефон</label>
                    <input className="input" value={addressDraft.phone} onChange={(event) => setAddressDraft({ ...addressDraft, phone: event.target.value })} placeholder="+7..." />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-2.5 text-xs">
                  <Plus size={15} /> Добавить адрес
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {(message || error) && (
            <div className={`rounded-2xl px-4 py-3 text-xs font-semibold ${error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {error || message}
            </div>
          )}

          <div className="surface-card p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="display-title text-2xl">Мои заказы</h2>
                <p className="mt-1 text-xs text-muted">
                  Всего {orders.length} · в работе {activeOrders.length}
                </p>
              </div>
              <LinkButton to="/catalog" variant="secondary" className="px-3 py-2 text-xs">
                В каталог <ArrowRight size={14} />
              </LinkButton>
            </div>

            {orders.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  title="Заказов пока нет"
                  description="Когда оформите первый заказ, он появится здесь со статусом и историей."
                  action={<LinkButton to="/catalog">Выбрать сувенир</LinkButton>}
                />
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {orders.map((order) => (
                  <Link
                    key={order.data.id}
                    to={`/account/orders/${order.data.id}`}
                    className="block rounded-2xl border border-line bg-surface-2/35 p-4 transition hover:border-accent/50 hover:bg-surface-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-semibold">{order.data.number}</span>
                        <StatusBadge status={order.data.status} />
                      </div>
                      <span className="text-xs text-muted">{formatDate(order.data.createdAt)}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted">
                        {order.data.items.map((item) => item.title).join(' · ')}
                      </p>
                      <p className="font-display text-lg font-semibold">{Money.from(order.data.total).format()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
