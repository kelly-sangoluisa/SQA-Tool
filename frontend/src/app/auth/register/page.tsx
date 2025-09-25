'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/auth';
import { SignUpRequest } from '@/lib/auth/types/auth';
import { authAPI } from '@/lib/auth/api/auth.api';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (data: SignUpRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await authAPI.signUp(
        data.email, 
        data.password, 
        data.name,
        `${globalThis.location.origin}/auth/verify`
      );
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      setSuccess(
        'Cuenta creada exitosamente. Revisa tu correo electrónico para verificar tu cuenta.'
      );
      
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterForm
      onSubmit={handleRegister}
      isLoading={isLoading}
      error={error}
      success={success}
    />
  );
}
