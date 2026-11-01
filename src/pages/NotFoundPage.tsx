import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { LinkButton } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <section className="container-page flex min-h-[60vh] items-center py-16">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Compass size={28} />
        </span>
        <p className="mt-6 font-display text-6xl font-semibold text-accent">404</p>
        <h1 className="display-title mt-2 text-3xl">Страница потерялась</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Возможно, ссылка устарела или мы ещё не успели напечатать эту страницу. Вернитесь на главную или загляните в каталог.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <LinkButton to="/">
            <ArrowLeft size={16} /> На главную
          </LinkButton>
          <LinkButton to="/catalog" variant="secondary">В каталог</LinkButton>
        </div>
        <Link to="/contacts" className="mt-5 inline-block text-xs font-bold text-muted hover:text-accent">
          Сообщить о проблеме
        </Link>
      </div>
    </section>
  );
}
