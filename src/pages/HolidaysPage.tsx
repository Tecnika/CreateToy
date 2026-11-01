import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useTheme } from '../state/ThemeContext';
import { PageHero } from '../components/ui/PageHero';
import { LinkButton } from '../components/ui/Button';

export function HolidaysPage() {
  const { themes, theme, setActiveTheme } = useTheme();
  const { isAdmin } = useAuth();
  const holidays = themes.filter((item) => item.id !== 'base');

  return (
    <>
      <PageHero
        eyebrow="Праздничные темы"
        title="У каждого праздника —"
        accent="свой характер"
        description="Меняются цвета, эффекты и подборки. Внутри каждой темы — уникальный визуальный элемент: снег, сканирующая линия, лепестки или георгиевская лента."
        aside={
          <div className="rounded-3xl border border-line bg-surface-2/60 p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Сейчас на сайте</p>
            <p className="mt-1 font-display text-xl font-semibold">{theme.data.name}</p>
            <p className="mt-1 text-xs text-muted">{theme.data.tagline}</p>
            <div className="mt-3 flex gap-1.5">
              {[theme.data.palette.accent, theme.data.palette.accent2, theme.data.palette.heroGlow, theme.data.palette.surface2].map((color, index) => (
                <span key={`${color}-${index}`} className="h-6 flex-1 rounded-full border border-black/5" style={{ background: color }} />
              ))}
            </div>
          </div>
        }
      />

      <section className="container-page mt-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {holidays.map((item) => {
            const isActive = item.id === theme.id;
            return (
              <article key={item.id} className="surface-card overflow-hidden">
                <div
                  className="relative h-36 p-5"
                  style={{
                    background: `radial-gradient(circle at 82% 15%, ${item.data.palette.heroGlow} 0, transparent 48%), linear-gradient(135deg, ${item.data.palette.surface2}, ${item.data.palette.bg})`,
                  }}
                >
                  <span className="rounded-full bg-black/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white backdrop-blur">
                    {item.data.dateLabel}
                  </span>
                  <p className="absolute bottom-4 left-5 right-5 font-display text-xl font-semibold" style={{ color: item.data.palette.ink }}>
                    {item.data.heroTitle} <span style={{ color: item.data.palette.accent }}>{item.data.heroAccent}</span>
                  </p>
                  {isActive && (
                    <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-white">
                      <Check size={10} /> активна
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="display-title text-xl">{item.data.name}</h2>
                      <p className="mt-1 text-xs leading-5 text-muted">{item.data.tagline}</p>
                    </div>
                    {item.data.isCustom && <span className="badge">своя</span>}
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">{item.data.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={`/catalog?holiday=${item.id}`} className="btn-secondary px-3 py-2 text-xs">
                      Сувениры <ArrowRight size={13} />
                    </Link>
                    {isAdmin && !isActive && (
                      <button type="button" onClick={() => setActiveTheme(item.id)} className="btn-ghost px-3 py-2 text-xs">
                        Включить тему
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-4xl border border-line bg-surface/70 p-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="text-sm font-extrabold">Нужен свой праздник?</p>
              <p className="mt-1 max-w-xl text-xs leading-5 text-muted">
                Администратор может добавить тему с собственной палитрой, эффектом и текстами — она появится в этом списке.
              </p>
            </div>
          </div>
          {isAdmin ? (
            <LinkButton to="/admin/themes" className="shrink-0">Создать тему</LinkButton>
          ) : (
            <LinkButton to="/contacts" variant="secondary" className="shrink-0">Предложить идею</LinkButton>
          )}
        </div>
      </section>
    </>
  );
}
