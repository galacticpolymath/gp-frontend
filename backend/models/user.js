 
import Mongoose from "mongoose";

class StringValidator {
  constructor(message) {
    this.validate = (val) => {
      if (typeof val !== "string" || val.length === 0) {
        return false;
      }

      return true;
    };

    this.message = message;
  }
}

const { Schema, models, model } = Mongoose;
/**
 * @deprecated This schema is no longer being used. Please use the new schema in `./index.ts`.
 */
let User = models.users;

/**
 * @typedef {Object} PasswordSchema
 * @property {string} hash - The hashed password
 * @property {string} salt - The salt used for hashing
 * @property {number} iterations - The number of iterations used in hashing
 */

/**
 * @global
 * @typedef {Object} TUserSchema
 * @property {string} _id - The unique identifier for the user
 * @property {string} email - The user's email address
 * @property {string} [occupation] - The user's occupation
 * @property {string} [providerAccountId] - The id of the document that contains the access token for the user.
 * @property {PasswordSchema} [password] - The password schema object
 * @property {'google' | 'credentials'} provider - The provider type
 * @property {Date} emailVerified - The date the email was verified
 * @property {string[]} roles - The roles assigned to the user
 * @property {string} [picture] - The picture of the user
 * @property {string} [mailingListConfirmationEmailId] - The picture of the user
 * @property {{ first: string, last: string }} name - The name of the user.
 */
export const UserSchema = new Schema(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true },
    mailingListConfirmationEmailId: { type: String, required: false },
    password: {
      hash: { type: String, required: false },
      salt: { type: String, required: false },
      iterations: { type: Number, required: false },
    },
    provider: String,
    isTeacher: { type: Boolean, required: true, default: () => false },
    providerAccountId: String,
    emailVerified: { type: Date, required: false },
    name: {
      first: {
        type: String,
        required: false,
        validator: new StringValidator(
          "First name is required and must be a string."
        ),
      },
      last: {
        type: String,
        required: false,
        validator: new StringValidator(
          "Last name is required and must be a string."
        ),
      },
    },
    picture: { type: String, required: false },
    occupation: { type: String, required: false },
    country: { type: String, required: false },
    zipCode: { type: String, required: false },
    gradesOrYears: {
      ageGroupsTaught: [String],
      selection: String,
    },
    reasonsForSiteVisit: { type: Object, required: false },
    subjects: { type: Object, required: false },
    classroomSize: {
      num: { type: Number, required: false, default: () => 0 },
      isNotTeaching: { type: Boolean, required: false, default: () => false },
    },
    roles: { type: [String], required: true },
    totalSignIns: { type: Number, required: false, default: () => 0 },
    lastSignIn: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

if (!models.users) {
  User = UserSchema;
  User = model("users", User);
}

export default User;
