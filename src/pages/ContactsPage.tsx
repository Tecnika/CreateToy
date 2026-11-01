import { useState, type FormEvent } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useSettings } from '../state/SettingsContext';
import { PageHero } from '../components/ui/PageHero';

export function ContactsPage() {
  const { settings } = useSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    const subject = encodeURIComponent(`Вопрос с сайта ${settings.siteName}`);
    const body = encodeURIComponent(`Имя: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${settings.contactEmail}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <>
      <PageHero
        eyebrow="Контакты"
        title="Давайте"
        accent="поговорим"
        description="Нужна нестандартная идея, корпоративный заказ или просто совет по подарку? Напишите — ответим и предложим варианты."
        aside={
          <div className="space-y-3">
            <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2/60 p-3.5 text-sm font-semibold transition hover:border-accent/50">
              <Mail size={17} className="text-accent" /> {settings.contactEmail}
            </a>
            <a href={`tel:${settings.contactPhone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2/60 p-3.5 text-sm font-semibold transition hover:border-accent/50">
              <Phone size={17} className="text-accent" /> {settings.contactPhone}
            </a>
          </div>
        }
      />

      <section className="container-page mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-start">
        <form onSubmit={submit} className="surface-card p-5 sm:p-6">
          <h2 className="display-title text-2xl">Написать нам</h2>
          <p className="mt-1 text-xs text-muted">Форма откроет ваш почтовый клиент с готовым письмом.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="contact-name">Имя</label>
              <input id="contact-name" className="input" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div>
              <label className="field-label" htmlFor="contact-email">Email</label>
              <input id="contact-email" type="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="contact-message">Сообщение</label>
              <textarea id="contact-message" className="textarea min-h-40" value={message} onChange={(event) => setMessage(event.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-5">
            <Send size={16} /> Отправить письмо
          </button>
          {sent && <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">Почтовый клиент открыт. Если он не появился — напишите напрямую на {settings.contactEmail}.</p>}
        </form>

        <aside className="space-y-4">
          <div className="surface-card p-5">
            <h2 className="display-title text-xl">Реквизиты и самовывоз</h2>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-start gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0 text-accent" /><span className="text-muted">{settings.address}</span></p>
              <p className="flex items-start gap-2.5"><Send size={16} className="mt-0.5 shrink-0 text-accent" /><span className="text-muted">{settings.telegram}</span></p>
              <p className="flex items-start gap-2.5"><Mail size={16} className="mt-0.5 shrink-0 text-accent" /><span className="break-all text-muted">{settings.contactEmail}</span></p>
            </div>
          </div>
          <div className="rounded-3xl border border-line bg-surface-2/50 p-5 text-xs leading-5 text-muted">
            <p className="font-bold text-ink">Время ответа</p>
            <p className="mt-1">Обычно отвечаем в течение рабочего дня. Если заказ срочный — укажите дату в сообщении.</p>
          </div>
          <div className="rounded-3xl border border-line bg-surface-2/50 p-5 text-xs leading-5 text-muted">
            <p className="font-bold text-ink">Корпоративные заказы</p>
            <p className="mt-1">Печатаем небольшие партии с логотипом или именной гравировкой. Напишите количество и желаемую дату.</p>
          </div>
        </aside>
      </section>
    </>
  );
}
