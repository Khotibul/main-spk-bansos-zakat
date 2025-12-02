import type { UserRole } from '@prisma/client';

export type Users = {
  email: string;
  username: string;
  role: UserRole;
  password: string;
};
