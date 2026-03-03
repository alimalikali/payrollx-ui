import type { User } from '@/hooks/useAuth';

export type AppRole = 'admin' | 'hr' | 'employee';

export const hasRole = (user: User | undefined, allowedRoles?: AppRole[]) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!user) return false;
  return allowedRoles.includes(user.role);
};

export const isPrivileged = (user: User | undefined) => user?.role === 'admin' || user?.role === 'hr';
export const isHR = (user: User | undefined) => user?.role === 'hr';
export const isAdmin = (user: User | undefined) => user?.role === 'admin';

export const isEmployee = (user: User | undefined) => user?.role === 'employee';
