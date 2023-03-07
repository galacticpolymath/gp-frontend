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

export const ModalProvider = ({ children }) => {
    const [selectedJob, setSelectedJob] = useState(null);
    const [isJobModalOn, setIsJobModalOn] = useState(false);
    const _selectedJob = [selectedJob, setSelectedJob]
    const _isJobModalOn = [isJobModalOn, setIsJobModalOn]

    return (
        <ModalContext.Provider value={{ _selectedJob, _isJobModalOn }}>
            {children}
        </ModalContext.Provider>
    )
}