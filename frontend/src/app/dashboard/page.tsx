'use client';
import { useAuth } from '../../hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import '../../styles/dashboard/dashboard.css';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DashboardHome } from '../../components/dashboard/DashboardHome';

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <DashboardLayout>
      <DashboardHome />
    </DashboardLayout>
  );
}