/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unexpected-multiline */
/* eslint-disable semi */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-console */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import { createContext, ReactNode, useContext, useState } from "react";
import {
  IComponent,
  IItemForClient,
  TUseStateReturnVal,
} from "../types/global";
import {
  IItemV2,
  IItemV2Props,
} from "../backend/models/Unit/types/teachingMaterials";
import { TFileToCopy } from "../backend/services/gdriveServices/types";

export const ModalContext = createContext<IModalProviderValue | null>(null);
export interface INotifyModalVal {
  isDisplayed: boolean;
  bodyTxt: string | ReactNode;
  headerTxt: string;
  closeBtnTxt?: string;
  handleOnHide: () => void;
}

export const defautlNotifyModalVal: INotifyModalVal = {
  isDisplayed: false,
  bodyTxt: "",
  headerTxt: "",
  handleOnHide: () => {},
};

type TLessonItemModal = {
  isDisplayed: boolean;
  docUrl?: string;
};
export interface ILessonItemModal
  extends TLessonItemModal,
    Partial<IItemV2Props & Pick<IItemV2, "itemCat">> {
  allDocUrlAndNamePairs: [string, string][];
  currentDocUrlIndex: number;
}

export interface IModalProviderValue {
  _customModalFooter: TUseStateReturnVal<null | ReactNode>;
  _isAccountModalMobileOn: TUseStateReturnVal<boolean>;
  _isPasswordResetModalOn: TUseStateReturnVal<boolean>;
  _selectedJob: TUseStateReturnVal<null>;
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
  _lessonItemModal: TUseStateReturnVal<ILessonItemModal>;
}

export const ModalProvider = ({ children }: Pick<IComponent, "children">) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobModalOn, setIsJobModalOn] = useState(false);
  const [isCreatingGpPlusAccount, setIsCreatingGpPlusAccount] = useState(false);
  const [isDownloadModalInfoOn, setIsDownloadModalInfoOn] = useState(false);
  const [isLoginModalDisplayed, setIsLoginModalDisplayed] = useState(false);
  const [isGpPlusModalDisplayed, setIsGpPlusModalDisplayed] = useState(false);
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
  const [lessonItemModal, setLessonItemModal] = useState<ILessonItemModal>({
    isDisplayed: false,
    allDocUrlAndNamePairs: [],
    currentDocUrlIndex: 0,
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
