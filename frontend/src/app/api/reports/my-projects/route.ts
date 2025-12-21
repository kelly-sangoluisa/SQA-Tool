import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    console.log('🌐 Frontend API Route: /api/reports/my-projects llamado');

    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;

    if (!token) {
      console.log('❌ Frontend API Route: No hay token');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const fullUrl = `${backendUrl}/reports/my-projects`;
    console.log(`🔗 Frontend API Route: Llamando a ${fullUrl}`);

    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error del backend: ${response.status}`);
    }

    let data;
    try {
      data = await response.json();
      console.log(`✅ Frontend API Route: Recibidos ${Array.isArray(data) ? data.length : 0} proyectos`);
      console.log(`📦 Frontend API Route: Primer proyecto (sample):`, data[0] ? JSON.stringify(data[0]).substring(0, 200) : 'ninguno');
    } catch (e) {
      console.error('Failed to parse backend response', e);
      throw new Error('Invalid JSON response from backend');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching my projects:', error);
    return NextResponse.json(
      { error: 'Error al obtener proyectos' },
      { status: 500 }
    );
  }
}
