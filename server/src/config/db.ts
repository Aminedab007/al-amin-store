// server/src/config/db.ts
import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDb() {
  const uri = String((env as any).MONGO_URI ?? process.env.MONGO_URI ?? "").trim();

  if (!uri) {
    throw new Error("Missing env var: MONGO_URI");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    autoIndex: env.NODE_ENV !== "production",
  });

  console.log("✅ MongoDB connected");
}
