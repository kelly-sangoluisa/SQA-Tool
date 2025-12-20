'use client';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { AdminParameterization } from '../../components/parameterization';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useSidebar } from '@/components/dashboard/sidebar/context/SidebarContext';
import '../../styles/admin/admin.css';
import styles from './parameterization.module.css';

function ParameterizationContent() {
  const { isOpen } = useSidebar();
  
  return (
    <div className={`${styles.parameterizationWrapper} ${isOpen ? styles.sidebarOpen : ''}`}>
      <DashboardLayout>
        <AdminParameterization />
      </DashboardLayout>
    </div>
  );
}

export default function AdminParameterizationPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ParameterizationContent />
    </ProtectedRoute>
  );
}