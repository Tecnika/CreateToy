import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Info,
  LayoutTemplate,
  Lock,
  Mail,
  Package,
  Palette,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { ManagerNav } from '../components/manager/ManagerNav';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ORDER_STATUS_ORDER } from '../core/domain/OrderStatus';
import { ROLE_LABELS } from '../core/domain/Role';
import { TEMPLATES } from '../core/data/templates';
import { useAuth } from '../state/AuthContext';
import { useSettings } from '../state/SettingsContext';

type GuideScope = 'all' | 'admin';

const sectionLinks: { id: string; label: string; adminOnly?: boolean }[] = [
  { id: 'start', label: 'С чего начать' },
  { id: 'orders', label: 'Заказы' },
  { id: 'products', label: 'Товары' },
  { id: 'templates', label: 'Шаблоны', adminOnly: true },
  { id: 'themes', label: 'Праздники', adminOnly: true },
  { id: 'users', label: 'Пользователи', adminOnly: true },
  { id: 'settings', label: 'Настройки', adminOnly: true },
  { id: 'faq', label: 'Вопросы' },
];

function ScopeBadge({ scope }: { scope: GuideScope }) {
  if (scope === 'admin') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-accent-2">
        <Lock size={11} /> Только админ
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-emerald-700">
      <ShieldCheck size={11} /> Менеджер и админ
    </span>
  );
}

