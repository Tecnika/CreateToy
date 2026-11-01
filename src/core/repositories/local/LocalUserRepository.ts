import type { UserProfile } from '../../domain/types';
import { DEMO_USERS } from '../../data/demo';
import type { Storage } from '../../storage/Storage';
import type { UserRepository } from '../types';

export class LocalUserRepository implements UserRepository {
  private readonly key = 'users';

  constructor(private readonly storage: Storage) {
    if (!this.storage.has(this.key)) {
      this.storage.set(this.key, DEMO_USERS);
    }
  }

  list(): UserProfile[] {
    return this.storage.get<UserProfile[]>(this.key, []);
  }

  getById(id: string): UserProfile | undefined {
    return this.list().find((user) => user.uid === id);
  }

  getByEmail(email: string): UserProfile | undefined {
    const normalized = email.trim().toLowerCase();
    return this.list().find((user) => user.email.toLowerCase() === normalized);
  }

  getByLogin(login: string): UserProfile | undefined {
    const normalized = login.trim().toLowerCase();
    return this.list().find(
      (user) =>
        user.email.toLowerCase() === normalized || user.displayName.toLowerCase() === normalized,
    );
  }

  save(user: UserProfile): void {
    const users = this.list();
    const index = users.findIndex((item) => item.uid === user.uid);
    if (index >= 0) users[index] = user;
    else users.push(user);
    this.storage.set(this.key, users);
  }
}
