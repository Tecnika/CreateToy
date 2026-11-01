import { LoaderCircle } from 'lucide-react';

export function PageLoader({ label = 'Загружаем страницу…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6 py-20" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-center">
        <LoaderCircle size={30} className="animate-spin text-accent" aria-hidden="true" />
        <p className="text-sm font-semibold text-muted">{label}</p>
      </div>
    </div>
  );
}
