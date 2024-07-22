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

/**
 * @typedef {Object} TUserForm
 * @property {'grades' | 'years'} gradesOrYears
 * @property {string} country
 * @property {number | null} zipCode
 * @property {string} studentAgeRange
 * @property {number} classroomSize
 * @property {string[]} subjects
 * @property {string} reasonForSiteVisit
*/

/**
 * @typedef {Object} TAboutUserForm
 * @property {boolean} isModalDisplayed
 * @property {TUserForm} form
 */

/** @type {TAboutUserForm}*/
const aboutUserFormDefaultVal = {
    isModalDisplayed: false,
    form: {
        gradesOrYears: 'grades',
        country: '',
        zipCode: null,
        studentAgeRange: '',
        classroomSize: 0,
        subjects: [],
        reasonForSiteVisit: ''
    }
}
export const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
    const [selectedJob, setSelectedJob] = useState(null);
    const [isJobModalOn, setIsJobModalOn] = useState(false);
    const [isDownloadModalInfoOn, setIsDownloadModalInfoOn] = useState(false);
    const [isLoginModalDisplayed, setIsLoginModalDisplayed] = useState(false);
    const [isCreateAccountModalDisplayed, setIsCreateAccountModalDisplayed] = useState(false);
    const [aboutUserForm, setAboutUserForm] = useState(aboutUserFormDefaultVal);
    const _selectedJob = [selectedJob, setSelectedJob]
    const _isJobModalOn = [isJobModalOn, setIsJobModalOn]
    const _isDownloadModalInfoOn = [isDownloadModalInfoOn, setIsDownloadModalInfoOn];
    const _isLoginModalDisplayed = [isLoginModalDisplayed, setIsLoginModalDisplayed];
    const _isCreateAccountModalDisplayed = [isCreateAccountModalDisplayed, setIsCreateAccountModalDisplayed]
    const _aboutUserForm = [aboutUserForm, setAboutUserForm];

    return (
        <ModalContext.Provider
            value={{
                _selectedJob,
                _isJobModalOn,
                _isDownloadModalInfoOn,
                _isLoginModalDisplayed,
                _isCreateAccountModalDisplayed,
                _aboutUserForm
            }}
        >
            {children}
        </ModalContext.Provider>
    )
}