import { ArrowRight, Check, Clock3, Package, Palette, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { services } from '../core/container';
import { Money } from '../core/domain/Money';
import { useTheme } from '../state/ThemeContext';
import { ProductCard } from '../components/product/ProductCard';
import { SouvenirArt } from '../components/product/SouvenirArt';
import { SectionHeading } from '../components/ui/SectionHeading';
import { LinkButton } from '../components/ui/Button';

const steps = [
  {
    icon: Palette,
    title: 'Выберите идею',
    text: 'Готовый сувенир из каталога или шаблон, который можно собрать под свой повод.',
  },
  {
    icon: Sparkles,
    title: 'Настройте детали',
    text: 'Цвет, размер, надпись и упаковка. Цена пересчитывается сразу, без сюрпризов.',
  },
  {
    icon: Package,
    title: 'Напечатаем и отправим',
    text: 'Менеджер свяжется, подтвердит оплату и держит вас в курсе статуса заказа.',
  },
];

const guarantees = [
  { icon: ShieldCheck, title: 'Ручная проверка', text: 'Каждую деталь осматриваем перед отправкой.' },
  { icon: Truck, title: 'Доставка по России', text: 'СДЭК, Почта России или самовывоз.' },
  { icon: Clock3, title: 'Честные сроки', text: 'Печать занимает от 2 до 5 дней.' },
];

export function HomePage() {
  const { theme, themes } = useTheme();
  const featured = services.catalog.featured(theme);
  const heroProduct = featured[0] ?? services.catalog.list()[0];
  const themeHighlights = themes.filter((item) => item.id !== 'base').slice(0, 6);

  return (
    <>
      <section className="container-page pt-8 sm:pt-12">
        <div className="relative overflow-hidden rounded-5xl border border-line bg-surface/80 px-6 py-10 shadow-soft backdrop-blur sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div
            className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full opacity-70 blur-3xl"
            style={{ background: 'radial-gradient(circle, var(--hero-glow) 0%, transparent 70%)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, var(--accent-2) 0%, transparent 70%)' }}
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <span className="eyebrow mb-5">
                <Sparkles size={13} className="text-accent" />
                {theme.data.tagline} · {theme.data.dateLabel}
              </span>
              <h1 className="display-title max-w-2xl text-4xl leading-[1.02] sm:text-6xl lg:text-[4.6rem]">
                {theme.data.heroTitle} <span className="text-accent">{theme.data.heroAccent}</span>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-muted sm:text-base">{theme.data.heroNote}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                <LinkButton to="/catalog">
                  Смотреть сувениры
                  <ArrowRight size={17} />
                </LinkButton>
                <LinkButton to="/product/custom-figure" variant="secondary">
                  Собрать свой подарок
                </LinkButton>
              </div>

              <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                {[
                  { value: '2–5', label: 'дней на печать' },
                  { value: '11+', label: 'праздничных тем' },
                  { value: '100%', label: 'ручная работа' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-line bg-surface/70 px-3 py-3 text-center">
                    <p className="font-display text-lg font-semibold text-ink">{stat.value}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase leading-4 tracking-[0.08em] text-muted">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {heroProduct && (
              <div className="relative mx-auto w-full max-w-md">
                <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-accent/20 via-transparent to-accent-2/20 blur-2xl" />
                <div className="relative overflow-hidden rounded-[2.25rem] border border-line bg-surface shadow-lift">
                  <div
                    className="relative"
                    style={{
                      background: `linear-gradient(145deg, ${heroProduct.art.colors[1]} 0%, ${heroProduct.art.colors[0]} 100%)`,
                    }}
                  >
                    <SouvenirArt art={heroProduct.art} label={heroProduct.title} className="aspect-[1.05]" />
                    <span className="absolute left-5 top-5 rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink backdrop-blur">
                      {theme.data.shortName}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="display-title text-2xl">{heroProduct.title}</h2>
                        <p className="mt-1 text-sm text-muted">{heroProduct.subtitle}</p>
                      </div>
                      <p className="font-display text-xl font-semibold">{Money.from(heroProduct.price).format()}</p>
                    </div>
                    <Link
                      to={`/product/${heroProduct.slug}`}
                      className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-surface-2/60 px-4 py-3 text-sm font-bold transition hover:border-accent/50"
                    >
                      Настроить и заказать
                      <ArrowRight size={17} className="text-accent" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-page mt-6">
        <div className="flex flex-wrap items-center gap-2.5 rounded-3xl border border-line bg-surface/55 px-4 py-3">
          <span className="mr-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Праздники:</span>
          {themeHighlights.map((item) => (
            <Link
              key={item.id}
              to={`/catalog?holiday=${item.id}`}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-bold text-muted transition hover:border-accent/50 hover:text-ink"
            >
              {item.data.shortName}
            </Link>
          ))}
          <Link to="/holidays" className="ml-auto text-xs font-bold text-accent hover:underline">
            Все темы →
          </Link>
        </div>
      </section>

      <section className="container-page mt-16 sm:mt-20">
        <SectionHeading
          eyebrow={`Подборка · ${theme.data.name}`}
          title="Сувениры, которые хочется оставить себе"
          description="Готовые подарки к празднику. Любую модель можно изменить по цвету, размеру и надписи."
          action={
            <LinkButton to="/catalog" variant="secondary">
              Весь каталог
              <ArrowRight size={16} />
            </LinkButton>
          }
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="container-page mt-16 sm:mt-20">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-card overflow-hidden p-6 sm:p-8">
            <span className="eyebrow mb-4">Как это работает</span>
            <h2 className="display-title max-w-lg text-3xl leading-tight sm:text-4xl">
              От идеи до подарка — <span className="text-accent">три шага</span>
            </h2>
            <div className="mt-7 space-y-5">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                    <step.icon size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold">
                      <span className="mr-1.5 text-accent">0{index + 1}</span>
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <LinkButton to="/how-it-works" variant="secondary" className="mt-7">
              Подробнее о заказе
              <ArrowRight size={16} />
            </LinkButton>
          </div>

          <div
            className="relative overflow-hidden rounded-4xl border border-line p-6 text-white shadow-soft sm:p-8"
            style={{ background: 'linear-gradient(140deg, var(--accent-2) 0%, color-mix(in srgb, var(--accent-2) 72%, black) 100%)' }}
          >
            <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                <Sparkles size={12} />
                Конструктор
              </span>
              <h2 className="display-title mt-5 text-3xl leading-tight sm:text-4xl">
                Не нашли готовое? <br />
                Соберём с нуля
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
                Выберите шаблон, задайте цвет и надпись. Мы проверим макет и напечатаем именно ваш подарок.
              </p>
              <div className="mt-7 space-y-2.5">
                {['Имя, дата или короткая фраза', 'Выбор цвета и размера', 'Подарочная упаковка'].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm font-semibold text-white/90">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                      <Check size={12} />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
              <LinkButton to="/product/custom-figure" variant="secondary" className="mt-7 border-white/20 bg-white text-[color:var(--accent-2)] hover:bg-white/90">
                Открыть конструктор
                <ArrowRight size={16} />
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-16 sm:mt-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {guarantees.map((item) => (
            <div key={item.title} className="surface-card flex items-start gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-accent">
                <item.icon size={20} />
              </span>
              <div>
                <p className="text-sm font-extrabold">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page mt-16 sm:mt-20">
        <div className="relative overflow-hidden rounded-5xl border border-line bg-surface/75 p-8 shadow-soft sm:p-12">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-accent-soft blur-2xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="eyebrow mb-4">Праздник уже близко?</span>
              <h2 className="display-title max-w-2xl text-3xl leading-tight sm:text-4xl">
                Соберём подарок под вашу дату — <span className="text-accent">без шаблонных кружек</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                Расскажите, кому и к какому событию нужен сувенир. Менеджер предложит идею и подтвердит сроки.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LinkButton to="/product/custom-figure">
                Собрать подарок
                <ArrowRight size={16} />
              </LinkButton>
              <LinkButton to="/contacts" variant="secondary">
                Написать нам
              </LinkButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
