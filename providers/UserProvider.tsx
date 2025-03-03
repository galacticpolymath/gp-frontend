/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
import { createContext, useContext, useState } from "react";
import { TUseStateReturnVal } from "../types/global";

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

export interface IAgeGroupsSelection {
  selection: "grades" | "years";
  ageGroupsTaught: string[];
}

export type TAboutUserForm = {
  gradesOrYears: IAgeGroupsSelection;
  country: string;
  occupation: string;
  isTeacherConfirmed: boolean;
  zipCode: number | null;
  classroomSize: { num: number; isNotTeaching: boolean };
  subjects: Map<string, string>;
  reasonsForSiteVisit: Map<string, string>;
  name: { first: string; last: string };
};

export type TUserAccount = Omit<TAboutUserForm, "isTeacherConfirmed"> & {
  isTeacher: boolean;
  isOnMailingList: boolean;
};

export const userAccountDefault: TAboutUserForm = {
  gradesOrYears: {
    selection: "grades",
    ageGroupsTaught: [],
  },
  country: "",
  occupation: "",
  isTeacherConfirmed: false,
  zipCode: null,
  classroomSize: {
    num: 0,
    isNotTeaching: false,
  },
  subjects: new Map(),
  reasonsForSiteVisit: new Map(),
  name: {
    first: "",
    last: "",
  },
};

export type TUserProviderValue = {
  _aboutUserForm: TUseStateReturnVal<TAboutUserForm>;
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
