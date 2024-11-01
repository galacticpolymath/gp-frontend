/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
import { createContext, useState } from "react";

/**
 * @typedef {Object} TGradesOrYears
 * @property {"US" | "Outside US"} selection
 * @property {string[]} ageGroupsTaught 
 */

/**
 * @typedef {Object} TSubjectsAndReasonsForVisitMap
 * @property {Map<string, string>} subjects
 * @property {Map<string, string>} reasonsForSiteVisit
 */

/**
 * @typedef {Object} TSubjectsAndReasonsForVisitObjs
 * @property {{ [key: string]: string }} subjects
 * @property {{ [key: string]: string }} reasonsForSiteVisit
 */

/**
 * @global
 * @typedef {Object} TAboutUserForm
 * @property {Map<string, string>} subjects
 * @property {Map<string, string>} reasonsForSiteVisit
 * @property {TGradesOrYears} gradesOrYears
 * @property {string} country
 * @property {string} occupation
 * @property {boolean} isTeacher
 * @property {number | null} zipCode
 * @property {number} classroomSize
*/

/**
 * @typedef {Object} TAboutUserFormFromServer
 * @property {{ [key: string]: string }} subjects
 * @property {{ [key: string]: string }} reasonsForSiteVisit
 * @property {TGradesOrYears} gradesOrYears
 * @property {string} country
 * @property {string} occupation
 * @property {boolean} isTeacher
 * @property {number | null} zipCode
 * @property {number} classroomSize
*/

/** 
 * @global 
 * @type {TAboutUserForm}*/
export const aboutUserFormDefault = {
    gradesOrYears: {
        selection: 'grades',
        ageGroupsTaught: [],
    },
    country: '',
    occupation: '',
    zipCode: null,
    classroomSize: 0,
    subjects: new Map(),
    reasonsForSiteVisit: new Map(),
};

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [aboutUserForm, setAboutUserForm] = useState(aboutUserFormDefault);
    const [accountForm, setAccountForm] = useState({
        firstName: "",
        lastName: "",
        isOnMailingList: false,
    });
    const _aboutUserForm = [aboutUserForm, setAboutUserForm];

    return (
        <UserContext.Provider
            value={{
                _aboutUserForm,
                _accountForm: [accountForm, setAccountForm],
            }}
        >
            {children}
        </UserContext.Provider>
    );
};