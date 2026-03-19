import { Schema, model } from 'mongoose';

export interface IAuthCode {
  code: string;
  userId: Schema.Types.ObjectId;
  createdAt: Date;
}

const AuthCodeSchema = new Schema<IAuthCode>({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60, // TTL: auto-deletes after 60 seconds
  },
});

export const AuthCode = model<IAuthCode>('AuthCode', AuthCodeSchema);
