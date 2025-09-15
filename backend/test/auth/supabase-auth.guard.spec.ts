import { SupabaseAuthGuard } from "src/auth/supabase-auth/supabase-auth.guard";

describe('SupabaseAuthGuard', () => {
  it('should be defined', () => {
    expect(new SupabaseAuthGuard()).toBeDefined();
  });
});
