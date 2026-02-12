// src/features/auth/authApi.ts
import { apiGet, apiPost } from "../../lib/api";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export type RegisterBody = { name: string; email: string; password: string };
export type LoginBody = { email: string; password: string };

function pickUser(data: any): ApiUser {
  // support plusieurs shapes possibles
  const u = data?.user ?? data?.me ?? data?.profile ?? data;
  if (!u || !u.id || !u.email) throw new Error("Réponse utilisateur invalide.");
  return u as ApiUser;
}

export async function apiRegister(body: RegisterBody): Promise<ApiUser> {
  const data = await apiPost<any, RegisterBody>("/api/auth/register", body);
  return pickUser(data);
}

export async function apiLogin(body: LoginBody): Promise<ApiUser> {
  const data = await apiPost<any, LoginBody>("/api/auth/login", body);
  return pickUser(data);
}

export async function apiMe(): Promise<ApiUser> {
  const data = await apiGet<any>("/api/auth/me");
  return pickUser(data);
}

export async function apiLogout(): Promise<void> {
  await apiPost<any, {}>("/api/auth/logout", {});
}
