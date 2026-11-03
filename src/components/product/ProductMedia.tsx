import { useEffect, useState } from 'react';
import type { ProductArt } from '../../core/domain/types';
import { SouvenirArt } from './SouvenirArt';

interface ProductMediaProps {
  art: ProductArt;
  imageUrl?: string;
  label: string;
  className?: string;
}

export function ProductMedia({ art, imageUrl, label, className = '' }: ProductMediaProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  if (imageUrl && !failed) {
    return <img src={imageUrl} alt={label} decoding="async" className={className} onError={() => setFailed(true)} />;
  }

  return <SouvenirArt art={art} label={label} className={className} />;
}
