import { Schema, model, Types, HydratedDocument } from "mongoose";

export interface BingoTile {
  question: string;
  shortQuestion: string;
}

export interface IBingo {
  _id: string;
  _eventId: Types.ObjectId;
  description?: string;
  grid?: BingoTile[][];
}

export type BingoDocument = HydratedDocument<IBingo>;

const bingoSchema = new Schema<IBingo>(
  {
    _id: { type: String },
    _eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    description: { type: String },
    grid: {
      type: [[{
        question: { type: String, required: true },
        shortQuestion: { type: String, required: true },
      }]],
    },
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

export const Bingo = model<IBingo>("Bingo", bingoSchema);