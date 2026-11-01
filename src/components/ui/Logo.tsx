import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useSettings } from '../../state/SettingsContext';

export function Logo() {
  const { settings } = useSettings();
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label={`${settings.siteName} — на главную`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white shadow-[0_10px_24px_-12px_var(--accent)] transition group-hover:-rotate-6">
        <Package size={20} strokeWidth={2.2} />
      </span>
      <span className="font-display text-lg font-semibold tracking-[-0.04em] text-ink sm:text-xl">
        {settings.siteName}
      </span>
    </Link>
  );
}
