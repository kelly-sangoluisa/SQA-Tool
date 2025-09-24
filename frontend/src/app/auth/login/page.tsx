'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth';
import { SignInRequest } from '@/lib/auth/types/auth';
import { authAPI } from '@/lib/auth/api/auth.api';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (data: SignInRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authAPI.signIn(data.email, data.password);
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (result.data) {
        if (globalThis.window !== undefined) {
          globalThis.window.localStorage.setItem('user', JSON.stringify(result.data.user));
        }
        
        router.push('/dashboard');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      isLoading={isLoading}
      error={error}
    />
  );
}