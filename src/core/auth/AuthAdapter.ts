import type { Role, UserProfile } from '../domain/types';

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
}

export type ProfilePatch = Partial<Pick<UserProfile, 'displayName' | 'phone' | 'addresses'>>;

export type SocialProvider = 'google' | 'github';

export class EmailConfirmationRequiredError extends Error {
  constructor(message = 'Мы отправили письмо для подтверждения email. Перейдите по ссылке из письма, затем войдите.') {
    super(message);
    this.name = 'EmailConfirmationRequiredError';
  }
}

export interface AuthAdapter {
  readonly isDemo: boolean;
  initialize(): Promise<void>;
  getCurrentUser(): UserProfile | null;
  signIn(login: string, password: string): Promise<UserProfile>;
  register(input: RegisterInput): Promise<UserProfile>;
  signInDemo(role: Role): Promise<UserProfile>;
  signInWithProvider?(provider: SocialProvider): Promise<void>;
  updateProfile(patch: ProfilePatch): Promise<UserProfile>;
  signOut(): Promise<void>;
  subscribe(listener: (user: UserProfile | null) => void): () => void;
}
