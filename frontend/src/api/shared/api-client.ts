// En producción usa rutas relativas (/api) para aprovechar rewrites de Next.js
// En desarrollo usa la URL completa para conectar al backend local
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');

// Evento global para notificar cuando la sesión expira
export const AUTH_EXPIRED_EVENT = 'auth:expired';

export class ApiClient {
  private readonly baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private notifyAuthExpired(): void {
    if (globalThis.window !== undefined) {
      globalThis.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }
  }

  private getToken(): string | null {
    // Las cookies HttpOnly (sb-access-token) son manejadas automáticamente por el navegador
    // con credentials: 'include', NO necesitamos leerlas manualmente
    // Este método solo existe por compatibilidad legacy
    return null;
  }

  private isAuthError(error: unknown, statusCode?: number): boolean {
    if (statusCode === 401 || statusCode === 403) {
      return true;
    }
    
    if (!(error instanceof Error)) {
      return false;
    }

    return error.message.includes('401') || 
           error.message.includes('403') ||
           error.message.includes('Unauthorized') ||
           error.message.includes('No token provided');
  }

  private shouldLogError(endpoint: string, error: unknown, statusCode?: number): boolean {
    const isAuthEndpoint = endpoint.includes('/auth/');
    const isAuthErr = this.isAuthError(error, statusCode);
    return !(isAuthErr && isAuthEndpoint);
  }

  private async handleErrorResponse(response: Response, endpoint: string): Promise<never> {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;

    // Si es error de autenticación (401/403), notificar para redirigir al login
    if (response.status === 401 || response.status === 403) {
      this.notifyAuthExpired();
    }

    if (this.shouldLogError(endpoint, errorMessage, response.status)) {
      console.error('API Error:', errorMessage);
    }

    throw new Error(errorMessage);
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    // Si la respuesta es 204 (No Content) o no tiene contenido, retornar vacío
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    // Verificar si hay contenido antes de parsear JSON
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : {} as T;
    }

    return {} as T;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get authentication token
    const token = this.getToken();
    
    const config: RequestInit = {
      credentials: 'include', // Para las cookies de Supabase
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        await this.handleErrorResponse(response, endpoint);
      }

      return await this.parseResponse<T>(response);
    } catch (error) {
      // Si es error de autenticación por excepción, notificar también
      if (this.isAuthError(error)) {
        this.notifyAuthExpired();
      }

      if (this.shouldLogError(endpoint, error)) {
        console.error('API Error:', error);
      }
      
      throw error instanceof Error ? error : new Error('API request failed');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient();