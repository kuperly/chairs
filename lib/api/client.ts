/**
 * API Client
 *
 * Centralized fetch wrapper with:
 * - Automatic authentication headers
 * - Error handling
 * - Type safety
 * - Base URL configuration
 */

export interface ApiError {
  error: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session
    };

    try {
      const response = await fetch(url, config);

      // Parse response
      const data = await response.json();

      // Handle errors
      if (!response.ok) {
        const error: ApiError = data;
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    // Build query string
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null) {
              acc[key] = String(value);
            }
            return acc;
          }, {} as Record<string, string>)
        ).toString()
      : '';

    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const api = new ApiClient('/api');

// Export typed API methods for common endpoints
export const productsApi = {
  list: (params?: {
    category?: string;
    manufacturerId?: string;
    isActive?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) => api.get<PaginatedResponse<any>>('/products', params),

  get: (id: string) => api.get<ApiResponse<any>>(`/products/${id}`),

  create: (data: any) => api.post<ApiResponse<any>>('/products', data),

  update: (id: string, data: any) => api.put<ApiResponse<any>>(`/products/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<{ deleted: boolean }>>(`/products/${id}`),

  categories: () => api.get<ApiResponse<{ categories: string[] }>>('/products/categories'),
};

export const eventsApi = {
  list: (params?: {
    status?: string;
    manufacturerId?: string;
    upcoming?: boolean;
    limit?: number;
    offset?: number;
  }) => api.get<PaginatedResponse<any>>('/events', params),

  get: (id: string) => api.get<ApiResponse<any>>(`/events/${id}`),

  create: (data: any) => api.post<ApiResponse<any>>('/events', data),

  update: (id: string, data: any) => api.put<ApiResponse<any>>(`/events/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<{ deleted: boolean }>>(`/events/${id}`),

  startBroadcast: (id: string, data?: any) =>
    api.post<ApiResponse<any>>(`/events/${id}/broadcast/start`, data),

  endBroadcast: (id: string) =>
    api.post<ApiResponse<any>>(`/events/${id}/broadcast/end`),
};

export const ordersApi = {
  list: (params?: {
    status?: string;
    customerId?: string;
    eventId?: string;
    limit?: number;
    offset?: number;
  }) => api.get<PaginatedResponse<any>>('/orders', params),

  get: (id: string) => api.get<ApiResponse<any>>(`/orders/${id}`),

  create: (data: any) => api.post<ApiResponse<any>>('/orders', data),

  updateStatus: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/orders/${id}`, data),

  confirmPayment: (id: string, data: any) =>
    api.post<ApiResponse<any>>(`/orders/${id}/payment/confirm`, data),
};

export const usersApi = {
  list: (params?: {
    roleId?: string;
    manufacturerId?: string;
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) => api.get<PaginatedResponse<any>>('/users', params),

  get: (id: string) => api.get<ApiResponse<any>>(`/users/${id}`),

  me: () => api.get<ApiResponse<any>>('/users/me'),

  update: (id: string, data: any) => api.put<ApiResponse<any>>(`/users/${id}`, data),

  updateProfile: (data: any) => api.put<ApiResponse<any>>('/users/me', data),

  delete: (id: string) => api.delete<ApiResponse<{ deleted: boolean }>>(`/users/${id}`),
};

export const manufacturersApi = {
  list: (params?: {
    isApproved?: boolean;
    isHidden?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) => api.get<PaginatedResponse<any>>('/manufacturers', params),

  get: (id: string) => api.get<ApiResponse<any>>(`/manufacturers/${id}`),

  create: (data: any) => api.post<ApiResponse<any>>('/manufacturers', data),

  update: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/manufacturers/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/manufacturers/${id}`),

  approve: (id: string, data: { isApproved: boolean; notes?: string }) =>
    api.post<ApiResponse<any>>(`/manufacturers/${id}/approve`, data),

  products: (id: string, params?: {
    isActive?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
  }) => api.get<PaginatedResponse<any>>(`/manufacturers/${id}/products`, params),
};

export const rolesApi = {
  list: () => api.get<ApiResponse<{ roles: any[] }>>('/roles'),
};
