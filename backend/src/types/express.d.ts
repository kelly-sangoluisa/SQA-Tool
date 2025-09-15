import type { SupabaseJwtPayload } from '../auth/types/auth.types';
import { User } from '../users/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: SupabaseJwtPayload; 
      currentUser?: User;
    }
  }
}