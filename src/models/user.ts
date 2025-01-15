import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { IRole } from "./role";

// Interfaz para el documento de usuario
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "user" | "admin" | "superadmin" | "manager";
  refreshToken: [string];
  profilePicture?: string;
  isEnable: boolean;
  isVerified: boolean;
  verificationToken?: string;
  verificationDeadline?: Date;
  reminderTime: number;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

// Definición del esquema de usuario
const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Normaliza el email
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["superadmin", "admin", "manager", "user"],
      default: "user",
    },
    refreshToken: { type: [String], default: [] },
    profilePicture: { type: String },
    isEnable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    reminderTime: { type: Number, default: 60 }, // Por defecto 60 minutos
    verificationToken: { type: String },
    verificationDeadline: { type: Date },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);



// Modelo de usuario
export const UserModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);

// Métodos de acceso
export const getUsers = () => UserModel.find().exec();
export const getUserByEmail = (email: string) =>
  UserModel.findOne({ email }).exec();
export const getUserById = (id: string) => UserModel.findById(id).exec();
export const createUser = (values: Record<string, any>) =>
  new UserModel(values).save().then((user) => user.toObject());
