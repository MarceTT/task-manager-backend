import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  user: mongoose.Types.ObjectId;
  text: string;
  task: mongoose.Types.ObjectId; // Relación con la tarea principal
  timestamp: Date;
}

const CommentSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const CommentModel = mongoose.model<IComment>("Comment", CommentSchema);
