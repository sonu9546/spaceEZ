// src/api/types.ts
export interface ApiResponse<T = unknown> {
  status: number;
  data?: T;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
}

export interface ApiRequestConfig<TVariables = unknown> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  params?: Record<string, unknown>;
  data?: TVariables;
  headers?: Record<string, string>;
}
