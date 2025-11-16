import { Schema, model, Types } from 'mongoose';

// interface that defines what fields an authentication model should have
// ? means optional
// Types.ObjectId is MongoDB's special ID type
export interface IAuth {
    userID: Types.ObjectId;  // reference to userID in users collection
    email: string;
    passwordHash: string; // this is the hash (NOT plain text)
    createdAt?: Date;
    updatedAt?: Date;
    lastLogin?: Date;
    passwordChangedAt?: Date;  // track when password was last changed
}

// Schema that defines structure and validation rules
const AuthSchema = new Schema<IAuth>(
    {
	userID: {
	    type: Schema.Types.ObjectId,
	    // create relationship between collections
	    ref: 'User',       		// references the user model
	    required: true,
	    index: true, 		// index for faster lookup
	    unique: true                // one auth doc per user
	},
	email: {
	    type: String,
	    required: true,
	    unique: true,
	    lowercase: true,
	    trim: true,
	    index: true,
	    match: [                  // email format validation
		/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
		'Please provide a valid email address'
	    ]
	},
	passwordHash: {
	    type: String,
	    required: true,
	    select: false,      // Don't include in queries (for security)
	},
	lastLogin: {
	    type: Date,
	    default: null
	},
	passwordChangedAt: {
	    type: Date,
	    default: null
	}
    },
    {
	timestamps: true     // automatically adds createdAt and updatedAt
    }
);

// add some middleware to autoupdate passwordChangedAt when password actually changes
// this will be used later on to invalidate old JWT tokens
//
// pre(save) runs before document is saved to DB
AuthSchema.pre('save', function (next) {
    // only update if passwordHash was modified (not on creation)
    if (this.isModified('passwordHash') && !this.isNew) {
	this.passwordChangedAt = new Date();
    }
    // continue with the next operation
    next();
});

// create and export the Authentication model
// this will be used to interact with authenticaion collection
export const Auth = model<IAuth>('Auth', AuthSchema);
