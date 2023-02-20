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
import { ModalContext } from "./providers/ModalProviders";
import SelectedJob from "./components/Modals/Modals/SelectedJob";

const ModalContainers = () => {
    const { _isJobInfoModalOn, _selectedJob } = useContext(ModalContext);
    const [isJobInfoModalOn,] = _isJobInfoModalOn
    const [selectedJob,] = _selectedJob;

    return (
        <>
            {selectedJob ? <SelectedJob /> : null}
        </>
    )
}

export default ModalContainers;