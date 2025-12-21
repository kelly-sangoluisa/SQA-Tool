'use client';
import { useAuth } from '../../hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import '../../styles/dashboard/dashboard.css';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DashboardHome } from '../../components/dashboard/DashboardHome';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

function DashboardPageContent() {
  const { user } = useAuth();
  const router = useRouter();

  // Redireccionar a admins a su página correspondiente
  useEffect(() => {
    if (user && user.role?.name === 'admin') {
      router.replace('/parameterization');
    }
  }, [user, router]);

  // Si es admin, no mostrar este dashboard ya que será redirigido
  if (user && user.role?.name === 'admin') {
    return null;
  }

  return (
    <DashboardLayout>
      <DashboardHome />
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="any">
      <DashboardPageContent />
    </ProtectedRoute>
  );
}