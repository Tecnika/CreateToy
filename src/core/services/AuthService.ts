import type {
  AuthAdapter,
  ProfilePatch,
  RegisterInput,
  SocialProvider,
} from '../auth/AuthAdapter';
import { RoleGuard } from '../domain/Role';
import type { Role, UserProfile } from '../domain/types';

export class AuthService {
  constructor(private readonly adapter: AuthAdapter) {}

  get isDemo(): boolean {
    return this.adapter.isDemo;
  }

  get currentUser(): UserProfile | null {
    return this.adapter.getCurrentUser();
  }

  get isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  get isStaff(): boolean {
    return this.currentUser ? RoleGuard.isStaff(this.currentUser.role) : false;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  initialize(): Promise<void> {
    return this.adapter.initialize();
  }

  signIn(login: string, password: string): Promise<UserProfile> {
    return this.adapter.signIn(login, password);
  }

  register(input: RegisterInput): Promise<UserProfile> {
    return this.adapter.register(input);
  }

  signInDemo(role: Role): Promise<UserProfile> {
    return this.adapter.signInDemo(role);
  }

  async signInWithProvider(provider: SocialProvider): Promise<void> {
    if (!this.adapter.signInWithProvider) {
      throw new Error('Социальный вход пока не настроен.');
    }
    await this.adapter.signInWithProvider(provider);
  }

  updateProfile(patch: ProfilePatch): Promise<UserProfile> {
    return this.adapter.updateProfile(patch);
  }

  signOut(): Promise<void> {
    return this.adapter.signOut();
  }

  subscribe(listener: (user: UserProfile | null) => void): () => void {
    return this.adapter.subscribe(listener);
  }
}
