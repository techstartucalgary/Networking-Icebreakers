// Import Schema and model from the Mongoose library.
// - Schema: defines the structure and rules for documents in a collection (like a blueprint).
// - model: creates a model (class) that we use in code to read/write those documents.
import { Schema, model } from "mongoose";

// define TS interface for type safety
// This helps IDE and compiler know what fields exist on a User

export interface IUser {
  name: string;
  email: string;
  passwordHash?: string;
  linkedinId?: string;
  linkedinUrl?: string;
  profilePhoto?: string;
  authProvider: 'local' | 'linkedin';
  lastLogin?: Date;
  passwordChangedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  eventHistoryIds: Schema.Types.ObjectId[];
}

// Create the Mongoose Schema (the database blueprint)

// A Schema tells Mongoose what fields each document should have
// and what rules apply to those fields.
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true, // field is mandatory; Mongoose will throw error if missing
      trim: true, // removes extra space at start and end
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    passwordHash: {
      type: String,
      required: false,
      select: false, // Don't return in queries by default
    },
    linkedinId: {
      type: String,
      unique: true,
      sparse: true, // allows null but enforces uniqueness when set
    },
    linkedinUrl: {
      type: String,
      unique: true,
      sparse: true,
    },
    profilePhoto: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ['local', 'linkedin'],
      default: 'local',
      required: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    eventHistoryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
  },
  {
    // timestamps: true automatically adds two fields to each document:
    // - createdAt: Date when the document was first created
    // - updatedAt: Date when the document was last modified
    timestamps: true,
  }
);

// Ensure local auth users have a password
UserSchema.pre("save", function (next) {
  if (this.authProvider === "local" && !this.passwordHash) {
    return next(new Error("Password required for local authentication"));
  }
  next();
});

// Auto-update passwordChangedAt
UserSchema.pre("save", function (next) {
  if (this.isModified("passwordHash") && !this.isNew) {
    this.passwordChangedAt = new Date();
  }
  next();
});

// create and export mongoose model
// model is simply a wrapper around schema that gives access to MongoDB opeprations

// "User" is the model name
// Mongoose will automatically use "users" as the collection name in MongoDB
export const User = model<IUser>("User", UserSchema);
