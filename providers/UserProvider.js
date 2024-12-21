/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
import { createContext, useState } from "react";

/**
 * @typedef {Object} TGradesOrYears
 * @property {"U.S." | "Outside U.S."} selection
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
 * @property {{ first: string, last: string }} name
 * @property {number | null} zipCode
 * @property {{ num: number, isNotTeaching: boolean }} classroomSize
*/

/**
 * @typedef {Object} TUserAccount
 * @property {{ [key: string]: string }} subjects
 * @property {{ [key: string]: string }} reasonsForSiteVisit
 * @property {TGradesOrYears} gradesOrYears
 * @property {string} country
 * @property {string} occupation
 * @property {{ first: string, last: string }} name
 * @property {boolean} isTeacher
 * @property {number | null} zipCode
 * @property {{ num: number, isNotTeaching: boolean }} classroomSize
 * @property {boolean} isOnMailingList
*/

/** 
 * @global 
 * @type {TAboutUserForm}*/
export const userAccountDefault = {
    gradesOrYears: {
        selection: 'grades',
        ageGroupsTaught: [],
    },
    country: '',
    occupation: '',
    zipCode: null,
    classroomSize: {
        num: 0,
        isNotTeaching: false,
    },
    subjects: new Map(),
    reasonsForSiteVisit: new Map(),
    name: {
        first: '',
        last: ''
    }
};

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [aboutUserForm, setAboutUserForm] = useState(userAccountDefault);
    const [accountForm, setAccountForm] = useState({
        firstName: "",
        lastName: "",
        isOnMailingList: true,
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