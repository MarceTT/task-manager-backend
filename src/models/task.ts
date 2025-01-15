import mongoose, { Schema, Document } from "mongoose";


export interface IEvidence {
  _id: mongoose.Types.ObjectId;
  url: string; // Ruta o URL del archivo
  //versionHistory: { url: string; versionId: string; timestamp: Date }[]; // Historial de versiones
  type: "image" | "file"; // Tipo de evidencia
  uploadedAt: Date; // Fecha de subida
}

export interface ITask extends Document {
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  category?: string;
  assignedTo?: mongoose.Types.ObjectId | {
    _id: mongoose.Types.ObjectId;
    email: string;
    firstName: string;
    lastName: string;
    reminderTime: number;
  };
  project?: mongoose.Types.ObjectId;
  dueDate?: Date;
  percent?: number;
  evidences: IEvidence[];
}

const EvidenceSchema = new Schema({
  url: { type: String, required: true }, // Ruta o URL del archivo
  type: { type: String, enum: ["image", "file"], required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    category: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    dueDate: { type: Date },
    percent: { type: Number, default: 0 },
    evidences: [EvidenceSchema],
  },
  { timestamps: true }
);

export const TaskModel = mongoose.model<ITask>("Task", TaskSchema);
