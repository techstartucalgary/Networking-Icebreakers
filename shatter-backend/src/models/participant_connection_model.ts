import { Schema, model, Types, Document } from "mongoose";

export interface ParticipantConnection extends Document {
  _id: string;
  _eventId: Types.ObjectId;
  primaryParticipantId: Types.ObjectId;
  secondaryParticipantId: Types.ObjectId;
  description?: string;
}

const participantConnectionSchema = new Schema<ParticipantConnection>(
  {
    _id: { type: String },
    _eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    primaryParticipantId: {
      type: Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
    },
    secondaryParticipantId: {
      type: Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
    },
    description: { type: String },
  },
  {
    versionKey: false,
  }
);

participantConnectionSchema.pre("save", function (next) {
  if (!this._id) {
    this._id = `participantConnection_${Math.random().toString(36).slice(2, 10)}`;
  }
  next();
});

export const ParticipantConnection = model<ParticipantConnection>(
  "ParticipantConnection",
  participantConnectionSchema
);