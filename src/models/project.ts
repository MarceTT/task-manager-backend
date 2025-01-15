import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  description: string;
  users?: mongoose.Types.ObjectId[]; // Relación con usuarios
  tasks?: mongoose.Types.ObjectId[]; // Relación con tareas
}

const ProjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  },
  { timestamps: true }
);

export const ProjectModel = mongoose.model<IProject>("Project", ProjectSchema);