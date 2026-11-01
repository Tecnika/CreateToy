import { useState, type FormEvent } from 'react';
import { Check, Mail, MapPin, Phone, Send, Settings } from 'lucide-react';
import type { SiteSettings } from '../../core/domain/types';
import { useSettings } from '../../state/SettingsContext';

export function AdminSettingsPage() {
  const { settings, saveSettings } = useSettings();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [delivery, setDelivery] = useState(settings.deliveryMethods.join('\n'));
  const [payment, setPayment] = useState(settings.paymentMethods.join('\n'));
  const [message, setMessage] = useState('');

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    saveSettings({
      ...draft,
      deliveryMethods: delivery.split('\n').map((item) => item.trim()).filter(Boolean),
      paymentMethods: payment.split('\n').map((item) => item.trim()).filter(Boolean),
    });
    setMessage('Настройки сохранены.');
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="eyebrow mb-3">Настройки</span>
        <h1 className="display-title text-3xl sm:text-4xl">Магазин и контакты</h1>
        <p className="mt-2 text-sm text-muted">Эти данные используются в шапке, подвале, оформлении заказа и письмах.</p>
      </div>

      {message && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">{message}</p>}

      <form onSubmit={submit} className="space-y-5">
        <section className="surface-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Settings size={18} /></span>
            <div>
              <h2 className="display-title text-xl">Основное</h2>
              <p className="text-xs text-muted">Название и слоган бренда</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Название сайта</label>
              <input className="input" value={draft.siteName} onChange={(event) => update('siteName', event.target.value)} />
            </div>
            <div>
              <label className="field-label">Слоган</label>
              <input className="input" value={draft.tagline} onChange={(event) => update('tagline', event.target.value)} />
            </div>
          </div>
        </section>

        <section className="surface-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Mail size={18} /></span>
            <div>
              <h2 className="display-title text-xl">Контакты</h2>
              <p className="text-xs text-muted">Показываются покупателям</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label"><Mail size={12} className="mr-1 inline" /> Email</label>
              <input type="email" className="input" value={draft.contactEmail} onChange={(event) => update('contactEmail', event.target.value)} />
            </div>
            <div>
              <label className="field-label"><Phone size={12} className="mr-1 inline" /> Телефон</label>
              <input className="input" value={draft.contactPhone} onChange={(event) => update('contactPhone', event.target.value)} />
            </div>
            <div>
              <label className="field-label"><Send size={12} className="mr-1 inline" /> Telegram</label>
              <input className="input" value={draft.telegram} onChange={(event) => update('telegram', event.target.value)} />
            </div>
            <div>
              <label className="field-label"><MapPin size={12} className="mr-1 inline" /> Адрес / самовывоз</label>
              <input className="input" value={draft.address} onChange={(event) => update('address', event.target.value)} />
            </div>
          </div>
        </section>

        <section className="surface-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Check size={18} /></span>
            <div>
              <h2 className="display-title text-xl">Доставка и оплата</h2>
              <p className="text-xs text-muted">По одному способу на строку</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Способы доставки</label>
              <textarea className="textarea font-mono text-xs" value={delivery} onChange={(event) => setDelivery(event.target.value)} />
            </div>
            <div>
              <label className="field-label">Способы оплаты</label>
              <textarea className="textarea font-mono text-xs" value={payment} onChange={(event) => setPayment(event.target.value)} />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary px-5 py-3 text-xs"><Check size={15} /> Сохранить настройки</button>
        </div>
      </form>
    </div>
  );
}
