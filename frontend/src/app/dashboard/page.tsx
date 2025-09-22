'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context/AuthContext';
import Dashboard from '@/components/dashboard/Dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleNewEvaluation = () => {
    router.push('/configuracion');
  };

  const handleActiveEvaluations = () => {
    router.push('/shared/evaluacionesHechas');
  };

  const handleReports = () => {
    router.push('/reportes');
  };

  const handleIngresoData = () => {
    router.push('/ingresoDatos');
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Dashboard 
      onNewEvaluation={handleNewEvaluation}
      onActiveEvaluations={handleActiveEvaluations}
      onReports={handleReports}
      onIngresoData={handleIngresoData}
      onLogout={handleLogout}
    />
  );
}
