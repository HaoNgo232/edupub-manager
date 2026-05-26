import { User } from '@prisma/client';

export function sanitizeUser(user: User): Omit<User, 'passwordHash'>;
export function sanitizeUser(user: null): null;
export function sanitizeUser(user: User | null): Omit<User, 'passwordHash'> | null {
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}
