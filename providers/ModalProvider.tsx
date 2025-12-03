import React, {
  createContext,
  CSSProperties,
  PropsWithChildren,
  ReactNode,
  RefObject,
  useContext,
  useState,
} from "react";
import { IItemForClient, TUseStateReturnVal } from "../types/global";

export const ModalContext = createContext<IModalProviderValue | null>(null);

interface IModal {
  handleOnHide?: () => void;
  isDisplayed: boolean;
}

export interface INotifyModalVal extends IModal {
  isDisplayed: boolean;
  bodyTxt: string | ReactNode;
  headerTxt: string;
  closeBtnTxt?: string;
}

export type TUserEmailNewLetterStatus = "double-opt-sent" | "not-on-list";

export interface IEmailNewsletterSignUpModal extends IModal {
  userEmailNewsLetterStatus?: TUserEmailNewLetterStatus;
}

export const defautlNotifyModalVal: INotifyModalVal = {
  isDisplayed: false,
  bodyTxt: "",
  headerTxt: "",
  handleOnHide: () => {},
};

export interface ILessonItem extends IItemForClient {
  docUrl: string;
  externalUrl: string;
}
export interface ILessonItemsModal {
  lessonItems: ILessonItem[];
  currentIndex: number;
  isDisplayed: boolean;
  lessonId: string | null;
  userGDriveLessonFolderId?: string;
  copyLessonBtnRef: RefObject<HTMLButtonElement | null> | null;
}

type TEmailNewsletterSignUpModal = IEmailNewsletterSignUpModal;

export interface IModalProviderValue {
  _customModalFooter: TUseStateReturnVal<null | ReactNode>;
  _isAccountModalMobileOn: TUseStateReturnVal<boolean>;
  _isPasswordResetModalOn: TUseStateReturnVal<boolean>;
  _selectedJob: TUseStateReturnVal<null | ISelectedJob>;
  _isJobModalOn: TUseStateReturnVal<boolean>;
  _isDownloadModalInfoOn: TUseStateReturnVal<boolean>;
  _isLoginModalDisplayed: TUseStateReturnVal<boolean>;
  _isCreateAccountModalDisplayed: TUseStateReturnVal<boolean>;
  _isAboutMeFormModalDisplayed: TUseStateReturnVal<boolean>;
  _notifyModal: TUseStateReturnVal<INotifyModalVal>;
  _isCreatingGpPlusAccount: TUseStateReturnVal<boolean>;
  _isAccountSettingModalOn: TUseStateReturnVal<boolean>;
  _isFailedCopiedFilesReportModalOn: TUseStateReturnVal<boolean>;
  _isGpPlusModalDisplayed: TUseStateReturnVal<boolean>;
  _isThankYouModalDisplayed: TUseStateReturnVal<boolean>;
  _isGpPlusSignUpModalDisplayed: TUseStateReturnVal<boolean>;
  _isCopyLessonHelperModalDisplayed: TUseStateReturnVal<boolean>;
  _lessonItemModal: TUseStateReturnVal<ILessonItemsModal>;
  _jobToursModalCssProps: TUseStateReturnVal<CSSProperties>;
  _emailNewsletterSignUpModal: TUseStateReturnVal<TEmailNewsletterSignUpModal>;
}

type TSelectedJobModal = Partial<{
  zIndex: number;
}>;

export interface ISelectedJob extends TSelectedJobModal {
  id: number;
  wasSelectedFromJobToursCard?: boolean;
  title: string;
  soc_code: string;
  occupation_type: string;
  hierarchy: number;
  level1: string | null;
  level2: string | null;
  level3: string | null;
  level4: string | null;
  path: string;
  employment_start_yr: number;
  employment_end_yr: number;
  employment_perc_of_tot_start: number;
  employment_perc_of_tot_end: number;
  employment_change_numeric: number;
  employment_change_percent: number;
  median_annual_wage: number | null;
  typical_education_needed_for_entry: string;
  work_experience_in_a_related_occupation: string;
  "typical_on-the-job_training_needed_to_attain_competency_in_the_occupation": string;
  BLS_link: string;
  soc_title: string;
  def: string;
  percent_employment_change_col: string;
  median_wage_col: string;
  /**@deprecated Use `employment_start_yr` instead */
  employment_2021: number;
  /**@deprecated Use `employment_end_yr` instead */
  employment_2031: number;
  /**@deprecated Use `median_annual_wage` instead */
  median_annual_wage_2021: number;
  /**@deprecated Use `employment_change_numeric` instead */
  "percent_employment_change_2021-31": number;
}

export interface ISelectedJobDeprecatedProps {
  id: number;
  title: string;
  soc_code: string;
  occupation_type: string;
  hierarchy: number;
  level1: string | null;
  path: string;
  employment_2021: number;
  employment_2031: number;
  employment_change_2021_31: number;
  percent_employment_change_2021_31: number;
  percent_self_employed_2021: number;
  occupational_openings_2021_31_annual_average: number;
  median_annual_wage_2021: string;
  typical_education_needed_for_entry: string;
  work_experience_in_a_related_occupation: string;
  typical_on_the_job_training_needed_to_attain_competency_in_the_occupation: string;
  soc_title: string;
  def: string;
  median_wage_col: string;
  percent_employment_change_col: string;
}

