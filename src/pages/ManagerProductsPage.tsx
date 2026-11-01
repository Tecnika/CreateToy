import { ProductManager } from '../components/admin/ProductManager';
import { ManagerNav } from '../components/manager/ManagerNav';
import { PageHero } from '../components/ui/PageHero';
import { useAuth } from '../state/AuthContext';

export function ManagerProductsPage() {
  const { user } = useAuth();

  return (
    <>
      <PageHero
        eyebrow="Кабинет менеджера"
        title="Товары"
        accent="каталога"
        description="Создавайте новые карточки и обновляйте цены, описания, параметры и праздники. Удаление товаров остаётся у администратора."
        aside={
          <div className="rounded-3xl border border-line bg-surface-2/60 p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Вы вошли как</p>
            <p className="mt-1 font-display text-lg font-semibold">{user?.displayName}</p>
            <p className="text-xs text-muted">Менеджер · каталог товаров</p>
          </div>
        }
      />

      <ManagerNav />

      <section className="container-page mt-6">
        <ProductManager showHeader={false} />
      </section>
    </>
  );
}
