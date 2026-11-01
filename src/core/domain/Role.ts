import type { Role } from './types';

export const ROLE_LABELS: Record<Role, string> = {
  buyer: 'Покупатель',
  manager: 'Менеджер',
  admin: 'Администратор',
};

export class RoleGuard {
  static isStaff(role: Role): boolean {
    return role === 'manager' || role === 'admin';
  }

  static canManageOrders(role: Role): boolean {
    return RoleGuard.isStaff(role);
  }

  static canManageCatalog(role: Role): boolean {
    return role === 'admin';
  }

  static canManageUsers(role: Role): boolean {
    return role === 'admin';
  }

  static canManageThemes(role: Role): boolean {
    return role === 'admin';
  }

  static canManageTemplates(role: Role): boolean {
    return role === 'admin';
  }
}
