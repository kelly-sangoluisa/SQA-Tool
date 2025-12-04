'use client';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { AdminParameterization } from '../../../components/admin';
import '../../../styles/admin/admin.css';

export default function AdminParameterizationPage() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
      
      // Verificar que el usuario es admin
      if (user && user.role?.name !== 'admin') {
        router.push('/dashboard');
        return;
      }
    }
  }, [mounted, isLoading, isAuthenticated, user, router]);

  if (!mounted || isLoading || !isAuthenticated || !user || user.role?.name !== 'admin') {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <DashboardLayout>
      <AdminParameterization />
    </DashboardLayout>
  );
}