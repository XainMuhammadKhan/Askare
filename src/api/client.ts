import { ENV } from '../config/env';

/**
 * Thin, defensive HTTP client around fetch.
 * - Prefixes the base URL & encodes query params safely
 * - Attaches Bearer token + enforces a 25s request timeout via AbortController
 * - Explicitly maps HTTP status codes (200s, 400, 401, 403, 404, 409, 422, 429, 500, 503)
 * - Unwraps the backend envelope `{ success, message, data, meta }`
 * - Converts error responses into a typed ApiError
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: string[],
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isValidation() {
    return this.status === 400 || this.status === 422;
  }
  get isUnauthorized() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isNotFound() {
    return this.status === 404;
  }
  get isConflict() {
    return this.status === 409;
  }
  get isServerError() {
    return this.status >= 500;
  }
}

export interface Paginated<T> {
  items: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  body?: unknown;
  query?: Query;
  timeoutMs?: number;
}

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const tokenStorage = {
  set: (token: string | null) => {
    accessToken = token ? token.trim() : null;
  },
  get: () => accessToken,
};

/** Register a callback fired on any 401 (e.g. log the user out). */
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

const buildUrl = (path: string, query?: Query) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const params = Object.entries(query ?? {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `${ENV.API_BASE_URL}${cleanPath}${params ? `?${params}` : ''}`;
};

const STATUS_FALLBACKS: Record<number, string> = {
  400: 'Invalid request data. Please check your inputs.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with current state (e.g., slot already booked or item already processed).',
  422: 'Validation failed. Please review the form fields.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Internal server error. Please try again shortly.',
  502: 'Server gateway error. Please try again shortly.',
  503: 'The service or AI assistant is temporarily busy. Please try again in a minute.',
  504: 'Server timed out. Please try again.',
};

const extractError = (json: any, status: number): { message: string; details?: string[] } => {
  const raw = json?.message ?? json?.error;
  if (Array.isArray(raw)) {
    const details = raw.map((item) => String(item));
    return { message: details.join('\n'), details };
  }
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return { message: raw.trim() };
  }
  return {
    message: STATUS_FALLBACKS[status] ?? `Request failed with HTTP status ${status}`,
  };
};

async function request<T>(method: Method, path: string, { body, query, timeoutMs = 25000 }: RequestOptions = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'AskCareMobile',
  };
  if (!isFormData && body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      signal: controller?.signal,
    });
  } catch (err: any) {
    if (timer) clearTimeout(timer);
    if (err?.name === 'AbortError') {
      throw new ApiError(408, 'Request timed out. Please check your connection and try again.');
    }
    throw new ApiError(0, 'Network error. Please check your internet connection.');
  } finally {
    if (timer) clearTimeout(timer);
  }

  // Handle 204 No Content safely
  if (response.status === 204) {
    return { data: undefined as unknown as T, meta: undefined, message: 'No content' };
  }

  const text = await response.text().catch(() => '');
  let json: any = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (response.status < 200 || response.status >= 300) {
    if (response.status === 401 && accessToken) {
      onUnauthorized?.();
    }
    const { message, details } = extractError(json, response.status);
    throw new ApiError(response.status, message, details);
  }

  // Support both wrapped `{ success, data, meta }` and direct JSON payloads
  if (json && typeof json === 'object' && 'data' in json) {
    return json as { data: T; meta?: Paginated<T>['meta']; message?: string };
  }
  return { data: (json as T) ?? (undefined as unknown as T) };
}

/** Returns only `data` from the response envelope. */
const call = async <T>(method: Method, path: string, options?: RequestOptions) =>
  (await request<T>(method, path, options)).data;

export const http = {
  get: <T>(path: string, query?: Query) => call<T>('GET', path, { query }),
  post: <T>(path: string, body?: unknown) => call<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => call<T>('PUT', path, { body }),
  patch: <T>(path: string, body?: unknown) => call<T>('PATCH', path, { body }),
  delete: <T>(path: string) => call<T>('DELETE', path),

  /** For list endpoints that return pagination `meta`. */
  getPaginated: async <T>(path: string, query?: Query): Promise<Paginated<T>> => {
    const res = await request<T>('GET', path, { query });
    return { items: res.data, meta: res.meta };
  },

  /** Absolute URL for binary endpoints (PDFs) that need to be opened externally. */
  url: buildUrl,
};
