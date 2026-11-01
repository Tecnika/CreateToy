import { OrdersManager } from '../../components/admin/OrdersManager';

export function AdminOrdersPage() {
  return (
    <div className="space-y-5">
      <div>
        <span className="eyebrow mb-3">Заказы</span>
        <h1 className="display-title text-3xl sm:text-4xl">Обработка заказов</h1>
        <p className="mt-2 text-sm text-muted">
          Те же инструменты, что у менеджера: статусы, оплата, доставка и связь с покупателем.
        </p>
      </div>
      <OrdersManager />
    </div>
  );
}
