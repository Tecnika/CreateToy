import { useMemo, useState } from 'react';
import { Search, ShieldCheck, UserRound } from 'lucide-react';
import { services } from '../../core/container';
import { ROLE_LABELS } from '../../core/domain/Role';
import type { Role } from '../../core/domain/types';
import { useAuth } from '../../state/AuthContext';
import { formatDate } from '../../utils/format';

const roles: Role[] = ['buyer', 'manager', 'admin'];

export function AdminUsersPage() {
  const { user: currentUser, isDemo } = useAuth();
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const users = useMemo(() => services.users.list(), [version]);
  const orders = useMemo(() => services.orders.listAll(), [version]);
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter(
      (user) =>
        user.displayName.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized),
    );
  }, [users, query]);

  async function changeRole(uid: string, role: Role) {
    if (busy) return;
    setMessage('');
    setError('');
    const target = users.find((user) => user.uid === uid);
    if (!target) return;
    if (target.role === 'admin' && role !== 'admin' && users.filter((user) => user.role === 'admin').length === 1) {
      setError('Нельзя убрать последнего администратора.');
      return;
    }
    setBusy(true);
    try {
      await services.users.updateRole(uid, role);
      setVersion((value) => value + 1);
      setMessage(`Роль «${target.displayName}» изменена на «${ROLE_LABELS[role]}».`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось изменить роль.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="eyebrow mb-3">Пользователи</span>
        <h1 className="display-title text-3xl sm:text-4xl">Роли и доступы</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Покупатель видит свои заказы, менеджер обрабатывает заказы, администратор управляет всем сайтом.
        </p>
      </div>

      {(message || error) && (
        <p className={`rounded-2xl px-4 py-3 text-xs font-semibold ${error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </p>
      )}

      <div className="surface-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold text-muted">Всего пользователей: <span className="text-ink">{users.length}</span></p>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="input py-2.5 pl-10 text-xs" placeholder="Имя или email" />
          </div>
        </div>

        <div className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line">
          {visible.map((user) => {
            const userOrders = orders.filter((order) => order.data.userId === user.uid).length;
            const isSelf = user.uid === currentUser?.uid;
            return (
              <div key={user.uid} className="flex flex-col gap-3 bg-surface p-4 sm:flex-row sm:items-center sm:gap-4">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${user.role === 'admin' ? 'bg-accent text-white' : 'bg-accent-soft text-accent'}`}>
                  {user.role === 'buyer' ? <UserRound size={18} /> : <ShieldCheck size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold">{user.displayName}</p>
                    {isSelf && <span className="badge">это вы</span>}
                  </div>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                  <p className="mt-0.5 text-[10px] text-muted">С {formatDate(user.createdAt)} · заказов: {userOrders}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Роль</span>
                  <select
                    className="select w-40 py-2.5 text-xs"
                    value={user.role}
                    disabled={isSelf || busy}
                    onChange={(event) => changeRole(user.uid, event.target.value as Role)}
                    aria-label={`Роль ${user.displayName}`}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
          {visible.length === 0 && <p className="bg-surface p-6 text-center text-sm text-muted">Пользователи не найдены.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface-2/50 p-4 text-xs leading-5 text-muted">
        <ShieldCheck size={15} className="mr-1.5 inline text-accent" />
        Свою роль изменить нельзя — это защищает от случайной потери доступа.{' '}
        {isDemo ? 'В демо-режиме роли сохраняются в браузере.' : 'В облачном режиме роли сохраняются в Supabase.'}
      </div>
    </div>
  );
}
