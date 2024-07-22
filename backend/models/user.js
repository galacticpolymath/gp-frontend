import Mongoose from 'mongoose';
const { Schema, models, model } = Mongoose;

let User = models.users;

/**
 * @typedef {Object} PasswordSchema
 * @property {string} hash - The hashed password
 * @property {string} salt - The salt used for hashing
 * @property {number} iterations - The number of iterations used in hashing
 */
const PasswordSchema = new Schema({
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  iterations: { type: Number, required: true },
});
/**
 * @typedef {Object} UserSchema
 * @property {string} _id - The unique identifier for the user
 * @property {string} email - The user's email address
 * @property {string} providerAccountId - The id of the document that contains the access token for the user.
 * @property {PasswordSchema} [password] - The password schema object
 * @property {'google' | 'credentials'} provider - The provider type
 * @property {Date} emailVerified - The date the email was verified
 * @property {string[]} roles - The roles assigned to the user
 * @property {string} picture - The picture of the user
 * @property {{ first: string, last: string }} name - The name of the user.
 */
export const UserSchema = new Schema({
  _id: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: PasswordSchema, required: false },
  // 'google' | 'credentials' 
  provider: String,
  providerAccountId: String,
  emailVerified: { type: Date, required: false },
  name: {
    first: { type: String, required: false },
    last: { type: String, required: false },
  },
  picture: { type: String, required: false },
  occupation: { type: String, required: false },
  roles: { type: [String], required: true },
});

if (!models.users) {
  User = UserSchema;
  User = model('users', User);
}

export default User;