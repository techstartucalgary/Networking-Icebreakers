import { Schema, model, Document } from "mongoose";

export interface IParticipant extends Document {
  userId: Schema.Types.ObjectId | null;
  name: string;
  eventId: Schema.Types.ObjectId;
  linesCompleted: number;
  completed: boolean;
}

const ParticipantSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  name: { type: String, required: true },
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  linesCompleted: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
});

ParticipantSchema.index(
  { eventId: 1, name: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  }
);

export const Participant = model<IParticipant>(
  "Participant",
  ParticipantSchema
);
