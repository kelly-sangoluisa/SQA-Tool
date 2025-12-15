'use client';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { AdminParameterization } from '../../components/parameterization';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import '../../styles/admin/admin.css';

function ParameterizationContent() {
  return (
    <DashboardLayout>
      <AdminParameterization />
    </DashboardLayout>
  );
}

export default function AdminParameterizationPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ParameterizationContent />
    </ProtectedRoute>
  );
}