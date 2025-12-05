'use client';
import { useAuth } from '../../hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import '../../styles/dashboard/dashboard.css';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DashboardHome } from '../../components/dashboard/DashboardHome';

export default function DashboardPage() {
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
      
      // Redireccionar según el rol del usuario
      if (user && user.role?.name === 'admin') {
        router.replace('/parameterization');
        return;
      }
    }
  }, [mounted, isLoading, isAuthenticated, user, router]);

  if (!mounted || isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-white" />;
  }

  // Si es admin, no mostrar este dashboard ya que será redirigido
  if (user && user.role?.name === 'admin') {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <DashboardLayout>
      <DashboardHome />
    </DashboardLayout>
  );
}