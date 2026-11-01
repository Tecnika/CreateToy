import { Check, CreditCard, Mail, Package, Palette, Printer, Truck } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { LinkButton } from '../components/ui/Button';

const steps = [
  {
    icon: Palette,
    title: 'Выбираете и настраиваете',
    text: 'Готовый сувенир или шаблон в конструкторе. Цвет, размер, надпись и упаковка — цена пересчитывается сразу.',
  },
  {
    icon: Mail,
    title: 'Менеджер связывается',
    text: 'Проверяем макет, уточняем сроки и доставку. После согласования присылаем реквизиты для оплаты.',
  },
  {
    icon: CreditCard,
    title: 'Подтверждаем оплату',
    text: 'Оплата подтверждается вручную. В личном кабинете статус меняется на «Оплачен» — только после проверки.',
  },
  {
    icon: Printer,
    title: 'Печатаем и собираем',
    text: 'Печать небольшими партиями, ручная постобработка и проверка каждой детали перед упаковкой.',
  },
  {
    icon: Truck,
    title: 'Отправляем',
    text: 'Добавляем трек-номер, статус меняется на «Отправлен». Вы следите за заказом в личном кабинете.',
  },
];

const faq = [
  {
    question: 'Можно ли изменить готовый сувенир?',
    answer: 'Да. Цвет, размер, надпись и упаковка настраиваются в конструкторе на странице товара. Если нужна нестандартная идея — оставьте комментарий, менеджер обсудит детали.',
  },
  {
    question: 'Почему оплата подтверждается вручную?',
    answer: 'Мы сначала согласуем макет, сроки и стоимость доставки. Только после этого присылаем реквизиты. Так вы не платите за то, что ещё не подтверждено.',
  },
  {
    question: 'Сколько ждать заказ?',
    answer: 'Печать занимает от 2 до 5 дней в зависимости от модели. К этому добавляется время на согласование и доставку. Точный срок менеджер называет при подтверждении.',
  },
  {
    question: 'Можно забрать самому?',
    answer: 'Да, самовывоз по договорённости. Способ доставки выбирается при оформлении, а детали менеджер уточнит по email или телефону.',
  },
];

export function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="Как это работает"
        title="Прозрачно"
        accent="на каждом этапе"
        description="От выбора сувенира до трек-номера. Вы всегда видите, на каком этапе заказ, а оплата проходит только после согласования."
        actions={
          <>
            <LinkButton to="/catalog">Выбрать сувенир</LinkButton>
            <LinkButton to="/contacts" variant="secondary">Задать вопрос</LinkButton>
          </>
        }
      />

      <section className="container-page mt-8">
        <div className="grid gap-4 lg:grid-cols-5">
          {steps.map((step, index) => (
            <div key={step.title} className="surface-card relative p-5">
              <span className="absolute right-4 top-4 font-display text-3xl font-semibold text-line">0{index + 1}</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <step.icon size={20} />
              </span>
              <h2 className="mt-4 text-sm font-extrabold leading-5">{step.title}</h2>
              <p className="mt-2 text-xs leading-5 text-muted">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-card p-6 sm:p-8">
            <span className="eyebrow mb-4">Важно знать</span>
            <h2 className="display-title text-3xl">Что входит в заказ</h2>
            <div className="mt-5 space-y-3">
              {[
                'Проверка макета перед печатью',
                'Печать в выбранном цвете и размере',
                'Ручная обработка и осмотр деталей',
                'Упаковка, готовая к вручению',
                'Статусы заказа и история в личном кабинете',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Check size={12} />
                  </span>
                  <span className="text-muted">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-4xl border border-line bg-surface-2/60 p-6 sm:p-8">
            <Package size={24} className="text-accent" />
            <h2 className="display-title mt-4 text-2xl">Доставка</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Доступны СДЭК, Почта России, курьер по Москве и самовывоз. Стоимость зависит от габаритов и региона —
              менеджер называет её до оплаты.
            </p>
            <div className="mt-5 rounded-2xl bg-surface p-4 text-xs leading-5 text-muted">
              Трек-номер появится в карточке заказа после отправки. Его можно скопировать и использовать на сайте
              перевозчика.
            </div>
          </div>
        </div>

        <div className="mt-10">
          <span className="eyebrow mb-4">Вопросы</span>
          <h2 className="display-title text-3xl sm:text-4xl">Коротко о главном</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {faq.map((item) => (
              <details key={item.question} className="surface-card group p-5">
                <summary className="cursor-pointer list-none text-sm font-extrabold marker:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {item.question}
                    <span className="text-accent transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-xs leading-5 text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
