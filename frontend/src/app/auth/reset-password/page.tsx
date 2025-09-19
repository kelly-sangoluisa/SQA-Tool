'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth';
import { ResetPasswordRequest } from '@/lib/auth/types/auth';
import { authAPI } from '@/lib/auth/api/auth.api';

// Loading component for Suspense fallback
function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E5EA3]"></div>
    </div>
  );
}

// Content component that uses useSearchParams
function ResetPasswordContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Get access token from URL parameters
    const token = searchParams.get('token') || searchParams.get('access_token');
    if (token) {
      setAccessToken(token);
    }
  }, [searchParams]);

  const handleResetPassword = async (data: ResetPasswordRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authAPI.resetPassword(data.access_token, data.new_password);
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      setSuccess('Contraseña actualizada exitosamente');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResetPasswordForm
      onSubmit={handleResetPassword}
      isLoading={isLoading}
      error={error}
      success={success}
      accessToken={accessToken || undefined}
    />
  );
}

// Main page component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