function GuideNav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      aria-label="Разделы инструкции"
    >
      {sectionLinks.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-[11px] font-bold text-muted transition hover:border-accent/50 hover:text-ink"
        >
          {item.adminOnly && !isAdmin && <Lock size={11} />}
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function GuideSection({
  id,
  icon: Icon,
  title,
  description,
  scope = 'all',
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  scope?: GuideScope;
  children: ReactNode;
}) {
  return (
    <section id={id} className="surface-card scroll-mt-28 overflow-hidden">
      <div className="border-b border-line bg-surface-2/40 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Icon size={20} />
            </span>
            <div>
              <h2 className="display-title text-2xl">{title}</h2>
              {description && <p className="mt-1 max-w-2xl text-xs leading-6 text-muted">{description}</p>}
            </div>
          </div>
          <ScopeBadge scope={scope} />
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-extrabold text-white">
        {number}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-extrabold">{title}</p>
        <div className="mt-1 text-xs leading-6 text-muted">{children}</div>
      </div>
    </li>
  );
}

function Callout({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warning' | 'success';
  title: string;
  children: ReactNode;
}) {
  const config = {
    info: {
      icon: Info,
      className: 'border-line bg-surface-2/60 text-muted',
      titleClass: 'text-ink',
    },
    warning: {
      icon: AlertTriangle,
      className: 'border-amber-200 bg-amber-50 text-amber-900',
      titleClass: 'text-amber-950',
    },
    success: {
      icon: CheckCircle2,
      className: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      titleClass: 'text-emerald-950',
    },
  }[tone];
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border p-4 ${config.className}`}>
      <div className="flex gap-2.5">
        <Icon size={16} className="mt-0.5 shrink-0" />
        <div>
          <p className={`text-xs font-extrabold ${config.titleClass}`}>{title}</p>
          <div className="mt-1 text-xs leading-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Definition({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2/30 p-3">
      <dt className="text-xs font-extrabold">{term}</dt>
      <dd className="mt-1 text-[11px] leading-5 text-muted">{children}</dd>
    </div>
  );
}

function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl border border-line bg-surface p-4 open:bg-surface-2/30">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDown size={16} className="shrink-0 text-muted transition group-open:rotate-180" />
      </summary>
      <div className="mt-2 text-xs leading-6 text-muted">{children}</div>
    </details>
  );
}

function AdminOnly({ note, children }: { note: string; children: ReactNode }) {
  const { isAdmin } = useAuth();
  if (isAdmin) return <>{children}</>;

  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface-2/40 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-surface text-muted">
          <Lock size={16} />
        </span>
        <div>
          <p className="text-sm font-extrabold">Раздел доступен администратору</p>
          <p className="mt-1 text-xs leading-6 text-muted">{note}</p>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ isAdmin }: { isAdmin: boolean }) {
  const { user } = useAuth();

  return (
    <div className="rounded-3xl border border-line bg-surface-2/60 p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white">
          {isAdmin ? <ShieldCheck size={20} /> : <UserRound size={20} />}
        </span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Вы вошли как</p>
          <p className="font-display text-lg font-semibold">{user?.displayName}</p>
          <p className="text-xs text-muted">{user ? ROLE_LABELS[user.role] : ''}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        <Link
          to={isAdmin ? '/admin/orders' : '/manager'}
          className="flex items-center justify-between rounded-2xl border border-line bg-surface px-3 py-2.5 text-xs font-bold transition hover:border-accent/50 hover:bg-surface-2"
        >
          Заказы <ArrowRight size={14} className="text-accent" />
        </Link>
        <Link
          to={isAdmin ? '/admin/products' : '/manager/products'}
          className="flex items-center justify-between rounded-2xl border border-line bg-surface px-3 py-2.5 text-xs font-bold transition hover:border-accent/50 hover:bg-surface-2"
        >
          Товары <ArrowRight size={14} className="text-accent" />
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center justify-between rounded-2xl border border-line bg-surface px-3 py-2.5 text-xs font-bold transition hover:border-accent/50 hover:bg-surface-2"
          >
            Админ-панель <ArrowRight size={14} className="text-accent" />
          </Link>
        )}
      </div>
    </div>
  );
}

function RoleComparison() {
  const managerCan = [
    'Все заказы, статусы и история',
    'Оплата, доставка и трек-номер',
    'Письма покупателям',
    'Создание и редактирование товаров',
    'Скрытие товаров из каталога',
  ];
  const managerCannot = [
    'Восстановление скрытых товаров',
    'Удаление товаров навсегда',
    'Шаблоны конструктора',
    'Праздничные темы',
    'Пользователи и роли',
    'Настройки магазина',
  ];
  const adminCan = [
    'Всё, что доступно менеджеру',
    'Восстановление скрытых товаров',
    'Удаление товаров навсегда',
    'Шаблоны конструктора',
    'Праздничные темы',
    'Роли пользователей',
    'Настройки магазина',
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-line bg-surface p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <UserRound size={18} />
          </span>
          <div>
            <h3 className="text-sm font-extrabold">Менеджер</h3>
            <p className="text-[11px] text-muted">Заказы и каталог</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2">
          {managerCan.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs leading-5 text-muted">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted">Недоступно</p>
        <ul className="mt-2 space-y-2">
          {managerCannot.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs leading-5 text-muted">
              <Lock size={13} className="mt-0.5 shrink-0 text-muted" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-accent/30 bg-accent-soft/25 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white">
            <ShieldCheck size={18} />
          </span>
          <div>
            <h3 className="text-sm font-extrabold">Администратор</h3>
            <p className="text-[11px] text-muted">Всё управление сайтом</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2">
          {adminCan.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs leading-5 text-muted">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StaffGuideContent() {
  const { isAdmin, isDemo } = useAuth();
  const { settings } = useSettings();

  return (
    <div className="space-y-5">
      <GuideNav isAdmin={isAdmin} />

      <section id="start" className="scroll-mt-28 space-y-4">
        <div className="surface-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="eyebrow mb-3">Быстрый старт</span>
              <h2 className="display-title text-2xl sm:text-3xl">Кто что может</h2>
              <p className="mt-2 max-w-2xl text-xs leading-6 text-muted">
                Менеджер ведёт заказы и обновляет карточки товаров. Администратор дополнительно настраивает
                конструктор, праздничные темы, роли и контакты магазина.
              </p>
            </div>
            <ScopeBadge scope="all" />
          </div>
          <div className="mt-5">
            <RoleComparison />
          </div>
        </div>

        <div className="surface-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <BookOpen size={18} />
            </span>
            <div>
              <h2 className="display-title text-xl">Первые шаги</h2>
              <p className="mt-1 text-xs leading-6 text-muted">Если вы только получили доступ — начните отсюда.</p>
            </div>
          </div>
          <ol className="mt-4 space-y-4">
            <Step number={1} title="Откройте «Заказы»">
              Новые заказы видны сразу: смотрите фильтр «Новые» и счётчики сверху. Менеджеру доступен раздел
              «Заказы», администратору — «Заказы» в админ-панели.
            </Step>
            <Step number={2} title="Свяжитесь с покупателем">
              Откройте заказ, проверьте состав и контакты. Напишите письмо кнопкой «Написать покупателю» или
              позвоните, затем переведите заказ в статус «Связались».
            </Step>
            <Step number={3} title="Подтвердите оплату и ведите заказ">
              После фактического поступления денег нажмите «Подтвердить оплату». Дальше — «В производстве»,
              «Готов», «Отправлен» и «Завершён».
            </Step>
            <Step number={4} title="Обновляйте каталог">
              Менеджер создаёт и редактирует товары. Администратор дополнительно настраивает шаблоны, темы и
              доступы. Все изменения сразу видны на сайте.
            </Step>
          </ol>
          <div className="mt-5">
            <Callout tone="success" title="Покупатель видит изменения сразу">
              Статус, история заказа и трек-номер отображаются в личном кабинете покупателя. Комментарий к статусу
              тоже сохраняется в истории.
            </Callout>
          </div>
        </div>
      </section>

      <GuideSection
        id="orders"
        icon={ClipboardList}
        title="Заказы"
        description="Общий раздел для менеджера и администратора: связь с покупателем, оплата, производство и доставка."
        scope="all"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Найти и открыть</h3>
            <ul className="mt-3 space-y-2.5 text-xs leading-6 text-muted">
              <li className="flex gap-2">
                <Search size={14} className="mt-0.5 shrink-0 text-accent" />
                Фильтры «Все», «Новые», «В работе», «Завершённые», «Отменённые» помогают быстро найти нужные
                заказы.
              </li>
              <li className="flex gap-2">
                <Search size={14} className="mt-0.5 shrink-0 text-accent" />
                Поиск ищет по номеру заказа, имени или email покупателя.
              </li>
              <li className="flex gap-2">
                <Package size={14} className="mt-0.5 shrink-0 text-accent" />
                Нажмите на строку заказа — откроется карточка с составом, конфигурацией, адресом и комментарием.
              </li>
              <li className="flex gap-2">
                <CreditCard size={14} className="mt-0.5 shrink-0 text-accent" />
                Счётчики сверху показывают всего заказов, новые, в работе и подтверждённую выручку.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-surface-2/30 p-4">
            <p className="text-xs font-extrabold">В карточке заказа</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-muted">
              <li>• состав и количество, выбранная конфигурация;</li>
              <li>• способ доставки, адрес и комментарий покупателя;</li>
              <li>• контакты: имя, телефон, email;</li>
              <li>• кнопка «Написать покупателю» и ссылка на карточку заказа;</li>
              <li>• блоки «Статус», «Доставка» и «Контакты».</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Путь заказа</h3>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {ORDER_STATUS_ORDER.map((status, index) => (
              <Fragment key={status}>
                <StatusBadge status={status} />
                {index < ORDER_STATUS_ORDER.length - 1 && <ArrowRight size={12} className="text-muted" />}
              </Fragment>
            ))}
            <span className="px-1 text-[11px] text-muted">или</span>
            <StatusBadge status="cancelled" />
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Рекомендуемый порядок</h3>
            <ol className="mt-4 space-y-4">
              <Step number={1} title="Новый">
                Откройте заказ, проверьте состав, конфигурацию, адрес и комментарий. Если чего-то не хватает —
                свяжитесь с покупателем до оплаты.
              </Step>
              <Step number={2} title="Связались">
                Позвоните или напишите на email. Уточните детали, сроки и способ оплаты. Добавьте короткий
                комментарий к статусу — он сохранится в истории.
              </Step>
              <Step number={3} title="Ожидает оплаты">
                Отправьте покупателю реквизиты или ссылку на оплату. Не подтверждайте оплату до фактического
                поступления денег.
              </Step>
              <Step number={4} title="Оплачен">
                Когда оплата пришла, нажмите «Подтвердить оплату» в карточке заказа. Появится запись в истории,
                заказ можно переводить в производство.
              </Step>
              <Step number={5} title="В производстве">
                Ставьте этот статус, когда печать действительно началась. Если сроки сдвигаются — напишите
                покупателю.
              </Step>
              <Step number={6} title="Готов">
                Проверьте качество и комплектацию. Сообщите покупателю, что заказ готов к отправке или
                самовывозу.
              </Step>
              <Step number={7} title="Отправлен">
                Укажите стоимость доставки и трек-номер, затем смените статус. Покупатель увидит трек в своём
                кабинете.
              </Step>
              <Step number={8} title="Завершён">
                Финальный статус — после получения заказа или подтверждения покупателем. Дальше заказ считается
                закрытым.
              </Step>
            </ol>
          </div>

          <div className="space-y-3">
            <Callout tone="warning" title="Оплата подтверждается вручную">
              Кнопка «Подтвердить оплату» появляется, когда заказ в статусе «Ожидает оплаты». Сначала проверьте
              поступление денег, только потом подтверждайте.
            </Callout>
            <Callout tone="info" title="Доставка и трек-номер">
              Стоимость доставки пересчитывает итог заказа. Трек-номер сохраняется отдельно и сразу становится
              виден покупателю.
            </Callout>
            <Callout tone="info" title="Отмена заказа">
              Поставьте статус «Отменён» и укажите причину в комментарии. Покупатель может отменить заказ сам
              только до оплаты и запуска производства.
            </Callout>
            <Callout tone="info" title="Письмо покупателю">
              Кнопка «Написать покупателю» открывает почтовый клиент с темой «Заказ …». Текст письма можно
              дополнить вручную.
            </Callout>
          </div>
        </div>
      </GuideSection>

      <GuideSection
        id="products"
        icon={Boxes}
        title="Товары"
        description="Менеджер и администратор создают и редактируют карточки. Менеджер может скрыть товар из каталога, восстановить и удалить навсегда — только администратор."
        scope="all"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Создать товар</h3>
            <ol className="mt-4 space-y-4">
              <Step number={1} title="Откройте раздел «Товары»">
                Менеджер — в своём кабинете, администратор — в админ-панели. Нажмите «Добавить товар».
              </Step>
              <Step number={2} title="Заполните название, slug и цену">
                Slug — латиница без пробелов, например <span className="font-mono text-[11px]">snow-family</span>.
                Он должен быть уникальным; цена должна быть больше нуля.
              </Step>
              <Step number={3} title="Выберите категорию и шаблон">
                Категория влияет на фильтры каталога, шаблон — на поля конфигуратора на странице товара.
              </Step>
              <Step number={4} title="Добавьте описание и параметры">
                Подзаголовок, описание, срок печати, материал, размер и бейдж помогают покупателю выбрать сувенир.
              </Step>
              <Step number={5} title="Отметьте праздники и подборку">
                Праздники показывают товар в тематических подборках, галочка «Показывать в подборке» — на главной.
              </Step>
              <Step number={6} title="Настройте образ">
                Выберите графику и три цвета. Превью справа обновляется сразу — так проще проверить сочетание.
              </Step>
              <Step number={7} title="Сохраните">
                Нажмите «Сохранить товар». Карточка сразу появится в каталоге и будет доступна покупателям.
              </Step>
            </ol>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Редактировать</h3>
              <p className="mt-2 text-xs leading-6 text-muted">
                Нажмите карандаш в строке товара, измените нужные поля и сохраните. Старые заказы сохраняют
                прежние цены и состав — изменения касаются только новых покупок.
              </p>
            </div>
            <Callout tone="warning" title="Скрытие и удаление">
              Менеджер может скрыть товар — он исчезнет из каталога, главной и подборок. Восстановить скрытую
              карточку или удалить её навсегда может только администратор.
            </Callout>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Поля карточки</h3>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                <Definition term="Название">Как товар называется в каталоге и заказах.</Definition>
                <Definition term="Slug">Латиница для ссылки; должен быть уникальным.</Definition>
                <Definition term="Цена">Базовая цена без доплат конфигуратора.</Definition>
                <Definition term="Шаблон">Набор полей, которые видит покупатель.</Definition>
                <Definition term="Праздники">В каких тематических подборках показывать товар.</Definition>
                <Definition term="Образ и цвета">Графика карточки и превью товара.</Definition>
                <Definition term="Срок, материал, размер">Ожидания покупателя и параметры печати.</Definition>
                <Definition term="Бейдж и подборка">Метка «Хит» / «Новинка» и показ на главной.</Definition>
              </dl>
            </div>
          </div>
        </div>
      </GuideSection>

      <GuideSection
        id="templates"
        icon={LayoutTemplate}
        title="Шаблоны конструктора"
        description="Шаблон определяет, какие поля покупатель заполняет на странице товара: цвет, размер, надпись, упаковку и доплаты."
        scope="admin"
      >
        <AdminOnly note="Шаблоны настраивает администратор. Менеджер выбирает готовый шаблон в карточке товара; если нужного шаблона нет — попросите администратора создать его.">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Встроенные шаблоны</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {TEMPLATES.map((template) => (
                  <span key={template.id} className="rounded-full bg-surface-2 px-3 py-1.5 text-[11px] font-bold text-muted">
                    {template.data.name}
                  </span>
                ))}
              </div>

              <h3 className="mt-5 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Создать шаблон</h3>
              <ol className="mt-4 space-y-4">
                <Step number={1} title="Откройте «Шаблоны» → «Новый шаблон»">
                  Встроенный шаблон тоже можно отредактировать — сохранится своя версия.
                </Step>
                <Step number={2} title="Укажите название и описание">
                  Название видно в карточке товара при выборе шаблона.
                </Step>
                <Step number={3} title="Добавьте поля">
                  Нажмите «Добавить поле» и выберите тип. Заполните название, подсказку, плейсхолдер и доплату.
                </Step>
                <Step number={4} title="Настройте варианты">
                  Для «Выбора варианта» и «Выбора цвета» заполните варианты по одному на строку в формате{' '}
                  <span className="font-mono text-[11px]">value | Название | доплата | цвет</span>.
                </Step>
                <Step number={5} title="Проверьте порядок и сохраните">
                  Меняйте порядок стрелками, отмечайте обязательные поля и ограничивайте длину текста. Затем
                  нажмите «Сохранить шаблон».
                </Step>
              </ol>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Типы полей</h3>
                <dl className="mt-3 grid gap-2">
                  <Definition term="Строка">Короткий текст: имя, дата, надпись.</Definition>
                  <Definition term="Многострочный текст">Пожелания и комментарии покупателя.</Definition>
                  <Definition term="Выбор варианта">Список вариантов с доплатой за каждый.</Definition>
                  <Definition term="Выбор цвета">Палитра с образцами цветов.</Definition>
                  <Definition term="Число">Количество или размер в виде числового поля.</Definition>
                  <Definition term="Галочка">Дополнительная опция с фиксированной доплатой.</Definition>
                </dl>
              </div>
              <Callout tone="warning" title="Шаблон нельзя удалить, пока его использует товар">
                Сначала смените шаблон в карточках товаров, затем удаляйте. Удаление своей версии встроенного
                шаблона вернёт стандартную версию.
              </Callout>
              <Callout tone="info" title="Без загрузки файлов">
                Покупатель не загружает изображения: в шаблонах доступны только текст, выбор, цвет, число и
                галочка. Это осознанное ограничение текущей версии.
              </Callout>
            </div>
          </div>
        </AdminOnly>
      </GuideSection>

      <GuideSection
        id="themes"
        icon={Palette}
        title="Праздничные темы"
        description="Тема меняет палитру, эффект и тексты главной страницы. Готовые темы можно включать в один клик, свои — создавать с нуля."
        scope="admin"
      >
        <AdminOnly note="Темы сайта настраивает администратор. Менеджеру тема нужна только для проверки внешнего вида карточек и заказов.">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Включить готовую тему</h3>
              <ol className="mt-4 space-y-4">
                <Step number={1} title="Откройте «Праздники»">
                  В списке видно палитру, даты и эффект каждой темы. Активная тема отмечена зелёным бейджем.
                </Step>
                <Step number={2} title="Нажмите «Включить»">
                  Тема сразу применится ко всем страницам сайта: цвета, фон, кнопки и праздничный эффект.
                </Step>
              </ol>

              <h3 className="mt-5 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Создать свою</h3>
              <ol className="mt-4 space-y-4">
                <Step number={1} title="Нажмите «Своя тема»">
                  Заполните название, короткое название для шапки, слоган, даты и описание.
                </Step>
                <Step number={2} title="Настройте главную">
                  Укажите заголовок, акцентную часть, текст под заголовком и выберите эффект: искры, снег, тыквы,
                  сердца, звёзды и другие.
                </Step>
                <Step number={3} title="Соберите палитру">
                  Настройте 10 цветов: фон, карточки, текст, акценты, линии и свечение.
                </Step>
                <Step number={4} title="Выберите товары и сохраните">
                  Отметьте товары для главной, сохраните тему и нажмите «Включить» в её карточке.
                </Step>
              </ol>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-line bg-surface-2/30 p-4">
                <p className="text-xs font-extrabold">Что меняется вместе с темой</p>
                <ul className="mt-2 space-y-1.5 text-xs leading-5 text-muted">
                  <li>• палитра всех компонентов и фонов;</li>
                  <li>• заголовок и текст главной страницы;</li>
                  <li>• праздничный эффект на страницах;</li>
                  <li>• подборка товаров на главной.</li>
                </ul>
              </div>
              <Callout tone="warning" title="Проверьте контраст">
                После смены палитры пролистайте главную, каталог и карточку товара: текст и кнопки должны
                оставаться читаемыми.
              </Callout>
              <Callout tone="info" title={isDemo ? 'Демо-режим' : 'Общая тема'}>
                {isDemo
                  ? 'Сейчас тема сохраняется в браузере. В облачном режиме она станет общей для всех посетителей.'
                  : 'Тема сохраняется в настройках сайта и сразу применяется для всех посетителей.'}
              </Callout>
            </div>
          </div>
        </AdminOnly>
      </GuideSection>

      <GuideSection
        id="users"
        icon={Users}
        title="Пользователи и роли"
        description="Администратор выдаёт доступы и может повысить покупателя до менеджера или администратора."
        scope="admin"
      >
        <AdminOnly note="Роли меняет администратор. Менеджер не может повысить себе доступ или изменить чужую роль.">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Роли</h3>
              <div className="mt-3 space-y-2">
                <div className="rounded-2xl border border-line p-3.5">
                  <div className="flex items-center gap-2">
                    <UserRound size={15} className="text-accent" />
                    <p className="text-sm font-extrabold">Покупатель</p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted">Свои заказы, адреса и отмена до оплаты.</p>
                </div>
                <div className="rounded-2xl border border-line p-3.5">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={15} className="text-accent" />
                    <p className="text-sm font-extrabold">Менеджер</p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted">Заказы и создание/редактирование товаров.</p>
                </div>
                <div className="rounded-2xl border border-accent/30 bg-accent-soft/30 p-3.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-accent" />
                    <p className="text-sm font-extrabold">Администратор</p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted">Всё управление сайтом и доступами.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Изменить роль</h3>
              <ol className="mt-4 space-y-4">
                <Step number={1} title="Откройте «Пользователи»">
                  Найдите человека по имени или email через поиск.
                </Step>
                <Step number={2} title="Выберите роль в строке">
                  Изменение сохраняется сразу. Проверьте, что новый менеджер видит разделы «Заказы» и «Товары».
                </Step>
              </ol>
              <div className="mt-4">
                <Callout tone="warning" title="Защита от потери доступа">
                  Нельзя изменить собственную роль и убрать последнего администратора. Это сделано специально,
                  чтобы сайт не остался без управления.
                </Callout>
              </div>
            </div>
          </div>
        </AdminOnly>
      </GuideSection>

      <GuideSection
        id="settings"
        icon={Settings}
        title="Настройки магазина"
        description="Контакты, способы доставки и оплаты. Эти данные используются в шапке, подвале, оформлении заказа и письмах."
        scope="admin"
      >
        <AdminOnly note="Настройки меняет администратор. Они влияют на шапку, подвал, оформление заказа и письма покупателям.">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Что заполнить</h3>
              <dl className="mt-3 grid gap-2">
                <Definition term="Название и слоган">Бренд магазина в шапке и подвале.</Definition>
                <Definition term="Email и телефон">Контакты для покупателей и писем.</Definition>
                <Definition term="Telegram и адрес">Связь и самовывоз.</Definition>
                <Definition term="Способы доставки">По одному способу на строку.</Definition>
                <Definition term="Способы оплаты">По одному способу на строку.</Definition>
              </dl>
            </div>

            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Как сохранить</h3>
              <ol className="mt-4 space-y-4">
                <Step number={1} title="Откройте «Настройки»">
                  Измените контакты, название или списки доставки и оплаты.
                </Step>
                <Step number={2} title="Проверьте списки">
                  Каждый способ — с новой строки. Пустые строки не сохраняются.
                </Step>
                <Step number={3} title="Нажмите «Сохранить настройки»">
                  После сохранения проверьте страницу «Контакты» и оформление заказа.
                </Step>
              </ol>
              <div className="mt-4">
                <Callout tone="warning" title="Проверьте после изменения">
                  Контакты и способы доставки сразу попадают в интерфейс. Убедитесь, что email и телефон указаны
                  верно, иначе покупатель не сможет связаться с магазином.
                </Callout>
              </div>
            </div>
          </div>
        </AdminOnly>
      </GuideSection>

      <GuideSection
        id="faq"
        icon={Sparkles}
        title="Частые вопросы"
        description="Короткие ответы на ситуации, которые возникают в работе."
        scope="all"
      >
        <div className="space-y-2.5">
          <FaqItem question="Как менеджеру снять товар с продажи?">
            Нажмите кнопку архива в строке товара. Карточка скроется из каталога и подборок. Восстановить её
            сможет только администратор в разделе «Товары» через переключатель скрытых карточек.
          </FaqItem>
          <FaqItem question="Почему шаблон не удаляется?">
            Его использует хотя бы один товар. Сначала смените шаблон в карточках этих товаров, затем удаляйте
            шаблон.
          </FaqItem>
          <FaqItem question="Как вернуть встроенный шаблон?">
            Удалите свою версию шаблона — вернётся стандартная версия. Встроенные шаблоны нельзя удалить
            насовсем.
          </FaqItem>
          <FaqItem question="Что видит покупатель после смены статуса?">
            Новый статус и запись в истории заказа. Комментарий к статусу тоже виден. Трек-номер появляется
            после сохранения в блоке «Доставка».
          </FaqItem>
          <FaqItem question="Можно ли отменить заказ за покупателя?">
            Да, поставьте статус «Отменён» и укажите причину в комментарии. Покупатель может отменить заказ сам
            только до оплаты и запуска производства.
          </FaqItem>
          <FaqItem question="Где изменить стоимость доставки?">
            В карточке заказа, блок «Доставка». После сохранения итог заказа пересчитается, а покупатель увидит
            новую сумму.
          </FaqItem>
          <FaqItem question="Почему тема не изменилась у других посетителей?">
            {isDemo
              ? 'В демо-режиме тема хранится в браузере. В облачном режиме она сохраняется в настройках и общая для всех.'
              : 'Тема сохраняется в настройках сайта. Если изменения не видны, обновите страницу — настройки загружаются при старте.'}
          </FaqItem>
          <FaqItem question="Что делать, если нужного шаблона нет?">
            Менеджер выбирает только готовые шаблоны. Попросите администратора создать новый шаблон с нужными
            полями.
          </FaqItem>
        </div>
      </GuideSection>

      <div className="rounded-3xl border border-line bg-surface-2/60 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-white">
              <Mail size={19} />
            </span>
            <div>
              <p className="text-sm font-extrabold">Остались вопросы?</p>
              <p className="mt-1 text-xs leading-6 text-muted">
                Напишите администратору магазина — контакты указаны в настройках.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${settings.contactEmail}`} className="btn-secondary px-4 py-2.5 text-xs">
              <Mail size={14} /> Написать
            </a>
            <Link
              to={isAdmin ? '/admin/orders' : '/manager'}
              className="btn-primary px-4 py-2.5 text-xs"
            >
              <ClipboardList size={14} /> К заказам
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StaffGuidePage({ embedded = false }: { embedded?: boolean }) {
  const { isAdmin, isDemo } = useAuth();

  if (embedded) {
    return (
      <div className="space-y-6">
        <div>
          <span className="eyebrow mb-3">Документация</span>
          <h1 className="display-title text-3xl sm:text-4xl">Инструкция для команды</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Как обрабатывать заказы, обновлять товары и что настраивает администратор. Разделы с замком доступны
            только администратору.
          </p>
        </div>
        <StaffGuideContent />
      </div>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Документация"
        title="Инструкция для"
        accent="команды"
        description="Что умеет менеджер, что дополнительно настраивает администратор и как пройти путь заказа без ошибок. Разделы с замком доступны только администратору."
        aside={<RoleCard isAdmin={isAdmin} />}
      />
      <ManagerNav />
      <section className="container-page mt-6">
        <StaffGuideContent />
      </section>
    </>
  );
}
