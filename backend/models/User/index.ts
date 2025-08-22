/* eslint-disable quotes */
import Mongoose from "mongoose";
import { ILessonGDriveId, IUnitGDriveLesson, IUserSchema, TUserSchemaV2 } from "./types";

class StringValidator {
  validate: (val: string) => boolean;
  message: string;

  constructor(message: string) {
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
let User = models.users;

export const UserSchemaDeprecatedV1 = new Schema<IUserSchema>(
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
    name: {
      first: {  type: String, required: false },
      last: { type: String, required: false },
    },
    emailVerified: { type: Date, required: false },
    firstName: {
        type: String,
        required: false,
        validator: new StringValidator(
          "First name is required and must be a string."
        ),
      },
    lastName: {
        type: String,
        required: false,
        validator: new StringValidator(
          "Last name is required and must be a string."
        ),
      },
    picture: { type: String, required: false },
    occupation: { type: String, required: false },
    country: { type: String, required: false },
    zipCode: { type: String, required: false },
    gradesOrYears: {
      ageGroupsTaught: [String],
      selection: String,
    },
    institution: String,
    gradesType: String, 
    gradesTaught: [String], 
    schoolTypeOther: String,
    schoolTypeDefaultSelection: String,
    referredByDefault: String,
    referredByOther: String,
    subjectsTaughtDefault: [String],
    subjectsTaughtCustom: [String],
    classSize: Number,
    isNotTeaching: Boolean,
    reasonsForSiteVisit: Object,
    siteVisitReasonsDefault: [String],
    siteVisitReasonsCustom: String,
    subjects: Object,
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

const LessonGDriveId = new Schema<ILessonGDriveId>({
    lessonNum: String,
    lessonDriveId: String,
  }, {
  _id: false
});
const UnitGDriveLessons = new Schema<IUnitGDriveLesson>({
  unitDriveId: String,
  unitId: String,
  lessonDriveIds: [LessonGDriveId]
}, {
  _id: false
});

export const UserSchema = new Schema<TUserSchemaV2>(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    outsetaAccountEmail: { type: String, unique: true },
    mailingListConfirmationEmailId: { type: String, required: false },
    password: {
      hash: { type: String, required: false },
      salt: { type: String, required: false },
      iterations: { type: Number, required: false },
    },
    provider: String,
    gpPlusDriveFolderId: String,
    unitGDriveLessons: [UnitGDriveLessons],
    isTeacher: { type: Boolean, required: true, default: () => false },
    providerAccountId: String,
    emailVerified: { type: Date, required: false },
    firstName: {
        type: String,
        required: false,
        validator: new StringValidator(
          "First name is required and must be a string."
        ),
      },
    lastName: {
        type: String,
        required: false,
        validator: new StringValidator(
          "Last name is required and must be a string."
        ),
      },
    picture: { type: String, required: false },
    occupation: { type: String, required: false },
    country: { type: String, required: false },
    zipCode: { type: String, required: false },
    institution: String,
    gradesType: String, 
    gradesTaught: [String], 
    schoolTypeOther: String,
    schoolTypeDefaultSelection: String,
    referredByDefault: String,
    referredByOther: String,
    subjectsTaughtDefault: [String],
    subjectsTaughtCustom: [String],
    classSize: Number,
    isNotTeaching: Boolean,
    siteVisitReasonsDefault: [String],
    siteVisitReasonsCustom: String,
    roles: { type: [String], required: true },
    totalSignIns: { type: Number, required: false, default: () => 0 },
    lastSignIn: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

if (!models.users) {
  User = model("users", UserSchema);
}

export default User;
