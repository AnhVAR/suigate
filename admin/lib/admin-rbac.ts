export type AdminRole = 'admin' | 'support';

export type Permission =
  | 'view_orders'
  | 'update_orders'
  | 'view_users'
  | 'update_users'
  | 'view_analytics';

const PERMISSIONS: Record<AdminRole, Permission[]> = {
  admin: ['view_orders', 'update_orders', 'view_users', 'update_users', 'view_analytics'],
  support: ['view_orders', 'view_users', 'view_analytics'],
};

/**
 * Check if a role has a specific permission
 * @param role - Admin role
 * @param permission - Permission to check
 * @returns True if role has permission
 */
export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role
 * @param role - Admin role
 * @returns Array of permissions
 */
export function getRolePermissions(role: AdminRole): Permission[] {
  return PERMISSIONS[role] || [];
}

/**
 * Check if role can update orders
 */
export function canUpdateOrders(role: AdminRole): boolean {
  return hasPermission(role, 'update_orders');
}

/**
 * Check if role can update users
 */
export function canUpdateUsers(role: AdminRole): boolean {
  return hasPermission(role, 'update_users');
}
