'use client';
import Link from 'next/link';

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          {/* Header */}
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            SQA Tool
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Herramienta para la evaluación y aseguramiento de la calidad de software. 
            Administra criterios de evaluación, parametriza procesos y genera reportes detallados.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/auth/login"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/signup"
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Registrarse
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-blue-600 text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-semibold mb-2">Configuración</h3>
              <p className="text-gray-600">
                Define criterios y parámetros de evaluación personalizados
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-green-600 text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Entrada de Datos</h3>
              <p className="text-gray-600">
                Registra información detallada de tus proyectos de software
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-purple-600 text-4xl mb-4">🎛️</div>
              <h3 className="text-xl font-semibold mb-2">Parametrización</h3>
              <p className="text-gray-600">
                Configura parámetros avanzados para evaluaciones precisas
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-yellow-600 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Reportes</h3>
              <p className="text-gray-600">
                Genera reportes comprensivos de calidad de software
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-gray-500 mb-4">Construido con</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span className="bg-white px-3 py-1 rounded-full shadow">Next.js 14</span>
              <span className="bg-white px-3 py-1 rounded-full shadow">NestJS</span>
              <span className="bg-white px-3 py-1 rounded-full shadow">TypeScript</span>
              <span className="bg-white px-3 py-1 rounded-full shadow">Tailwind CSS</span>
              <span className="bg-white px-3 py-1 rounded-full shadow">Supabase</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
