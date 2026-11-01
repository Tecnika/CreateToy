import { ClipboardList, Mail } from 'lucide-react';
import { OrdersManager } from '../components/admin/OrdersManager';
import { PageHero } from '../components/ui/PageHero';
import { useAuth } from '../state/AuthContext';
import { useSettings } from '../state/SettingsContext';

export function ManagerPage() {
  const { user } = useAuth();
  const { settings } = useSettings();

  return (
    <>
      <PageHero
        eyebrow="Кабинет менеджера"
        title="Заказы"
        accent="под контролем"
        description="Свяжитесь с покупателем, подтвердите оплату и переводите заказ по этапам. Все изменения сразу видны в личном кабинете клиента."
        aside={
          <div className="space-y-3">
            <div className="rounded-3xl border border-line bg-surface-2/60 p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Вы вошли как</p>
              <p className="mt-1 font-display text-lg font-semibold">{user?.displayName}</p>
              <p className="text-xs text-muted">Менеджер · обработка заказов</p>
            </div>
            <a href={`mailto:${settings.contactEmail}`} className="btn-secondary w-full text-xs">
              <Mail size={15} /> Почта магазина
            </a>
          </div>
        }
      />

      <section className="container-page mt-8">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold text-muted">
          <ClipboardList size={16} className="text-accent" />
          Выберите заказ в списке, чтобы изменить статус или добавить доставку
        </div>
        <OrdersManager />
      </section>
    </>
  );
}
