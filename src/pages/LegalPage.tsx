import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useSettings } from '../state/SettingsContext';
import { PageHero } from '../components/ui/PageHero';
import { EmptyState } from '../components/ui/EmptyState';
import { LinkButton } from '../components/ui/Button';

interface LegalDocument {
  title: string;
  accent: string;
  description: string;
  sections: { title: string; text: string }[];
}

function documents(contactEmail: string): Record<string, LegalDocument> {
  return {
    privacy: {
      title: 'Политика',
      accent: 'конфиденциальности',
      description: 'Как мы обращаемся с данными, которые вы оставляете на сайте.',
      sections: [
        {
          title: 'Какие данные мы собираем',
          text: 'Имя, email, телефон, адрес доставки и комментарии к заказу. Эти данные нужны, чтобы связаться с вами, изготовить и доставить сувенир.',
        },
        {
          title: 'Где хранятся данные',
          text: 'В демо-режиме данные сохраняются только в вашем браузере. После подключения Firebase они будут храниться в защищённом проекте Firebase и использоваться только для работы магазина.',
        },
        {
          title: 'Передача третьим лицам',
          text: 'Мы не продаём данные. Контакты и адрес могут передаваться службе доставки только для выполнения заказа.',
        },
        {
          title: 'Ваши права',
          text: `Вы можете запросить исправление или удаление данных, написав на ${contactEmail}.`,
        },
      ],
    },
    offer: {
      title: 'Публичная',
      accent: 'оферта',
      description: 'Условия оформления и исполнения заказов на сувениры CreateToy.',
      sections: [
        {
          title: 'Оформление заказа',
          text: 'Заказ считается принятым после подтверждения менеджером состава, сроков, доставки и оплаты. До подтверждения заказ находится в статусе «Новый».',
        },
        {
          title: 'Цена и оплата',
          text: 'Цены указаны в рублях. Стоимость доставки рассчитывается отдельно. Оплата производится по реквизитам, которые менеджер присылает после согласования.',
        },
        {
          title: 'Сроки',
          text: 'Срок печати зависит от модели и указан в карточке товара. К сроку добавляется время на согласование и доставку. Точная дата подтверждается менеджером.',
        },
        {
          title: 'Отмена',
          text: 'Покупатель может отменить заказ до передачи в производство. После начала печати отмена возможна только по согласованию с менеджером.',
        },
      ],
    },
    returns: {
      title: 'Возврат',
      accent: 'и обмен',
      description: 'Что делать, если с заказом что-то пошло не так.',
      sections: [
        {
          title: 'Товар с дефектом',
          text: `Свяжитесь с нами по email ${contactEmail} и приложите фотографии. Мы заменим изделие или вернём деньги.`,
        },
        {
          title: 'Индивидуальный заказ',
          text: 'Изделия с именной надписью или нестандартными параметрами относятся к индивидуальным заказам. Возврат возможен при производственном дефекте.',
        },
        {
          title: 'Сроки обращения',
          text: 'Сообщите о проблеме в течение 7 дней после получения. Мы постараемся решить вопрос без лишней бюрократии.',
        },
        {
          title: 'Как вернуть',
          text: 'Менеджер согласует способ возврата и компенсации. Реквизиты для возврата денег запрашиваются только после подтверждения проблемы.',
        },
      ],
    },
  };
}

export function LegalPage() {
  const { doc } = useParams();
  const { settings } = useSettings();
  const all = documents(settings.contactEmail);
  const document = doc ? all[doc] : undefined;

  if (!document) {
    return (
      <section className="container-page pt-12">
        <EmptyState
          title="Документ не найден"
          description="Возможно, ссылка устарела. Вернитесь на главную или откройте нужный раздел из подвала сайта."
          action={<LinkButton to="/">На главную</LinkButton>}
        />
      </section>
    );
  }

  return (
    <>
      <PageHero eyebrow="Документы" title={document.title} accent={document.accent} description={document.description} />
      <section className="container-page mt-8">
        <div className="grid gap-6 lg:grid-cols-[0.3fr_0.7fr] lg:items-start">
          <aside className="surface-card sticky top-28 p-4">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
              <FileText size={15} className="text-accent" /> Разделы
            </p>
            <div className="mt-3 flex flex-col gap-1">
              {Object.entries(all).map(([slug, item]) => (
                <Link
                  key={slug}
                  to={`/legal/${slug}`}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                    slug === doc ? 'bg-accent text-white' : 'text-muted hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  {item.title} {item.accent}
                </Link>
              ))}
            </div>
          </aside>

          <article className="surface-card p-6 sm:p-8">
            <div className="space-y-6">
              {document.sections.map((section, index) => (
                <section key={section.title}>
                  <h2 className="display-title text-xl">
                    <span className="mr-2 text-accent">{String(index + 1).padStart(2, '0')}</span>
                    {section.title}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-muted">{section.text}</p>
                </section>
              ))}
            </div>
            <div className="mt-8 border-t border-line pt-5">
              <Link to="/contacts" className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline">
                <ArrowLeft size={14} /> Остались вопросы? Напишите нам
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
