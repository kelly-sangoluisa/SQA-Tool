'use client';
import { useAuth } from '../../hooks/auth/useAuth';

export function DashboardHome() {
  const { user } = useAuth();

  const modules = [
    {
      name: 'Configuración de Evaluación',
      description: 'Configura criterios y parámetros de evaluación de calidad',
      href: '/modules/config-evaluation',
      icon: '⚙️',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      name: 'Entrada de Datos',
      description: 'Ingresa datos del proyecto para evaluación',
      href: '/modules/entry-data',
      icon: '📝',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      name: 'Parametrización',
      description: 'Configura parámetros avanzados del sistema',
      href: '/modules/parameterization',
      icon: '🎛️',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      name: 'Reportes',
      description: 'Genera y visualiza reportes de evaluación',
      href: '/modules/reports',
      icon: '📊',
      bgColor: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.name}
        </h2>
        <p className="mt-2 text-gray-600">
          Selecciona un módulo para comenzar con la evaluación de calidad de software
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module) => (
          <a
            key={module.name}
            href={module.href}
            className={`${module.bgColor} rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1 border border-gray-200`}
          >
            <div className={`${module.iconBg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <span className="text-2xl">{module.icon}</span>
            </div>
            <h3 className={`text-lg font-semibold ${module.textColor} mb-2`}>
              {module.name}
            </h3>
            <p className="text-gray-600 text-sm">{module.description}</p>
          </a>
        ))}
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Información del usuario</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Nombre</p>
            <p className="text-gray-900">{user?.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Rol</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user?.role.name === 'admin' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {user?.role.name === 'admin' ? 'Administrador' : 'Evaluador'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Acciones rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/shared/profile"
            className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">👤</span>
            <div>
              <p className="font-medium">Mi Perfil</p>
              <p className="text-sm text-gray-500">Configurar información personal</p>
            </div>
          </a>
          <a
            href="/shared/settings"
            className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">⚙️</span>
            <div>
              <p className="font-medium">Configuración</p>
              <p className="text-sm text-gray-500">Ajustes del sistema</p>
            </div>
          </a>
          <a
            href="/shared/notifications"
            className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">🔔</span>
            <div>
              <p className="font-medium">Notificaciones</p>
              <p className="text-sm text-gray-500">Ver alertas y mensajes</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}