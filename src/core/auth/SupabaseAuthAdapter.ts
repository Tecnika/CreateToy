import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Role, UserProfile } from '../domain/types';
import type { UserRepository } from '../repositories/types';
import { mapAuthError, supabaseError } from '../supabase/errors';
import { mapProfileRow } from '../supabase/mappers';
import type { ProfileRow } from '../supabase/database';
import type { SupabaseCache } from '../supabase/store';
import {
  EmailConfirmationRequiredError,
  type AuthAdapter,
  type ProfilePatch,
  type RegisterInput,
  type SocialProvider,
} from './AuthAdapter';

const ADMIN_LOGIN = ((import.meta.env.VITE_ADMIN_LOGIN as string | undefined) || 'Administrator').trim().toLowerCase();
const ADMIN_EMAIL = ((import.meta.env.VITE_ADMIN_EMAIL as string | undefined) || 'admin@createtoy.local').trim();

function resolveLogin(login: string): string {
  const normalized = login.trim();
  return normalized.toLowerCase() === ADMIN_LOGIN ? ADMIN_EMAIL : normalized;
}

function displayNameFor(user: User): string {
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const fromMetadata =
    (typeof metadata?.display_name === 'string' && metadata.display_name) ||
    (typeof metadata?.full_name === 'string' && metadata.full_name) ||
    (typeof metadata?.name === 'string' && metadata.name);
  if (fromMetadata) return fromMetadata;
  return (user.email ?? '').split('@')[0] || 'Покупатель';
}

export class SupabaseAuthAdapter implements AuthAdapter {
  readonly isDemo = false;
  private current: UserProfile | null = null;
  private readonly listeners = new Set<(user: UserProfile | null) => void>();
  private initialization: Promise<void> | null = null;

  constructor(
    private readonly client: SupabaseClient,
    private readonly users: UserRepository,
    private readonly cache: SupabaseCache,
  ) {}

  async initialize(): Promise<void> {
    if (!this.initialization) {
      this.initialization = this.bootstrap();
    }
    return this.initialization;
  }

  getCurrentUser(): UserProfile | null {
    return this.current;
  }

  async signIn(login: string, password: string): Promise<UserProfile> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: resolveLogin(login),
      password,
    });
    if (error) throw mapAuthError(error);
    if (!data.user) throw new Error('Supabase не вернул пользователя.');
    return this.activate(data.user);
  }

  async register(input: RegisterInput): Promise<UserProfile> {
    const email = input.email.trim().toLowerCase();
    if (input.displayName.trim().length < 2) {
      throw new Error('Укажите имя.');
    }
    if (input.password.length < 6) {
      throw new Error('Пароль должен быть не короче 6 символов.');
    }

    const { data, error } = await this.client.auth.signUp({
      email,
      password: input.password,
      options: { data: { display_name: input.displayName.trim() } },
    });
    if (error) throw mapAuthError(error);
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      throw new Error('Аккаунт с таким email уже существует. Войдите или восстановите пароль.');
    }
    if (!data.session || !data.user) {
      throw new EmailConfirmationRequiredError();
    }
    return this.activate(data.user);
  }

  async signInDemo(_role: Role): Promise<UserProfile> {
    throw new Error('Демо-вход отключён: сайт работает с облачной базой Supabase.');
  }

  async signInWithProvider(provider: SocialProvider): Promise<void> {
    const { error } = await this.client.auth.signInWithOAuth({
      provider,
      options: { redirectTo: this.redirectUrl() },
    });
    if (error) throw mapAuthError(error);
  }

  async updateProfile(patch: ProfilePatch): Promise<UserProfile> {
    if (!this.current) throw new Error('Сначала войдите в аккаунт.');
    const updated: UserProfile = { ...this.current, ...patch };

    if (patch.displayName !== undefined && patch.displayName !== this.current.displayName) {
      const { error } = await this.client.auth.updateUser({
        data: { display_name: patch.displayName },
      });
      if (error) throw mapAuthError(error);
    }

    await this.users.save(updated);
    const saved = this.users.getById(updated.uid) ?? updated;
    this.current = saved;
    this.cache.upsertUser(saved);
    this.emit(saved);
    return saved;
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    this.current = null;
    this.cache.clearSession();
    this.emit(null);
    if (error) console.warn('Supabase signOut:', error.message);
  }

  subscribe(listener: (user: UserProfile | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.current);
    return () => this.listeners.delete(listener);
  }

  private async bootstrap(): Promise<void> {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw mapAuthError(error);

    if (data.session?.user) {
      const profile = await this.ensureProfile(data.session.user);
      this.current = profile;
      this.cache.upsertUser(profile);
      this.emit(profile);
      await this.reloadPrivateData();
    }

    this.client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && this.current) {
        this.current = null;
        this.cache.clearSession();
        this.emit(null);
      }
    });
  }

  private async activate(user: User): Promise<UserProfile> {
    const profile = await this.ensureProfile(user);
    this.current = profile;
    this.cache.upsertUser(profile);
    this.emit(profile);
    await this.reloadPrivateData();
    return profile;
  }

  private async ensureProfile(user: User): Promise<UserProfile> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (error) throw supabaseError(error, 'Не удалось загрузить профиль.');
    if (data) return mapProfileRow(data as ProfileRow);

    const profile: UserProfile = {
      uid: user.id,
      email: user.email ?? '',
      displayName: displayNameFor(user),
      role: 'buyer',
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    const { data: inserted, error: insertError } = await this.client
      .from('profiles')
      .insert({
        id: profile.uid,
        email: profile.email,
        display_name: profile.displayName,
        role: 'buyer',
        addresses: [],
      })
      .select('*')
      .single();

    if (insertError) {
      const retry = await this.client.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (retry.data) return mapProfileRow(retry.data as ProfileRow);
      throw supabaseError(insertError, 'Не удалось создать профиль.');
    }
    return mapProfileRow(inserted as ProfileRow);
  }

  private async reloadPrivateData(): Promise<void> {
    try {
      await this.cache.loadSession();
    } catch (error) {
      console.warn('Supabase session data:', error instanceof Error ? error.message : error);
    }
  }

  private redirectUrl(): string {
    if (typeof window === 'undefined') return '';
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    return `${window.location.origin}${base}/login`;
  }

  private emit(user: UserProfile | null): void {
    this.listeners.forEach((listener) => listener(user));
  }
}
