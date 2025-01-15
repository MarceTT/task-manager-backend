import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  user?: mongoose.Types.ObjectId; // Notificación dirigida a un usuario
  teamId?: mongoose.Types.ObjectId; // Notificación dirigida a un equipo
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
