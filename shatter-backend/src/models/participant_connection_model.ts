import { Schema, model, Types, Document } from "mongoose";

export interface ParticipantConnection {
  _id: Types.ObjectId;
  _eventId: Types.ObjectId;
  primaryParticipantId: Types.ObjectId;
  secondaryParticipantId: Types.ObjectId;
  description?: string;
}

const participantConnectionSchema = new Schema<ParticipantConnection>(
  {
    _id: { type: Schema.Types.ObjectId },
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
    this._id = new Types.ObjectId();
  }
  next();
});

export const ParticipantConnection = model<ParticipantConnection>(
  "ParticipantConnection",
  participantConnectionSchema
);