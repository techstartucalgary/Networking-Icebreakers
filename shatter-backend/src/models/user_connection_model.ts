import { Schema, model, Types, Document } from "mongoose";


export interface UserConnection extends Document {
    _id: string;
    _eventId: Types.ObjectId;
    primaryUserId: Types.ObjectId;
    secondaryUserId: Types.ObjectId;
    description?: string;

  
}

const userConnectionSchema = new Schema<UserConnection>(
    {

        _id: { type: String },
        _eventId: { 
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },
        primaryUserId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        secondaryUserId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        description: { type: String },
    },
    {
        versionKey: false,
    }
);

userConnectionSchema.pre("save", function (next) {
  if (!this._id) {
    this._id = `userConnection_${Math.random().toString(36).slice(2, 10)}`;
  }
  next();
});

export const UserConnection = model<UserConnection>("UserConnection", userConnectionSchema);
