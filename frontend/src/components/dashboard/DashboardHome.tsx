"use client";
import { useAuth } from '../../hooks/auth/useAuth';
import styles from './DashboardHome.module.css';

export function DashboardHome() {
  const { user } = useAuth();

  const modules = [
    {
      name: 'Configuración de Evaluación',
      description: 'Configura criterios y parámetros de evaluación de calidad',
      href: '/modules/config-evaluation',
      icon: '⚙️',
      iconBg: '#e0f2fe',
      iconColor: '#0369a1'
    },
    {
      name: 'Entrada de Datos',
      description: 'Ingresa datos del proyecto para evaluación',
      href: '/modules/entry-data',
      icon: '📝',
      iconBg: '#ecfdf5',
      iconColor: '#065f46'
    },
    {
      name: 'Parametrización',
      description: 'Configura parámetros avanzados del sistema',
      href: '/modules/parameterization',
      icon: '🎛️',
      iconBg: '#f5f3ff',
      iconColor: '#6d28d9'
    },
    {
      name: 'Reportes',
      description: 'Genera y visualiza reportes de evaluación',
      href: '/modules/reports',
      icon: '📊',
      iconBg: '#fffbeb',
      iconColor: '#854d0e'
    },
  ];

  return (
    <div className={styles.root}>
      {/* Welcome Section */}
      <div>
        <h2 className={styles.welcomeTitle}>Bienvenido, {user?.name}</h2>
        <p className={styles.subtitle}>Selecciona un módulo para comenzar con la evaluación de calidad de software</p>
      </div>

      {/* Modules Grid */}
      <div className={styles.modulesGrid}>
        {modules.map((module) => (
          <a key={module.name} href={module.href} className={styles.moduleCard}>
            <div className={styles.moduleIconWrap} style={{ background: module.iconBg }}>
              <span style={{ fontSize: '1.25rem' }}>{module.icon}</span>
            </div>
            <h3 className={styles.moduleTitle} style={{ color: module.iconColor }}>{module.name}</h3>
            <p className={styles.moduleDesc}>{module.description}</p>
          </a>
        ))}
      </div>

      {/* User Info Card */}
      <div className={styles.cardWhite}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>Información del usuario</h3>
        <div className={styles.gridThree}>
          <div>
            <p style={{ fontSize: '.875rem', color: '#6b7280' }}>Nombre</p>
            <p style={{ color: '#0f172a' }}>{user?.name}</p>
          </div>
          <div>
            <p style={{ fontSize: '.875rem', color: '#6b7280' }}>Email</p>
            <p style={{ color: '#0f172a' }}>{user?.email}</p>
          </div>
          <div>
            <p style={{ fontSize: '.875rem', color: '#6b7280' }}>Rol</p>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.625rem', borderRadius: '9999px', fontSize: '.75rem', fontWeight: 600, background: user?.role.name === 'admin' ? '#fee2e2' : '#e0f2fe', color: user?.role.name === 'admin' ? '#991b1b' : '#075985' }}>
              {user?.role.name === 'admin' ? 'Administrador' : 'Evaluador'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.cardWhite}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>Acciones rápidas</h3>
        <div className={styles.gridThree}>
          <a href="/shared/profile" className={styles.quickAction}>
            <span style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>👤</span>
            <div>
              <p style={{ fontWeight: 600 }}>Mi Perfil</p>
              <p style={{ fontSize: '.875rem', color: '#6b7280' }}>Configurar información personal</p>
            </div>
          </a>
          <a href="/shared/settings" className={styles.quickAction}>
            <span style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>⚙️</span>
            <div>
              <p style={{ fontWeight: 600 }}>Configuración</p>
              <p style={{ fontSize: '.875rem', color: '#6b7280' }}>Ajustes del sistema</p>
            </div>
          </a>
          <a href="/shared/notifications" className={styles.quickAction}>
            <span style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>🔔</span>
            <div>
              <p style={{ fontWeight: 600 }}>Notificaciones</p>
              <p style={{ fontSize: '.875rem', color: '#6b7280' }}>Ver alertas y mensajes</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}