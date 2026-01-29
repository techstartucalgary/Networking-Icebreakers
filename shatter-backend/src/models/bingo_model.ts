import { Schema, model, Types, Document } from "mongoose";


export interface BingoDocument extends Document {
  _id: string;
  _eventId: Types.ObjectId;
  description?: string;
  grid?: string[][];
}

const bingoSchema = new Schema<BingoDocument>(
  {
    _id: { type: String },
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

bingoSchema.pre("save", function (next) {
  if (!this._id) {
    this._id = `bingo_${Math.random().toString(36).slice(2, 10)}`;
  }
  next();
});

export const Bingo = model<BingoDocument>("Bingo", bingoSchema);
