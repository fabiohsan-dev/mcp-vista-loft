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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string, body: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  private buildUrl(endpoint: string, params: Record<string, any> = {}): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('key', this.apiKey);

    const finalizedParams: Record<string, any> = { ...params };

    // LOFT API COMPLIANCE: Move paginacao para dentro de pesquisa se existir
    if (finalizedParams.paginacao && finalizedParams.pesquisa) {
      finalizedParams.pesquisa.paginacao = finalizedParams.paginacao;
      delete finalizedParams.paginacao;
    }

    for (const [key, value] of Object.entries(finalizedParams)) {
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
      const maskedUrl = url.replace(/key=[^&]+/, 'key=***');
      logger.debug(`[API VISTA REQUEST] ${options.method} ${maskedUrl}`);

      const response = await fetch(url, {
        ...options,
        headers: { 'Accept': 'application/json', ...options.headers },
        signal: controller.signal,
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new ApiError(`Resposta não-JSON: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok || data?.status === 'error' || data?.error) {
        throw new ApiError(data?.message || data?.error || response.statusText, response.status);
      }

      return data as T;
    } catch (error: any) {
      if (error.name === 'AbortError') throw new ApiError('Timeout', 408);
      throw error instanceof ApiError ? error : new ApiError(error.message);
    } finally {
      clearTimeout(timeout);
    }
  }
}
