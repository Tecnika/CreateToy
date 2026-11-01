import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
}: SectionHeadingProps) {
  return (
    <div
      className={
        align === 'center'
          ? 'mx-auto flex max-w-3xl flex-col items-center text-center'
          : 'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'
      }
    >
      <div className={align === 'center' ? 'flex flex-col items-center' : 'max-w-2xl'}>
        {eyebrow && <span className="eyebrow mb-4">{eyebrow}</span>}
        <h2 className="display-title text-3xl leading-[1.05] sm:text-4xl lg:text-5xl">{title}</h2>
        {description && <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}
