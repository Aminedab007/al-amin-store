// server/src/config/env.ts
import "dotenv/config";

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),

  SESSION_SECRET: must("SESSION_SECRET"),
  COOKIE_SECURE: (process.env.COOKIE_SECURE ?? "false") === "true",

  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "",
  ADMIN_EMAILS: process.env.ADMIN_EMAILS ?? "",
  ADMIN_TOKEN: process.env.ADMIN_TOKEN ?? "",

  DATA_DIR: process.env.DATA_DIR ?? "./data",
  ORDERS_FILE: process.env.ORDERS_FILE ?? "orders.json",

  // ✅ Mongo
  MONGO_URI: process.env.MONGO_URI ?? "",

  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",

};
