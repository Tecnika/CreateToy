import type { Role, UserProfile } from '../domain/types';
import type { UserRepository } from '../repositories/types';

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  list(): UserProfile[] {
    return [...this.repository.list()].sort((a, b) => a.displayName.localeCompare(b.displayName, 'ru'));
  }

  getById(id: string): UserProfile | undefined {
    return this.repository.getById(id);
  }

  async updateRole(uid: string, role: Role): Promise<UserProfile> {
    const user = this.repository.getById(uid);
    if (!user) throw new Error('Пользователь не найден.');
    const updated: UserProfile = { ...user, role };
    await this.repository.save(updated);
    return updated;
  }
}
