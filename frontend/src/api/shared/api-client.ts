const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include', // ¡IMPORTANTE! Para las cookies de Supabase
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        
        // Detectar si es un error de autenticación esperado
        const isAuthError = response.status === 401 || response.status === 403;
        const isAuthEndpoint = endpoint.includes('/auth/');
        
        // Solo mostrar en consola si no es un error de autenticación en endpoint de auth
        if (!(isAuthError && isAuthEndpoint)) {
          console.error('API Error:', errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      // Filtrar errores de autenticación para no mostrarlos en consola
      const isAuthError = error instanceof Error && 
        (error.message.includes('401') || 
         error.message.includes('403') ||
         error.message.includes('Unauthorized') ||
         error.message.includes('No token provided'));
      
      const isAuthEndpoint = endpoint.includes('/auth/');
      
      // Solo mostrar errores que no sean de autenticación en endpoints de auth
      if (!(isAuthError && isAuthEndpoint)) {
        console.error('API Error:', error);
      }
      
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();