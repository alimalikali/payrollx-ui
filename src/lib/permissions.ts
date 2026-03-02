import type { User } from '@/hooks/useAuth';

export type AppRole = 'hr' | 'employee';

export const hasRole = (user: User | undefined, allowedRoles?: AppRole[]) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!user) return false;
  return allowedRoles.includes(user.role);
};

export const isHR = (user: User | undefined) => user?.role === 'hr';

export const isEmployee = (user: User | undefined) => user?.role === 'employee';
