import mongoose, { Schema, Document } from "mongoose";

export interface ITeam extends Document {
  name: string;
  members: mongoose.Types.ObjectId[]; // Lista de usuarios
}

const TeamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export const TeamModel = mongoose.model<ITeam>("Team", TeamSchema);
