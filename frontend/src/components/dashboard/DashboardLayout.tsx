'use client';
import { useAuth } from '../../hooks/auth/useAuth';
import { Button } from '../shared/Button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      // No necesitamos hacer router.push aquí, useAuth ya maneja la redirección
    } catch (error) {
      console.error('Error durante el logout:', error);
      // En caso de error, forzar redirección al login
      router.replace('/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {process.env.NEXT_PUBLIC_APP_NAME || 'SQA Tool'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user ? getUserInitials(user.name) : 'U'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role.name}
                  </p>
                </div>
              </div>
              
              <Button
                variant="secondary"
                onClick={handleSignOut}
                size="sm"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation breadcrumb */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <a href="/dashboard" className="text-blue-600 hover:text-blue-500">
                  Dashboard
                </a>
              </li>
            </ol>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}