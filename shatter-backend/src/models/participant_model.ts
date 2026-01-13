import { Schema, model, Document } from "mongoose";

export interface IParticipant extends Document {
  userId: Schema.Types.ObjectId | null;
  name: string;
  eventId: Schema.Types.ObjectId;
}

const ParticipantSchema = new Schema<IParticipant>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  name: {
    type: String,
    ref: "User Name",
    required: true,
  },

  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
});

export const Participant = model<IParticipant>(
  "Participant",
  ParticipantSchema
);
