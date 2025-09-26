interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        mode: 'cors',
        ...options,
      });

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || 'No content' };
      }

      if (!response.ok) {
        return {
          error: {
            message: data.message || `HTTP ${response.status}: ${response.statusText}`,
            error: data.error,
            statusCode: response.status,
          }
        };
      }

      return { data };
      
    } catch (error) {
      let errorMessage = 'Error de conexión';
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté activo.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        error: {
          message: errorMessage,
          statusCode: 0,
          error: error instanceof Error ? error.message : String(error),
        }
      };
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { 
      method: 'GET',
      headers 
    });
  }

  async post<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers
    });
  }

  async put<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { 
      method: 'DELETE',
      headers 
    });
  }

  async healthCheck(): Promise<ApiResponse<{ status: string, timestamp: string }>> {
    return this.get<{ status: string, timestamp: string }>('/');
  }
}

export const apiClient = new ApiClient();