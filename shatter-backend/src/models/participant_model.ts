import { Schema, model, Document } from "mongoose";

export interface IParticipant extends Document {
  participantId: string | null;
  name: string;
  eventId: string;
}

const ParticipantSchema = new Schema<IParticipant>({
  participantId: {
    type: String,
    default: null,
  },

  name: {
    type: String,
    required: true,
  },

  eventId: {
    type: String,
    required: true,
  },
});

export const Participant = model<IParticipant>("Participant", ParticipantSchema);
