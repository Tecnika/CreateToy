import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useAuth } from '../../state/AuthContext';
import { useSettings } from '../../state/SettingsContext';
import { Logo } from '../ui/Logo';

export function Footer() {
  const { settings } = useSettings();
  const { isDemo } = useAuth();

  return (
    <footer className="mt-24 border-t border-line bg-surface/60">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">{settings.tagline}</p>
          <p className="mt-5 inline-flex rounded-full bg-accent-soft px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent-2">
            {isDemo ? 'Демо-режим · данные в браузере' : 'Облачный аккаунт · Supabase'}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Магазин</h3>
          <div className="mt-4 flex flex-col gap-2.5 text-sm font-semibold">
            <Link to="/catalog" className="transition hover:text-accent">Каталог</Link>
            <Link to="/holidays" className="transition hover:text-accent">Праздники</Link>
            <Link to="/how-it-works" className="transition hover:text-accent">Как это работает</Link>
            <Link to="/cart" className="transition hover:text-accent">Корзина</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Покупателям</h3>
          <div className="mt-4 flex flex-col gap-2.5 text-sm font-semibold">
            <Link to="/login" className="transition hover:text-accent">Вход и регистрация</Link>
            <Link to="/account" className="transition hover:text-accent">Личный кабинет</Link>
            <Link to="/legal/privacy" className="transition hover:text-accent">Политика конфиденциальности</Link>
            <Link to="/legal/offer" className="transition hover:text-accent">Оферта</Link>
            <Link to="/legal/returns" className="transition hover:text-accent">Возврат</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Связаться</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm font-semibold">
            <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-2 transition hover:text-accent">
              <Mail size={15} className="text-accent" />
              {settings.contactEmail}
            </a>
            <a href={`tel:${settings.contactPhone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 transition hover:text-accent">
              <Phone size={15} className="text-accent" />
              {settings.contactPhone}
            </a>
            <span className="flex items-center gap-2">
              <Send size={15} className="text-accent" />
              {settings.telegram}
            </span>
            <span className="flex items-start gap-2 text-muted">
              <MapPin size={15} className="mt-0.5 shrink-0 text-accent" />
              {settings.address}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {settings.siteName}. Сделано с любовью к деталям.</span>
          <span>Цены указаны в рублях. Оплату подтверждает менеджер после связи.</span>
        </div>
      </div>
    </footer>
  );
}
