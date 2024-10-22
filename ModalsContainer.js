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

import { useContext, useEffect } from "react";
import { ModalContext } from "./providers/ModalProvider";
import SelectedJob from "./components/Modals/SelectedJob";
import DownloadTipModal from "./components/LessonSection/Modals/DownloadTipModal";
import LoginModal from "./components/User/Login/LoginModal";
import AboutUserModal from "./components/User/AboutUser/AboutUserModal";
import Notify from "./components/Modals/Notify";
import AccountModal from "./components/User/AccoutModal";
import Button from "./components/General/Button";
import { IoMdClose } from "react-icons/io";
import SignUpModal from "./components/User/Create/SignUpModal";
import PasswordResetModal from "./components/User/Password/PasswordResetModal";

export const CustomCloseButton = ({ children = <IoMdClose color="white" size={28} />, className = '', handleOnClick = () => { }, style = {} }) => {
    return (
        <Button
            handleOnClick={handleOnClick}
            classNameStr={className}
            defaultStyleObj={style}
        >
            {children}
        </Button>
    )
}


const ModalContainers = () => {
    const { _selectedJob, _isDownloadModalInfoOn, _notifyModal } = useContext(ModalContext);
    const [selectedJob,] = _selectedJob;
    const [isDownloadModalInfoOn] = _isDownloadModalInfoOn;
    const [notifyModal, setNotifyModal] = _notifyModal;

    // TEST THE FOLLOWING CASES: 
    // 1. the user signs in with google, but has a credentials account 
    // 2. the user signs in with their username and password, but has a google account
    // 3. the user signs in with google, but already has an account with google

    // CASE: the user tries to create an account with google, but the google account already exist
    // GOAL: take the user to the account page, and tell the user that they have already created this account before
    return (
        <>
            {selectedJob ? <SelectedJob /> : null}
            {isDownloadModalInfoOn ? <DownloadTipModal /> : null}
            <LoginModal />
            <SignUpModal />
            <AboutUserModal />
            <AccountModal />
            <Notify />
            <PasswordResetModal />
        </>
    )
}

export default ModalContainers;