// server/src/utils/httpError.ts
export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;

    // ✅ meilleure stack trace (Node)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }
}

export function httpError(
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  return new HttpError(status, code, message, details);
}

export function normalizeError(err: unknown): {
  status: number;
  payload: { ok: false; error: ApiErrorPayload };
} {
  if (err instanceof HttpError) {
    return {
      status: err.status,
      payload: {
        ok: false,
        error: {
          code: err.code,
          message: err.message,
          ...(err.details !== undefined ? { details: err.details } : {}),
        },
      },
    };
  }

  // ✅ Ne JAMAIS dépendre du message interne pour le client en 500
  return {
    status: 500,
    payload: {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Une erreur interne est survenue." },
    },
  };
}
