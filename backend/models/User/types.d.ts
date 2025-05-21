import { SUBJECTS_OPTIONS } from "../../../components/User/AboutUser/AboutUserModal";
import { TSchoolType } from "../../../providers/UserProvider";
import { TReferredByOpt } from "../../../types/global";

export type TAgeGroupSelection = "U.S." | "Outside U.S.";

export interface IAgeGroupsSelection {
  selection: TAgeGroupSelection | null;
  ageGroupsTaught: string[];
}

export type TDefaultSubject = Exclude<(typeof SUBJECTS_OPTIONS)[number], "other:">;

interface IAboutUserFormNewFieldsV1{
  gradesType?: IAgeGroupsSelection["selection"];
  gradesTaught?: string[];
  firstName?: string;
  lastName?: string;
  subjectsTaughtDefault?: TDefaultSubject[];
  subjectsTaughtCustom?: string[];
  classSize?: number;
  institution: string | null;
  isNotTeaching?: boolean;
  schoolTypeDefaultSelection: TSchoolType | null;
  schoolTypeOther: string | null;
  referredByDefault?: TReferredByOpt | null,
  referredByOther?: string | null,
}

export interface TAboutUserForm<TMutableObj extends object = Record<string, unknown>> extends IAboutUserFormNewFieldsV1 {
  /**
   * @deprecated
   * Use `gradesType` and `gradesTaught` instead
   */
  gradesOrYears: IAgeGroupsSelection;
  country: string;
  occupation: string;
  zipCode: string | null | number;
  isTeacher?: boolean;
  /**
   * @deprecated
   * Use `firstName` and `lastName` instead
   */
  name: {
    first: string;
    last: string;
  };
  /**
   * @deprecated Use `siteVisitReasonsDefault` and `siteVisitReasonsCustom` instead
   */
  reasonsForSiteVisit?: TMutableObj;
  siteVisitReasonsDefault?: string[] | null;
  siteVisitReasonsCustom?: string | null;
  /**
   * @deprecated
   * Use `subjectsTaughtDefault` and `subjectsTaughtCustom` instead
   */
  subjects?: TMutableObj;
  /**
   * @deprecated
   * Use `classSize: number` and `isNotTeaching: boolean` instead
   */
  classroomSize: {
    num: number;
    isNotTeaching: boolean;
  };
}

export interface IUserSchema extends TAboutUserForm {
  _id: string;
  email: string;
  mailingListConfirmationEmailId?: string;
  password?: {
    hash: string;
    salt: string;
    iterations: number;
  };
  provider: string;
  isTeacher: boolean;
  providerAccountId?: string;
  emailVerified?: Date;
  picture?: string;
  occupation?: string;
  country?: string;
  roles: string[];
  totalSignIns: number;
  lastSignIn?: Date;
}


export type TUserSchemaForClient = IUserSchema & { isOnMailingList?: boolean };