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

import { useContext } from "react";
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
import AccountSettings from "./components/User/Settings/AccountSettings";

export const CustomCloseButton = ({
    children = <IoMdClose color="white" size={28} />,
    className = "",
    handleOnClick = () => { },
    style = {},
}) => {
    return (
        <Button
            handleOnClick={handleOnClick}
            classNameStr={className}
            defaultStyleObj={style}
        >
            {children}
        </Button>
    );
};

const ModalContainers = () => {
    const { _selectedJob } = useContext(ModalContext);
    const [selectedJob] = _selectedJob;
    // only have the modals be rendered based on where the user is at on the page

    return (
        <>
            {selectedJob ? <SelectedJob /> : null}
            <DownloadTipModal />
            <LoginModal />
            <SignUpModal />
            <AccountModal />
            <Notify />
            <PasswordResetModal />
            <AccountSettings />
        </>
    );
};

export default ModalContainers;
