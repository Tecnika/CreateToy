import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { services } from '../core/container';
import type { CartLineData } from '../core/domain/types';
import type { Money } from '../core/domain/Money';

interface CartSnapshot {
  lines: CartLineData[];
  count: number;
  subtotal: Money;
}

interface CartContextValue extends CartSnapshot {
  addLine: (line: CartLineData) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<CartSnapshot>(() => ({
    lines: services.cart.lines,
    count: services.cart.count,
    subtotal: services.cart.subtotal,
  }));

  useEffect(
    () =>
      services.cart.subscribe((cart) => {
        setSnapshot({
          lines: cart.lines,
          count: cart.count,
          subtotal: cart.subtotal,
        });
      }),
    [],
  );

  const value: CartContextValue = {
    ...snapshot,
    addLine: (line) => services.cart.addLine(line),
    updateQuantity: (lineId, quantity) => services.cart.updateQuantity(lineId, quantity),
    remove: (lineId) => services.cart.remove(lineId),
    clear: () => services.cart.clear(),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
