import type { ReactNode } from 'react';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: string;
  actions?: ReactNode;
  aside?: ReactNode;
}

export function PageHero({ eyebrow, title, accent, description, actions, aside }: PageHeroProps) {
  return (
    <section className="container-page pt-10 sm:pt-14">
      <div className="relative overflow-hidden rounded-5xl border border-line bg-surface/75 px-6 py-10 shadow-soft backdrop-blur sm:px-10 sm:py-14 lg:px-10 xl:px-14">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-60 blur-2xl"
          style={{ background: 'radial-gradient(circle, var(--hero-glow) 0%, transparent 68%)' }}
        />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10">
          <div>
            {eyebrow && <span className="eyebrow mb-5">{eyebrow}</span>}
            <h1 className="display-title max-w-3xl text-4xl leading-[1.02] sm:text-5xl xl:text-6xl">
              {title}
              {accent && (
                <>
                  {' '}
                  <span className="text-accent">{accent}</span>
                </>
              )}
            </h1>
            {description && <p className="mt-5 max-w-2xl text-sm leading-7 text-muted sm:text-base">{description}</p>}
            {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
          </div>
          {aside && <div className="relative">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
