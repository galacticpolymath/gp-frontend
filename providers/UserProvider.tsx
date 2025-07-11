/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
import { createContext, useContext, useState } from "react";
import { TUseStateReturnVal } from "../types/global";
import {
  IAgeGroupsSelection,
  TAboutUserForm,
} from "../backend/models/User/types";

/**
 * @typedef {Object} TGradesOrYears
 * @property {"U.S." | "Outside U.S."} selection
 * @property {string[]} ageGroupsTaught
 */

/**
 * @typedef {Object} TSubjectsAndReasonsForVisitMap
 * @property {Map<string, string>} subjects
 * @property {Map<string, string>} reasonsForSiteVisit
 */

/**
 * @typedef {Object} TSubjectsAndReasonsForVisitObjs
 * @property {{ [key: string]: string }} subjects
 * @property {{ [key: string]: string }} reasonsForSiteVisit
 */

export const SCHOOL_TYPES = [
  "public",
  "private",
  "homeschool",
  "afterschool",
] as const;
export const SCHOOL_TYPES_SET = new Set(SCHOOL_TYPES);

export type TSchoolType = (typeof SCHOOL_TYPES)[number];

export type TUserAccount = Omit<
  TAboutUserForm<Map<string, string>>,
  "isTeacherConfirmed"
> & {
  isTeacher: boolean;
  isOnMailingList: boolean;
};
export type TAboutUserFormForUI = {
  isTeacherConfirmed: boolean;
} & TAboutUserForm<Map<string, string>>;

export const userAccountDefault: TAboutUserFormForUI = {
  schoolTypeDefaultSelection: null,
  schoolTypeOther: null,
  siteVisitReasonsCustom: null,
  subjectsTaughtCustom: undefined,
  institution: null,
  gradesOrYears: {
    selection: "U.S.",
    ageGroupsTaught: [],
  },
  country: "",
  gradesType: "U.S.",
  occupation: "",
  isTeacherConfirmed: false,
  zipCode: null,
  subjects: new Map(),
  reasonsForSiteVisit: new Map(),
  firstName: "",
  lastName: "",
};

export type TUserProviderValue = {
  _aboutUserForm: TUseStateReturnVal<TAboutUserFormForUI>;
  _isUserTeacher: TUseStateReturnVal<boolean>;
  _accountForm: TUseStateReturnVal<TAccountForm>;
};
export interface TAccountForm {
  firstName: string;
  lastName: string;
  isOnMailingList: boolean;
}

export const UserContext = createContext<TUserProviderValue | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [aboutUserForm, setAboutUserForm] = useState(userAccountDefault);
  const [accountForm, setAccountForm] = useState({
    firstName: "",
    lastName: "",
    isOnMailingList: true,
  });
  const [isUserTeacher, setIsUserTeacher] = useState(false);
  const value: TUserProviderValue = {
    _aboutUserForm: [aboutUserForm, setAboutUserForm],
    _isUserTeacher: [isUserTeacher, setIsUserTeacher],
    _accountForm: [accountForm, setAccountForm],
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("Unable to use ModalContext.");
  }

  return context;
};
