'use client';
import { useEffect } from 'react';
import { useAuth } from '../../hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { Loading } from '../../components/shared/Loading';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DashboardHome } from '../../components/dashboard/DashboardHome';

export default function DashboardPage() {
  const { user, isLoading, error, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !user && !error) {
      router.push('/auth/login');
    }
  }, [user, isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error || 'No autenticado'}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ir a Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHome />
    </DashboardLayout>
  );
}