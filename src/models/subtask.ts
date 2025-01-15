import mongoose, { Schema, Document } from "mongoose";

export interface IEvidence {
  _id: mongoose.Types.ObjectId;
  url: string; // Ruta o URL del archivo
  //versionHistory: { url: string; versionId: string; timestamp: Date }[]; // Historial de versiones
  type: "image" | "file"; // Tipo de evidencia
  uploadedAt: Date; // Fecha de subida
}

export interface ISubtask extends Document {
  title: string;
  isCompleted: boolean;
  task: mongoose.Types.ObjectId; // Relación con la tarea principal
  evidences: IEvidence[]; // Evidencias de la subtarea
}

const EvidenceSchema = new Schema({
  url: { type: String, required: true }, // Ruta o URL del archivo
  type: { type: String, enum: ["image", "file"], required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const SubtaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    evidences: [EvidenceSchema],
  },
  { timestamps: true }
);

export const SubtaskModel = mongoose.model<ISubtask>("Subtask", SubtaskSchema);
