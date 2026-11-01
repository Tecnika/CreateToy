export class Money {
  private constructor(public readonly amount: number) {}

  static from(amount: number): Money {
    if (!Number.isFinite(amount)) {
      throw new Error('Money amount must be finite');
    }
    return new Money(Math.max(0, Math.round(amount)));
  }

  static zero(): Money {
    return new Money(0);
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  multiply(quantity: number): Money {
    return new Money(this.amount * Math.max(0, Math.round(quantity)));
  }

  format(): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(this.amount);
  }

  toJSON(): number {
    return this.amount;
  }
}
