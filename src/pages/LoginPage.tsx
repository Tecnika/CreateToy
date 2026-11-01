import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { DEMO_AUTH_HINT } from '../core/auth/MockAuthAdapter';
import type { Role, UserProfile } from '../core/domain/types';
import { useAuth } from '../state/AuthContext';
import { Logo } from '../components/ui/Logo';

function homeFor(user: UserProfile): string {
  if (user.role === 'admin') return '/admin';
  if (user.role === 'manager') return '/manager';
  return '/account';
}

const demoAccounts: { role: Role; title: string; description: string }[] = [
  { role: 'buyer', title: 'Покупатель', description: 'Корзина, заказы и адреса' },
  { role: 'manager', title: 'Менеджер', description: 'Заказы и статусы' },
  { role: 'admin', title: 'Администратор', description: 'Всё управление сайтом' },
];

export function LoginPage() {
  const { signIn, signInDemo } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function complete(user: UserProfile) {
    navigate(next || homeFor(user), { replace: true });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signIn(login.trim(), password);
      await complete(user);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось войти.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo(role: Role) {
    setError('');
    setLoading(true);
    try {
      const user = await signInDemo(role);
      await complete(user);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось войти в демо-аккаунт.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSocial(provider: string) {
    setError('');
    setLoading(true);
    try {
      const user = await signInDemo('buyer');
      navigate(next || homeFor(user), { replace: true, state: { socialDemo: provider } });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось войти.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container-page grid min-h-[calc(100vh-170px)] items-center py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
      <div className="mx-auto w-full max-w-md">
        <div className="surface-card p-6 sm:p-8">
          <Logo />
          <h1 className="display-title mt-6 text-3xl">С возвращением</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Войдите, чтобы видеть статусы заказов и сохранять адреса.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="field-label" htmlFor="login">Email или логин</label>
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="login"
                  className="input pl-11"
                  value={login}
                  onChange={(event) => setLogin(event.target.value)}
                  placeholder="buyer@createtoy.local"
                  autoComplete="username"
                  required
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="field-label" htmlFor="password">Пароль</label>
                <span className="mb-1.5 text-[10px] text-muted">Демо: {DEMO_AUTH_HINT.password}</span>
              </div>
              <div className="relative">
                <LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input px-11"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-2"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{error}</p>}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Входим...' : 'Войти'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            <span className="h-px flex-1 bg-line" />
            или
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => handleSocial('Google')} className="btn-secondary text-xs" disabled={loading}>
              <span className="font-display text-sm font-semibold">G</span>
              Google · демо
            </button>
            <button type="button" onClick={() => handleSocial('VK')} className="btn-secondary text-xs" disabled={loading}>
              <span className="font-display text-sm font-semibold">VK</span>
              VK ID · демо
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] leading-4 text-muted">
            Соцвход в демо-режиме открывает аккаунт покупателя. Настоящие Google и VK подключаются через Firebase.
          </p>

          <p className="mt-6 text-center text-sm text-muted">
            Нет аккаунта?{' '}
            <Link to={next ? `/register?next=${encodeURIComponent(next)}` : '/register'} className="font-bold text-accent hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-5xl border border-line bg-surface/60 p-8 shadow-soft">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-soft blur-3xl" />
          <span className="eyebrow relative">
            <Sparkles size={13} className="text-accent" /> Демо-режим
          </span>
          <h2 className="display-title relative mt-4 text-3xl">Попробуйте все роли</h2>
          <p className="relative mt-2 max-w-md text-sm leading-6 text-muted">
            Данные хранятся только в этом браузере. Выберите готовый аккаунт — пароль одинаковый для всех.
          </p>
          <div className="relative mt-6 space-y-2.5">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => handleDemo(account.role)}
                disabled={loading}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-left transition hover:border-accent/50 hover:bg-surface-2"
              >
                <span>
                  <span className="block text-sm font-extrabold">{account.title}</span>
                  <span className="block text-xs text-muted">{account.description}</span>
                </span>
                <ArrowRight size={16} className="text-accent" />
              </button>
            ))}
          </div>
          <div className="relative mt-5 flex items-start gap-2.5 rounded-2xl bg-surface-2/70 p-3.5 text-[11px] leading-5 text-muted">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent" />
            Для входа администратора в демо используйте аккаунт «Администратор». Пароль — {DEMO_AUTH_HINT.password}.
          </div>
        </div>
      </div>
    </section>
  );
}
