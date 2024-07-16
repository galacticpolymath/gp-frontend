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
import LoginModal from "./components/Login/LoginModal";

const ModalContainers = () => {
    const { _selectedJob, _isDownloadModalInfoOn } = useContext(ModalContext);
    const [selectedJob,] = _selectedJob;
    const [isDownloadModalInfoOn] = _isDownloadModalInfoOn;

    // NOTES: 
    // create the login modal, get the ui from the LoginContainerForNavbar and put it into the modal

    // GOAL: display the login modal when the user presses the login button 
    // the login modal is displayed 
    // if willDisplayLoginModal is true, then render the modal
    // within the login modal component, get _willDipslayLoginModal
    // transfer the state to the login modal component
    // create the state in the ModalProvider component
    // create a state that will determine to show the login modal, call willDisplayLoginModal

    return (
        <>
            {selectedJob ? <SelectedJob /> : null}
            {isDownloadModalInfoOn ? <DownloadTipModal /> : null}
            <LoginModal />
        </>
    )
}

export default ModalContainers;