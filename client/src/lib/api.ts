// src/lib/api.ts
export const API_BASE =
  (import.meta as any).env?.VITE_API_URL?.toString()?.trim() || "http://localhost:4000";

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;

  constructor(message: string, status?: number, extra?: { code?: string; details?: any }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = extra?.code;
    this.details = extra?.details;
  }
}

async function safeJson(res: Response) {
  if (res.status === 204) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function extract(resJson: any, status: number) {
  const msg =
    resJson && typeof resJson.message === "string" && resJson.message.trim()
      ? resJson.message
      : resJson && typeof resJson.error === "string" && resJson.error.trim()
        ? resJson.error
        : resJson?.error?.message && typeof resJson.error.message === "string"
          ? resJson.error.message
          : `HTTP ${status}`;

  const code =
    (resJson && typeof resJson.code === "string" ? resJson.code : undefined) ??
    (resJson?.error && typeof resJson.error.code === "string" ? resJson.error.code : undefined);

  const details =
    resJson && typeof resJson.details !== "undefined"
      ? resJson.details
      : typeof resJson?.error?.details !== "undefined"
        ? resJson.error.details
        : undefined;

  return { msg, code, details };
}

type RequestOptions = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(API_BASE + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: RequestOptions
): Promise<T> {
  const res = await fetch(buildUrl(path, params), {
    method: "GET",
    headers: { Accept: "application/json", ...(options?.headers ?? {}) },
    credentials: "include",
    signal: options?.signal,
  });

  const data = await safeJson(res);

  if (!res.ok) {
    const { msg, code, details } = extract(data, res.status);
    throw new ApiError(msg, res.status, { code, details });
  }

  return data as T;
}

export async function apiPost<TResponse, TBody extends Record<string, any>>(
  path: string,
  body: TBody,
  options?: RequestOptions
): Promise<TResponse> {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    credentials: "include",
    signal: options?.signal,
    body: JSON.stringify(body),
  });

  const data = await safeJson(res);

  if (!res.ok) {
    const { msg, code, details } = extract(data, res.status);
    throw new ApiError(msg, res.status, { code, details });
  }

  return data as TResponse;
}

export async function apiPatch<TResponse, TBody extends Record<string, any>>(
  path: string,
  body: TBody,
  options?: RequestOptions
): Promise<TResponse> {
  const res = await fetch(API_BASE + path, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    credentials: "include",
    signal: options?.signal,
    body: JSON.stringify(body),
  });

  const data = await safeJson(res);

  if (!res.ok) {
    const { msg, code, details } = extract(data, res.status);
    throw new ApiError(msg, res.status, { code, details });
  }

  return data as TResponse;
}
