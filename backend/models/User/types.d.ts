import { SUBJECTS_OPTIONS } from "../../../components/User/AboutUser/AboutUserModal";
import { TSchoolType, TUserAccount } from "../../../providers/UserProvider";
import { TReferredByOpt } from "../../../types/global";
import {
  getBillingType,
  getGpPlusMembership,
} from "../../services/outsetaServices";
import {
  TAccountStageLabel,
  TGpPlusMembershipRetrieved,
} from "../../services/userServices";
import { TAboutUserFormDeprecated } from "./deprecated";

export type TAgeGroupSelection = "U.S." | "Outside U.S.";

export interface IAgeGroupsSelection {
  selection: TAgeGroupSelection | null;
  ageGroupsTaught: string[];
}

export type TDefaultSubject = Exclude<
  (typeof SUBJECTS_OPTIONS)[number],
  "other:"
>;

interface IAboutUserFormNewFieldsV1 {
  gradesType?: IAgeGroupsSelection["selection"];
  gradesTaught?: string[];
  firstName?: string;
  lastName?: string;
  subjectsTaughtDefault?: TDefaultSubject[];
  subjectsTaughtCustom?: string[];
  classSize?: number;
  institution?: string | null;
  isNotTeaching?: boolean;
  schoolTypeDefaultSelection?: TSchoolType | null;
  schoolTypeOther?: string | null;
  referredByDefault?: TReferredByOpt | null;
  referredByOther?: string | null;
  siteVisitReasonsDefault?: string[] | null;
  siteVisitReasonsCustom?: string | null;
}

export interface TAboutUserFormBaseProps extends IAboutUserFormNewFieldsV1 {
  country?: string;
  occupation?: string;
  zipCode?: string | null | number;
  isTeacher?: boolean;
}

export interface TAboutUserForm<
  TMutableObj extends object = Record<string, unknown>
> extends TAboutUserFormDeprecated<TMutableObj>,
    TAboutUserFormBaseProps,
    TOutseta {}

export interface IUserSchemaBaseProps {
  _id: string;
  email: string;
  mailingListConfirmationEmailId?: string;
  password?: {
    hash: string;
    salt: string;
    iterations: number;
  };
  provider: string;
  providerAccountId?: string;
  emailVerified?: Date;
  picture?: string;
  roles: string[];
  totalSignIns: number;
  lastSignIn?: Date;
}

// user schema v1, has the deprecated fields and the v2 fields
export interface IUserSchema extends TAboutUserForm, IUserSchemaBaseProps {}

export type TOutseta = {
  outsetaAccountEmail?: string;
};

export interface ILessonGDriveId {
  lessonNum: string;
  lessonDriveId: string;
  lessonSharedGDriveFolderId: string;
  gradesRange: string
}

export interface IUnitGDriveLesson {
  unitId: string;
  unitDriveId: string;
  lessonDriveIds?: ILessonGDriveId[];
}

export type TUserSchemaV2 = IUserSchemaBaseProps &
  TAboutUserFormBaseProps &
  TOutseta & {
    gpPlusDriveFolderId: string;
    unitGDriveLessons: IUnitGDriveLesson[];
    gdriveAuthEmails: string[]
  };

type TGpPlusMembershipStatus = Awaited<ReturnType<typeof getGpPlusMembership>>;

export type TGpPlusSubscriptionForClient = Omit<
  Awaited<ReturnType<typeof getGpPlusMembership>>,
  "BillingRenewalTerm" | "AccountStageLabel" | "Account" | "email"
> & {
  BillingRenewalTerm?: ReturnType<typeof getBillingType>[0];
  AccountStageLabel: TAccountStageLabel;
};
export type TUserClientProps = {
  isOnMailingList?: boolean;
  isGpPlusMember?: boolean;
  gpPlusSubscription?: TGpPlusMembershipStatus;
  viewingUnitFolderCopyId?: string;
};
export type TUserSchemaForClient<TUserSchema extends object = TUserSchemaV2> =
  TUserSchema & TUserClientProps & Pick<TUserAccount, "isOnMailingList">;
