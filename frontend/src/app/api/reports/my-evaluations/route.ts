import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/reports/my-evaluations`, {
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
    } catch (e) {
      console.error('Failed to parse backend response', e);
      throw new Error('Invalid JSON response from backend');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching my evaluations:', error);
    return NextResponse.json(
      { error: 'Error al obtener evaluaciones' },
      { status: 500 }
    );
  }
}
