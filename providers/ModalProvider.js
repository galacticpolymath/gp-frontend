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
import { createContext, useState } from "react";

export const ModalContext = createContext(null);
export const defautlNotifyModalVal = {
    isDisplayed: false,
    bodyTxt: '',
    headerTxt: '',
    handleOnHide: () => { }
};

export const ModalProvider = ({ children }) => {
    const [selectedJob, setSelectedJob] = useState(null);
    const [isJobModalOn, setIsJobModalOn] = useState(false);
    const [isDownloadModalInfoOn, setIsDownloadModalInfoOn] = useState(false);
    const [isLoginModalDisplayed, setIsLoginModalDisplayed] = useState(false);
    const [notifyModal, setNotifyModal] = useState(defautlNotifyModalVal);
    const [isCreateAccountModalDisplayed, setIsCreateAccountModalDisplayed] = useState(false);
    const [isAboutMeFormModalDisplayed, setIsAboutMeFormModalDisplayed] = useState(false);
    const [isAccountModalMobileOn, setIsAccountModalMobileOn] = useState(false);
    const [isPasswordResetModalOn, setIsPasswordResetModalOn] = useState(false);
    const [isAccountSettingModalOn, setIsAccountSettingsModalOn] = useState(false);
    const [customModalFooter, setCustomModalFooter] = useState(null);
    const _notifyModal = [notifyModal, setNotifyModal];
    const _selectedJob = [selectedJob, setSelectedJob]
    const _isJobModalOn = [isJobModalOn, setIsJobModalOn]
    const _isDownloadModalInfoOn = [isDownloadModalInfoOn, setIsDownloadModalInfoOn];
    const _isLoginModalDisplayed = [isLoginModalDisplayed, setIsLoginModalDisplayed];
    const _isCreateAccountModalDisplayed = [isCreateAccountModalDisplayed, setIsCreateAccountModalDisplayed]
    const _isAboutMeFormModalDisplayed = [isAboutMeFormModalDisplayed, setIsAboutMeFormModalDisplayed];
    const _isAccountModalMobileOn = [isAccountModalMobileOn, setIsAccountModalMobileOn];
    const _isPasswordResetModalOn = [isPasswordResetModalOn, setIsPasswordResetModalOn];
    const _customModalFooter = [customModalFooter, setCustomModalFooter];
    const _isAccountSettingModalOn = [isAccountSettingModalOn, setIsAccountSettingsModalOn];

    return (
        <ModalContext.Provider
            value={{
                _customModalFooter,
                _isAccountModalMobileOn,
                _isPasswordResetModalOn,
                _selectedJob,
                _isJobModalOn,
                _isDownloadModalInfoOn,
                _isLoginModalDisplayed,
                _isCreateAccountModalDisplayed,
                _isAboutMeFormModalDisplayed,
                _notifyModal,
                _isAccountSettingModalOn,
            }}
        >
            {children}
        </ModalContext.Provider>
    )
}