export const ModalProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [selectedJob, setSelectedJob] = useState<ISelectedJob | null>(null);
  const [isJobModalOn, setIsJobModalOn] = useState(false);
  const [emailNewsletterSignUpModal, setEmailNewsletterSignUpModal] =
    useState<TEmailNewsletterSignUpModal>({
      isDisplayed: false,
    });
  const [isCreatingGpPlusAccount, setIsCreatingGpPlusAccount] = useState(false);
  const [isDownloadModalInfoOn, setIsDownloadModalInfoOn] = useState(false);
  const [isLoginModalDisplayed, setIsLoginModalDisplayed] = useState(false);
  const [isGpPlusModalDisplayed, setIsGpPlusModalDisplayed] = useState(false);
  const [jobToursModalCssProps, setJobToursModalCssProps] =
    useState<CSSProperties>({
      zIndex: 10000,
    });
  const [
    isCopyLessonHelperModalDisplayed,
    setIsCopyLessonHelperModalDisplayed,
  ] = useState(false);
  const [isThankYouModalDisplayed, setIsThankYouModalDisplayed] =
    useState(false);
  const [notifyModal, setNotifyModal] = useState(defautlNotifyModalVal);
  const [isCreateAccountModalDisplayed, setIsCreateAccountModalDisplayed] =
    useState(false);
  const [isAboutMeFormModalDisplayed, setIsAboutMeFormModalDisplayed] =
    useState(false);
  const [isAccountModalMobileOn, setIsAccountModalMobileOn] = useState(false);
  const [isPasswordResetModalOn, setIsPasswordResetModalOn] = useState(false);
  const [isGpPlusSignUpModalDisplayed, setIsGpPlusSignUpModalDisplayed] =
    useState(false);
  const [lessonItemModal, setLessonItemModal] = useState<ILessonItemsModal>({
    currentIndex: 0,
    lessonItems: [],
    isDisplayed: false,
    copyLessonBtnRef: null,
    lessonId: null,
  });
  const [
    isFailedCopiedFilesReportModalOn,
    setIsFailedCopiedFilesReportModalOn,
  ] = useState(false);
  const [isAccountSettingModalOn, setIsAccountSettingsModalOn] =
    useState(false);
  const [customModalFooter, setCustomModalFooter] = useState<null | ReactNode>(
    null
  );
  const value: IModalProviderValue = {
    _jobToursModalCssProps: [jobToursModalCssProps, setJobToursModalCssProps],
    _emailNewsletterSignUpModal: [
      emailNewsletterSignUpModal,
      setEmailNewsletterSignUpModal,
    ],
    _isCopyLessonHelperModalDisplayed: [
      isCopyLessonHelperModalDisplayed,
      setIsCopyLessonHelperModalDisplayed,
    ],
    _isFailedCopiedFilesReportModalOn: [
      isFailedCopiedFilesReportModalOn,
      setIsFailedCopiedFilesReportModalOn,
    ],
    _isGpPlusSignUpModalDisplayed: [
      isGpPlusSignUpModalDisplayed,
      setIsGpPlusSignUpModalDisplayed,
    ],
    _lessonItemModal: [lessonItemModal, setLessonItemModal],
    _isGpPlusModalDisplayed: [
      isGpPlusModalDisplayed,
      setIsGpPlusModalDisplayed,
    ],
    _isThankYouModalDisplayed: [
      isThankYouModalDisplayed,
      setIsThankYouModalDisplayed,
    ],
    _isAccountModalMobileOn: [
      isAccountModalMobileOn,
      setIsAccountModalMobileOn,
    ],
    _customModalFooter: [customModalFooter, setCustomModalFooter],
    _isPasswordResetModalOn: [
      isPasswordResetModalOn,
      setIsPasswordResetModalOn,
    ],
    _selectedJob: [selectedJob, setSelectedJob],
    _isJobModalOn: [isJobModalOn, setIsJobModalOn],
    _isDownloadModalInfoOn: [isDownloadModalInfoOn, setIsDownloadModalInfoOn],
    _isLoginModalDisplayed: [isLoginModalDisplayed, setIsLoginModalDisplayed],
    _isCreateAccountModalDisplayed: [
      isCreateAccountModalDisplayed,
      setIsCreateAccountModalDisplayed,
    ],
    _isAboutMeFormModalDisplayed: [
      isAboutMeFormModalDisplayed,
      setIsAboutMeFormModalDisplayed,
    ],
    _notifyModal: [notifyModal, setNotifyModal],
    _isCreatingGpPlusAccount: [
      isCreatingGpPlusAccount,
      setIsCreatingGpPlusAccount,
    ],
    _isAccountSettingModalOn: [
      isAccountSettingModalOn,
      setIsAccountSettingsModalOn,
    ],
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

export const useModalContext = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("Unable to use ModalContext.");
  }

  return context;
};
