 

 
 
 

import { useContext } from "react";
import { ModalContext } from "./providers/ModalProvider";
import SelectedJob from "./components/Modals/SelectedJob";
import DownloadTipModal from "./components/LessonSection/Modals/DownloadTipModal";
import LoginModal from "./components/User/Login/LoginModal";
import Notify from "./components/Modals/Notify";
import AccountModal from "./components/User/AccoutModal";
import Button from "./components/General/Button";
import { IoMdClose } from "react-icons/io";
import SignUpModal from "./components/User/Create/SignUpModal";
import PasswordResetModal from "./components/User/Password/PasswordResetModal";
import AccountSettings from "./components/User/Settings/AccountSettings";
import JobVizSummaryModal from "./components/JobViz/JobVizSummaryModal";
import JobVizCompletionModal from "./components/JobViz/JobVizCompletionModal";

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
    return (
        <>
            <SelectedJob />
            <DownloadTipModal />
            <LoginModal />
            <SignUpModal />
            <AccountModal />
            <Notify />
            <PasswordResetModal />
            <AccountSettings />
            <JobVizSummaryModal />
            <JobVizCompletionModal />
        </>
    );
};

export default ModalContainers;
