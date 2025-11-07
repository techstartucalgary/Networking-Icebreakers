// Import Schema and model from the Mongoose library.
// - Schema: defines the structure and rules for documents in a collection (like a blueprint).
// - model: creates a model (class) that we use in code to read/write those documents.
import { Schema, model } from 'mongoose';

// define TS interface for type safety
// This helps IDE and compiler know what fields exist on a User

export interface IUser {
    name: string;
    email: string;
    password: string;
}

// Create the Mongoose Schema (the database blueprint)

// A Schema tells Mongoose what fields each document should have
// and what rules apply to those fields.
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,  // field is mandatory; Mongoose will throw error if missing
      trim: true       // removes extra space at start and end
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,  // converts all emails to lowercase before saving for consistency
      unique: true      // enforce uniqueness, error 11000 if duplicate is detected
    },
    password: {
      type: String,
      required: true,
      select: false // exclude password field by default when querying users for security
    }
  },
  {
    // timestamps: true automatically adds two fields to each document:
    // - createdAt: Date when the document was first created
    // - updatedAt: Date when the document was last modified
    timestamps: true
  }
);


// create and export mongoose model
// model is simply a wrapper around schema that gives access to MongoDB opeprations

// "User" is the model name
// Mongoose will automatically use "users" as the collection name in MongoDB
export const User = model<IUser>('User', UserSchema);
