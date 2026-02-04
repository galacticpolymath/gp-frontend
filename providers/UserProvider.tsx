import React, { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import cookies from 'js-cookie';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { IUserSession } from '../types/global';
import { TUseStateReturnVal } from '../types/global';
import {
  TAboutUserForm,
  TUserSchemaForClient,
} from '../backend/models/User/types';

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
  'public',
  'private',
  'homeschool',
  'afterschool',
] as const;
export const SCHOOL_TYPES_SET = new Set(SCHOOL_TYPES);

export type TSchoolType = (typeof SCHOOL_TYPES)[number];

export type TUserAccount = Omit<
  TAboutUserForm<Map<string, string>>,
  'isTeacherConfirmed'
> & {
  isTeacher: boolean;
  isOnMailingList: boolean;
};
export type TAboutUserFormForUI = {
  isTeacherConfirmed: boolean;
} & TAboutUserForm<Map<string, string>> &
  Pick<TUserSchemaForClient, 'isGpPlusMember'>;

export const userAccountDefault: TAboutUserFormForUI = {
  schoolTypeDefaultSelection: null,
  outsetaAccountEmail: '',
  isGpPlusMember: false,
  schoolTypeOther: null,
  siteVisitReasonsCustom: null,
  subjectsTaughtCustom: undefined,
  institution: null,
  gradesOrYears: {
    selection: 'U.S.',
    ageGroupsTaught: [],
  },
  country: '',
  gradesType: 'U.S.',
  occupation: '',
  isTeacherConfirmed: false,
  zipCode: null,
  subjects: new Map(),
  reasonsForSiteVisit: new Map(),
};

export type TUserProviderValue = {
  _aboutUserForm: TUseStateReturnVal<TAboutUserFormForUI>;
  _isUserTeacher: TUseStateReturnVal<boolean>;
  _didAttemptRetrieveUserData: TUseStateReturnVal<boolean>;
  _accountForm: TUseStateReturnVal<TAccountForm>;
  _isGpPlusMember: TUseStateReturnVal<boolean>;
  _willShowGpPlusCopyLessonHelperModal: TUseStateReturnVal<boolean>;
  _isCopyUnitBtnDisabled: TUseStateReturnVal<boolean>;
  _userLatestCopyUnitFolderId: TUseStateReturnVal<string | null>;
};
export interface TAccountForm {
  firstName: string;
  lastName: string;
  isOnMailingList: boolean;
}

export const UserContext = createContext<TUserProviderValue | null>(null);

export const UserProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { data, status } = useSession();
  const sessionData = data as IUserSession | null;
  const authToken = sessionData?.token ?? null;
  const didAttemptGpPlusFetch = useRef(false);
  const [aboutUserForm, setAboutUserForm] = useState(userAccountDefault);
  const [isCopyUnitBtnDisabled, setIsCopyUnitBtnDisabled] = useState(true);
  const [accountForm, setAccountForm] = useState({
    firstName: '',
    lastName: '',
    isOnMailingList: true,
  });
  const [userLatestCopyUnitFolderId, setUserLatestCopyUnitFolderId] = useState<
    string | null
  >(null);
  const [didAttemptRetrieveUserData, setDidAttemptRetrieveUserData] =
    useState(false);
  const [
    willShowGpPlusCopyLessonHelperModal,
    setWillShowGpPlusCopyLessonHelperModal,
  ] = useState(false);
  const [isUserTeacher, setIsUserTeacher] = useState(false);
  const [isGpPlusMember, setIsGpPlusMember] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cookieValue = cookies.get('isGpPlusMember');
    const sessionValue = window.sessionStorage.getItem('isGpPlusUser');
    const resolved =
      cookieValue === 'true' || sessionValue === 'true' ? true : false;
    console.log('[GP+ debug] UserProvider hydrate', {
      cookieValue,
      sessionValue,
      resolved,
    });
    if (resolved !== isGpPlusMember) {
      setIsGpPlusMember(resolved);
    }
  }, [isGpPlusMember]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!authToken) return;
    if (didAttemptGpPlusFetch.current) return;
    const cookieValue = cookies.get('isGpPlusMember');
    const sessionValue = window.sessionStorage.getItem('isGpPlusUser');
    if (cookieValue || sessionValue) return;
    didAttemptGpPlusFetch.current = true;
    axios
      .get('/api/get-user-account-data', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((response) => {
        const isGpPlus = response?.data?.isGpPlusMember;
        console.log('[GP+ debug] get-user-account-data response', response?.data);
        if (typeof isGpPlus === 'boolean') {
          window.sessionStorage.setItem('isGpPlusUser', String(isGpPlus));
          cookies.set('isGpPlusMember', String(isGpPlus), { path: '/' });
          console.log('[GP+ debug] sync isGpPlusMember', isGpPlus);
          setIsGpPlusMember(isGpPlus);
        }
      })
      .catch(() => {
        didAttemptGpPlusFetch.current = false;
      });
  }, [authToken, status]);
  const value: TUserProviderValue = {
    _aboutUserForm: [aboutUserForm, setAboutUserForm],
    _willShowGpPlusCopyLessonHelperModal: [
      willShowGpPlusCopyLessonHelperModal,
      setWillShowGpPlusCopyLessonHelperModal,
    ],
    _isUserTeacher: [isUserTeacher, setIsUserTeacher],
    _accountForm: [accountForm, setAccountForm],
    _isGpPlusMember: [isGpPlusMember, setIsGpPlusMember],
    _isCopyUnitBtnDisabled: [isCopyUnitBtnDisabled, setIsCopyUnitBtnDisabled],
    _didAttemptRetrieveUserData: [
      didAttemptRetrieveUserData,
      setDidAttemptRetrieveUserData,
    ],
    _userLatestCopyUnitFolderId: [
      userLatestCopyUnitFolderId,
      setUserLatestCopyUnitFolderId,
    ],
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('Unable to use ModalContext.');
  }

  return context;
};
