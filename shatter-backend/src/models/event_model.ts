import mongoose, { Schema, model, Document, Types } from "mongoose";
import {User} from "../models/user_model";

import { IParticipant } from "./participant_model";

export interface IEvent extends Document {
  eventId: string;
  name: string;
  description: string;
  joinCode: string;
  startDate: Date;
  endDate: Date;
  maxParticipant: number;
  participants: mongoose.Types.DocumentArray<IParticipant>;
  currentState: string;
  createdBy: string;
}

const EventSchema = new Schema<IEvent>(
  {
    eventId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    joinCode: { type: String, required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxParticipant: { type: Number, required: true },    
    participants: [{ type: Types.ObjectId, ref: "Participant" }],
    currentState: { type: String, required: true },
    createdBy: { 
      type: String, 
      required: true,
      validate: {
        validator: async function (email: string) {
          const user = await User.findOne({ email });
          return !!user; // true if user exists
        },
        message: "User with this email does not exist"
      }
    }
  },
  {
    timestamps: true,
  }
);

// Optional validation: ensure endDate is after startDate
EventSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("endDate must be after startDate"));
  } else {
    next();
  }
});

export const Event = model<IEvent>("Event", EventSchema);
