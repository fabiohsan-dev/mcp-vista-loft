import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../errors/AppError.js';

export class VistaClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = env.VISTA_URL.replace(/\/+$/, '');
    this.apiKey = env.VISTA_KEY;
  }

  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  private buildUrl(endpoint: string, params: Record<string, any> = {}): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('key', this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        url.searchParams.append(key, stringValue);
      }
    }

    return url.toString();
  }

  private async request<T>(url: string, options: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ApiError(`Erro HTTP ${response.status}: ${response.statusText}`, response.status);
      }

      const data = await response.json();

      // Detecção de erro de negócio dentro da resposta 200 (comum na API Vista)
      if (data && (data.error || data.status === 'error')) {
        throw new ApiError(data.message || data.error || 'Erro interno na API Vista');
      }

      return data as T;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new ApiError('Requisição cancelada por timeout', 408);
      }
      if (error instanceof ApiError) throw error;
      
      logger.error('Falha na comunicação com API Vista', error);
      throw new ApiError(error.message || 'Erro de rede desconhecido');
    } finally {
      clearTimeout(timeout);
    }
  }
}
