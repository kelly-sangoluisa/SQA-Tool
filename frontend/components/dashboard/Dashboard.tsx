'use client';

import React from 'react';
import { Plus, Settings, BarChart3, ClipboardCheck, LogOut, Database } from 'lucide-react';
import { useAuth } from '@/lib/auth/context/AuthContext';

interface DashboardProps {
  onNewEvaluation: () => void;
  onActiveEvaluations: () => void;
  onReports: () => void;
  onIngresoData: () => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  onNewEvaluation,
  onActiveEvaluations,
  onReports,
  onIngresoData,
  onLogout
}) => {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ClipboardCheck className="h-8 w-8 text-[#4E5EA3]" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                Evaluador de Calidad
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4E5EA3]"></div>
                  <span className="text-sm text-gray-500">Cargando...</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-900 font-medium">
                      {user?.name || 'Usuario'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Rol: {user?.role?.name || 'Sin rol'}
                    </span>
                  </div>
                  <div className="h-8 w-8 bg-[#4E5EA3] rounded-full flex items-center justify-center">
                    <ClipboardCheck className="h-4 w-4 text-white" />
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Panel de Evaluaciones
          </h2>
          <p className="text-gray-600">
            Configure y gestione evaluaciones de calidad para productos y sistemas
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Nueva Evaluación */}
          <button 
            onClick={onNewEvaluation}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group hover:border-[#4E5EA3] w-full text-left focus:outline-none focus:ring-2 focus:ring-[#4E5EA3] focus:ring-opacity-50"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-[#4E5EA3] rounded-lg group-hover:bg-[#59469A] transition-colors duration-200">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Nueva Evaluación
              </h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Configure una nueva evaluación de calidad siguiendo los modelos parametrizados
            </p>
          </button>

          {/* Evaluaciones Activas */}
          <button 
            onClick={onActiveEvaluations}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group hover:border-[#3D6BA6] w-full text-left focus:outline-none focus:ring-2 focus:ring-[#3D6BA6] focus:ring-opacity-50"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-[#3D6BA6] rounded-lg group-hover:bg-[#336791] transition-colors duration-200">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Evaluaciones Activas
              </h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Gestione evaluaciones en proceso y revise su estado
            </p>
          </button>

          {/* Ingreso de Datos */}
          <button 
            onClick={onIngresoData}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group hover:border-[#059669] w-full text-left focus:outline-none focus:ring-2 focus:ring-[#059669] focus:ring-opacity-50"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-[#059669] rounded-lg group-hover:bg-[#047857] transition-colors duration-200">
                <Database className="h-6 w-6 text-white" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Ingreso de Datos
              </h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Ingrese y gestione los datos necesarios para las evaluaciones
            </p>
          </button>

          {/* Reportes */}
          <button 
            onClick={onReports}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group hover:border-[#1B72A5] w-full text-left focus:outline-none focus:ring-2 focus:ring-[#1B72A5] focus:ring-opacity-50"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-[#1B72A5] rounded-lg group-hover:bg-[#336791] transition-colors duration-200">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Reportes
              </h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Visualice resultados y genere reportes de evaluaciones completadas
            </p>
          </button>
        </div>

        {/* Recent Evaluations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Evaluaciones Recientes
            </h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No hay evaluaciones configuradas</p>
              <p className="text-gray-400 text-sm mb-6">
                Comience creando su primera evaluación de calidad
              </p>
              <button 
                onClick={onNewEvaluation}
                className="bg-[#4E5EA3] text-white px-6 py-3 rounded-lg hover:bg-[#59469A] transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Crear primera evaluación
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;