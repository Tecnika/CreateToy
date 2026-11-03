import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { services } from '../core/container';
import type { Role, UserProfile } from '../core/domain/types';
import type { ProfilePatch, RegisterInput, SocialProvider } from '../core/auth/AuthAdapter';

interface AuthContextValue {
  user: UserProfile | null;
  isDemo: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  signIn: (login: string, password: string) => Promise<UserProfile>;
  register: (input: RegisterInput) => Promise<UserProfile>;
  signInDemo: (role: Role) => Promise<UserProfile>;
  signInWithProvider: (provider: SocialProvider) => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<UserProfile>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => services.auth.currentUser);

  useEffect(() => services.auth.subscribe(setUser), []);

  const value: AuthContextValue = {
    user,
    isDemo: services.auth.isDemo,
    isStaff: user ? user.role === 'manager' || user.role === 'admin' : false,
    isAdmin: user?.role === 'admin',
    signIn: (login, password) => services.auth.signIn(login, password),
    register: (input) => services.auth.register(input),
    signInDemo: (role) => services.auth.signInDemo(role),
    signInWithProvider: (provider) => services.auth.signInWithProvider(provider),
    updateProfile: (patch) => services.auth.updateProfile(patch),
    signOut: () => services.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
