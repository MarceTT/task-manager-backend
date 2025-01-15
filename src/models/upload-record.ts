import mongoose, { Schema, Document } from "mongoose";

export interface IUploadRecord extends Document {
  userId: mongoose.Types.ObjectId; // Usuario que subió archivos
  date: Date; // Fecha de las subidas (YYYY-MM-DD)
  totalSize: number; // Tamaño acumulado de subidas (en bytes)
}

const UploadRecordSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  totalSize: { type: Number, required: true, default: 0 }, // Bytes
});

export const UploadRecordModel = mongoose.model<IUploadRecord>(
  "UploadRecord",
  UploadRecordSchema
);
