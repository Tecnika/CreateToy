import type { Role, UserProfile } from '../domain/types';

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
}

export type ProfilePatch = Partial<Pick<UserProfile, 'displayName' | 'phone' | 'addresses'>>;

export interface AuthAdapter {
  getCurrentUser(): UserProfile | null;
  signIn(login: string, password: string): Promise<UserProfile>;
  register(input: RegisterInput): Promise<UserProfile>;
  signInDemo(role: Role): Promise<UserProfile>;
  updateProfile(patch: ProfilePatch): Promise<UserProfile>;
  signOut(): Promise<void>;
  subscribe(listener: (user: UserProfile | null) => void): () => void;
}
