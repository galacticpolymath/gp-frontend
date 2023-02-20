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

import { useState } from "react";
import { createContext } from "react";


export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [isJobInfoModalOn, setIsJobInfoModalOn] = useState(false);
    const [selectedJob, setSelectedJob] = useState(false);
    const _value = {
        _isJobInfoModalOn: [isJobInfoModalOn, setIsJobInfoModalOn], 
        _selectedJob: [selectedJob, setSelectedJob]
    }

    return (
        <ModalContext.Provider value={_value}>
            {children}
        </ModalContext.Provider>
    )
}