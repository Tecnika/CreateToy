import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { EmailConfirmationRequiredError, type SocialProvider } from '../core/auth/AuthAdapter';
import { useAuth } from '../state/AuthContext';
import { Logo } from '../components/ui/Logo';

const benefits = [
  'Статусы заказов и история покупок',
  'Сохранённые адреса для быстрого оформления',
  'Доступ к конструктору и персональным подборкам',
];

export function RegisterPage() {
  const { register, signInDemo, signInWithProvider, isDemo } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов.');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают.');
      return;
    }
    setLoading(true);
    try {
      await register({ displayName, email, password });
      navigate(next || '/account', { replace: true });
    } catch (caught) {
      if (caught instanceof EmailConfirmationRequiredError) {
        setConfirmationEmail(email.trim().toLowerCase());
      } else {
        setError(caught instanceof Error ? caught.message : 'Не удалось зарегистрироваться.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSocial(provider: SocialProvider) {
    setError('');
    setLoading(true);
    try {
      if (isDemo) {
        await signInDemo('buyer');
        navigate(next || '/account', { replace: true });
        return;
      }
      await signInWithProvider(provider);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось войти.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container-page grid min-h-[calc(100vh-170px)] items-center py-10 lg:grid-cols-[1fr_0.9fr] lg:gap-10">
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-5xl border border-line bg-surface/60 p-8 shadow-soft">
          <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-accent-soft blur-3xl" />
          <span className="eyebrow relative">Личный кабинет</span>
          <h2 className="display-title relative mt-4 max-w-md text-4xl leading-tight">
            Подарки проще, когда всё <span className="text-accent">под рукой</span>
          </h2>
          <div className="relative mt-7 space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-2.5 text-sm font-semibold">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Check size={12} />
                </span>
                {benefit}
              </div>
            ))}
          </div>
          <p className="relative mt-7 rounded-2xl bg-surface-2/70 p-4 text-xs leading-5 text-muted">
            {isDemo
              ? 'Регистрация занимает меньше минуты. В демо-режиме аккаунт создаётся локально и не отправляется на сервер.'
              : 'Регистрация занимает меньше минуты. Аккаунт и заказы хранятся в защищённом облаке Supabase.'}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="surface-card p-6 sm:p-8">
          <Logo />
          <h1 className="display-title mt-6 text-3xl">Создать аккаунт</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Имя, email и пароль — этого достаточно.</p>

          {confirmationEmail && (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <div className="flex items-start gap-3">
                <Check size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-extrabold">Проверьте почту</p>
                  <p className="mt-1 text-xs leading-5">
                    Мы отправили письмо на <span className="font-bold">{confirmationEmail}</span>. Перейдите по ссылке
                    из письма, затем войдите в аккаунт.
                  </p>
                  <Link
                    to={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-900 hover:underline"
                  >
                    Перейти ко входу <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={`mt-6 space-y-4 ${confirmationEmail ? 'hidden' : ''}`}>
            <div>
              <label className="field-label" htmlFor="register-name">Имя</label>
              <div className="relative">
                <UserRound size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input id="register-name" className="input pl-11" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" required />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="register-email">Email</label>
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input id="register-email" type="email" className="input pl-11" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="register-password">Пароль</label>
              <div className="relative">
                <LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input id="register-password" type="password" className="input pl-11" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={6} required />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="register-confirm">Повторите пароль</label>
              <input id="register-confirm" type="password" className="input" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" required />
            </div>

            {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{error}</p>}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Создаём...' : 'Зарегистрироваться'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          {!confirmationEmail && (
            <>
              <div className="my-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                <span className="h-px flex-1 bg-line" /> или <span className="h-px flex-1 bg-line" />
              </div>

              <button type="button" onClick={() => handleSocial('google')} className="btn-secondary w-full text-xs" disabled={loading}>
                <span className="font-display text-sm font-semibold">G</span>
                Продолжить с Google{isDemo ? ' · демо' : ''}
              </button>
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            Уже есть аккаунт?{' '}
            <Link to={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="font-bold text-accent hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
