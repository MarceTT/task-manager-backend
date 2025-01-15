import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string; // Nombre del rol (e.g., "Manager", "Team Lead")
  permissions: string[]; // Lista de permisos (e.g., ["createTask", "viewEvidence"])
}

const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String }],
});

export const RoleModel = mongoose.model<IRole>("Role", RoleSchema);
