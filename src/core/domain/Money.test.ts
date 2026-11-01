import { describe, expect, it } from 'vitest';
import { Money } from './Money';

describe('Money', () => {
  it('rounds amounts and never goes below zero', () => {
    expect(Money.from(10.4).amount).toBe(10);
    expect(Money.from(10.5).amount).toBe(11);
    expect(Money.from(-250).amount).toBe(0);
  });

  it('rejects non-finite amounts', () => {
    expect(() => Money.from(Number.NaN)).toThrow('Money amount must be finite');
    expect(() => Money.from(Number.POSITIVE_INFINITY)).toThrow('Money amount must be finite');
  });

  it('adds and multiplies without fractional rubles', () => {
    const total = Money.from(1990).add(Money.from(250)).multiply(3);
    expect(total.amount).toBe(6720);
    expect(Money.from(100).multiply(0).amount).toBe(0);
  });

  it('formats a ruble amount for the Russian locale', () => {
    const formatted = Money.from(1234).format();
    expect(formatted).toContain('₽');
    expect(formatted.replace(/\s/g, '')).toContain('1234');
  });
});
