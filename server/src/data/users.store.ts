// server/src/data/users.store.ts
import crypto from "crypto";
import { UserModel } from "../models/User.mongo.js";

function hashPassword(pw: string) {
  // dev-only (si tu veux bcrypt plus tard)
  return crypto.createHash("sha256").update(pw).digest("hex");
}

export async function createUser(input: { name: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();

  const exists = await UserModel.findOne({ email }).lean();
  if (exists) throw new Error("USER_EXISTS");

  const doc = await UserModel.create({
    name: input.name.trim(),
    email,
    passwordHash: hashPassword(input.password),
  });

  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
  };
}

export async function verifyUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const user = await UserModel.findOne({ email }).lean();
  if (!user) return null;

  const ok = user.passwordHash === hashPassword(input.password);
  if (!ok) return null;

  return {
    id: String((user as any)._id),
    name: user.name,
    email: user.email,
  };
}
