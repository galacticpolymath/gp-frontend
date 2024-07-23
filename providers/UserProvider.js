/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
import { createContext, useState } from "react";

/**
 * @typedef {Object} TGradesOrYears
 * @property {"grades" | "years"} selection
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
 * @typedef {Object} TAboutUserForm
 * @property {Map<string, string>} subjects
 * @property {Map<string, string>} reasonsForSiteVisit
 * @property {TGradesOrYears} gradesOrYears
 * @property {string} country
 * @property {number | null} zipCode
 * @property {number} classroomSize
*/

/**
 * @typedef {Object} TAboutUserFormFromServer
 * @property {{ [key: string]: string }} subjects
 * @property {{ [key: string]: string }} reasonsForSiteVisit
 * @property {TGradesOrYears} gradesOrYears
 * @property {string} country
 * @property {number | null} zipCode
 * @property {number} classroomSize
*/

/** @type {TAboutUserForm}*/
export const aboutUserFormDefault = {
    gradesOrYears: {
        selection: 'grades',
        ageGroupsTaught: [],
    },
    country: '',
    zipCode: null,
    classroomSize: 0,
    subjects: new Map(),
    reasonsForSiteVisit: new Map(),
};

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [aboutUserForm, setAboutUserForm] = useState(aboutUserFormDefault);
    const _aboutUserForm = [aboutUserForm, setAboutUserForm];

    return (
        <UserContext.Provider
            value={{
                _aboutUserForm,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};