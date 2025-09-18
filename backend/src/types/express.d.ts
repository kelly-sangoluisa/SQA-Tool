import type { ISupabaseJwtPayload } from '../auth/types/auth.types';
import { User } from '../users/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
  user?: ISupabaseJwtPayload; 
      currentUser?: User;
    }
  }
}