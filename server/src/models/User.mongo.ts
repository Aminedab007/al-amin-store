// server/src/models/User.mongo.ts
import mongoose, { Schema } from "mongoose";

export type UserDoc = {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

const UserSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const UserModel = mongoose.models.User || mongoose.model<UserDoc>("User", UserSchema);
