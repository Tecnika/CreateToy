import { DEMO_CREDENTIALS, DEMO_PASSWORD, DEMO_USERS } from '../data/demo';
import type { Role, UserProfile } from '../domain/types';
import type { UserRepository } from '../repositories/types';
import type { Storage } from '../storage/Storage';
import type { AuthAdapter, ProfilePatch, RegisterInput } from './AuthAdapter';

export class MockAuthAdapter implements AuthAdapter {
  private readonly currentKey = 'auth:current';
  private readonly passwordsKey = 'auth:passwords';
  private readonly listeners = new Set<(user: UserProfile | null) => void>();

  constructor(
    private readonly users: UserRepository,
    private readonly storage: Storage,
  ) {
    if (!this.storage.has(this.passwordsKey)) {
      const passwords = DEMO_CREDENTIALS.reduce<Record<string, string>>((result, item) => {
        result[item.email.toLowerCase()] = item.password;
        return result;
      }, {});
      this.storage.set(this.passwordsKey, passwords);
    }
  }

  getCurrentUser(): UserProfile | null {
    const current = this.storage.get<UserProfile | null>(this.currentKey, null);
    if (!current) return null;
    return this.users.getById(current.uid) ?? null;
  }

  async signIn(login: string, password: string): Promise<UserProfile> {
    const user = this.users.getByLogin(login);
    if (!user) {
      throw new Error('Пользователь не найден. Проверьте email или логин.');
    }
    const passwords = this.storage.get<Record<string, string>>(this.passwordsKey, {});
    if (passwords[user.email.toLowerCase()] !== password) {
      throw new Error('Неверный пароль.');
    }
    this.persist(user);
    return user;
  }

  async register(input: RegisterInput): Promise<UserProfile> {
    const email = input.email.trim().toLowerCase();
    if (this.users.getByEmail(email)) {
      throw new Error('Пользователь с таким email уже зарегистрирован.');
    }
    if (input.displayName.trim().length < 2) {
      throw new Error('Укажите имя.');
    }
    if (input.password.length < 6) {
      throw new Error('Пароль должен быть не короче 6 символов.');
    }

    const user: UserProfile = {
      uid: crypto.randomUUID(),
      email,
      displayName: input.displayName.trim(),
      role: 'buyer',
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    this.users.save(user);
    const passwords = this.storage.get<Record<string, string>>(this.passwordsKey, {});
    passwords[email] = input.password;
    this.storage.set(this.passwordsKey, passwords);
    this.persist(user);
    return user;
  }

  async signInDemo(role: Role): Promise<UserProfile> {
    const demo = DEMO_USERS.find((user) => user.role === role);
    if (!demo) throw new Error('Демо-пользователь не найден.');
    this.persist(demo);
    return demo;
  }

  async updateProfile(patch: ProfilePatch): Promise<UserProfile> {
    const current = this.getCurrentUser();
    if (!current) throw new Error('Сначала войдите в аккаунт.');
    const updated: UserProfile = { ...current, ...patch };
    this.users.save(updated);
    this.persist(updated);
    return updated;
  }

  async signOut(): Promise<void> {
    this.storage.remove(this.currentKey);
    this.emit(null);
  }

  subscribe(listener: (user: UserProfile | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.getCurrentUser());
    return () => this.listeners.delete(listener);
  }

  private persist(user: UserProfile): void {
    this.storage.set(this.currentKey, user);
    this.emit(user);
  }

  private emit(user: UserProfile | null): void {
    this.listeners.forEach((listener) => listener(user));
  }
}

export const DEMO_AUTH_HINT = {
  password: DEMO_PASSWORD,
  note: 'Демо-режим: данные хранятся только в этом браузере.',
};
