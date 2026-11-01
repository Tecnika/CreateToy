import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Money } from '../../core/domain/Money';
import type { Product } from '../../core/domain/types';
import { SouvenirArt } from './SouvenirArt';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group surface-card surface-card-hover flex flex-col overflow-hidden"
    >
      <div
        className="relative aspect-[1.08] overflow-hidden"
        style={{
          background: `radial-gradient(circle at 75% 18%, ${product.art.colors[2]} 0, transparent 42%), linear-gradient(145deg, ${product.art.colors[1]} 0%, ${product.art.colors[0]} 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_35%)]" />
        <SouvenirArt
          art={product.art}
          label={product.title}
          className="absolute inset-0 transition duration-500 group-hover:scale-[1.04] group-hover:-rotate-1"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.badge && <span className="badge bg-white/80 text-ink backdrop-blur">{product.badge}</span>}
        </div>
        <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur">
          <Clock3 size={12} />
          {product.productionDays}–{product.productionDays + 2} дня
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="display-title text-xl leading-tight">{product.title}</h3>
            <p className="mt-1.5 text-sm leading-5 text-muted">{product.subtitle}</p>
          </div>
          <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-ink transition group-hover:border-accent group-hover:bg-accent group-hover:text-white">
            <ArrowUpRight size={16} />
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="font-display text-lg font-semibold">{Money.from(product.price).format()}</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">{product.materials}</span>
        </div>
      </div>
    </Link>
  );
}
