// server/src/lib/idempotency.ts
type StoredResponse = {
  status: number;
  body: any;
  createdAt: number;
};

const store = new Map<string, StoredResponse>();

const TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_KEYS = 5000;

function now() {
  return Date.now();
}

function cleanup() {
  const t = now();

  // purge TTL
  for (const [k, v] of store.entries()) {
    if (t - v.createdAt > TTL_MS) store.delete(k);
  }

  // safety cap (remove oldest)
  if (store.size > MAX_KEYS) {
    const entries = Array.from(store.entries()).sort((a, b) => a[1].createdAt - b[1].createdAt);
    const extra = store.size - MAX_KEYS;
    for (let i = 0; i < extra; i++) store.delete(entries[i][0]);
  }
}

export function getIdempotentResponse(key: string) {
  cleanup();
  return store.get(key) ?? null;
}

export function setIdempotentResponse(key: string, status: number, body: any) {
  cleanup();
  store.set(key, { status, body, createdAt: now() });
}
