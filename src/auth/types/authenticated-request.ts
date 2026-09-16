import { Request } from 'express';
import type { AuthenticatedUser } from '../strategies/jwt.strategy';

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};
