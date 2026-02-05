import { Schema, model, Types, Document } from "mongoose";


export interface BingoDocument extends Document {
  _id: string;
  _eventId: Types.ObjectId;
  description?: string;
  grid?: string[][];
}

const bingoSchema = new Schema<BingoDocument>(
  {
    _eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    description: { type: String },
    grid: { type: [[String]] },
  },
  {
    versionKey: false,
  }
);

export const Bingo = model<BingoDocument>("Bingo", bingoSchema);
