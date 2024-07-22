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
 * @typedef {Object} TUserForm
 * @property {TGradesOrYears} gradesOrYears
 * @property {string} country
 * @property {number | null} zipCode
 * @property {string} studentAgeRange
 * @property {number} classroomSize
 * @property {string[]} subjects
 * @property {string} reasonForSiteVisit
*/

/** @type {TAboutUserForm}*/
const aboutMeFormDefault = {
    gradesOrYears: {
        selection: 'grades',
        ageGroupsTaught: [],
    },
    country: '',
    zipCode: null,
    studentAgeRange: '',
    classroomSize: 0,
    subjects: [],
    reasonForSiteVisit: '',
};

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [aboutUserForm, setAboutUserForm] = useState(aboutMeFormDefault);
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