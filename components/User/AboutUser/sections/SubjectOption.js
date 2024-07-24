/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */

import { useContext, useState } from "react";
import { UserContext } from "../../../../providers/UserProvider";

const SubjectOption = ({ subject, index, lastIndex }) => {
    const { _aboutUserForm } = useContext(UserContext);
    /** @type {[import("../../../../providers/UserProvider").TAboutUserForm, Function]} */
    const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
    const subjectName = `subject-${index}`;
    const customSubjectName = `other-${index}`;
    let isChecked = false;

    if (aboutUserForm.subjects.has(subjectName) || aboutUserForm.subjects.has(customSubjectName)) {
        isChecked = true;
    }

    const [isTxtInputDisabled, setIsTxtInputDisabled] = useState((subject === 'other:') ? !isChecked : true);
    const [customSubject, setCustomSubject] = useState(aboutUserForm.subjects.get(customSubjectName) ?? "");

    const handleCheckboxOnchange = event => {
        if ((event.target.value === 'other:') && isChecked) {
            const subjectsTaught = structuredClone(aboutUserForm.subjects);
            
            subjectsTaught.delete(`other-${index}`);

            setAboutUserForm(state => ({ ...state, subjects: subjectsTaught }));

            setCustomSubject('');

            setIsTxtInputDisabled(false);

            return;
        }

        if (event.target.value === 'other:') {
            return;
        }
        // GOAL: present all of the input received from the server onto the form. 

        const subjectsTaught = structuredClone(aboutUserForm.subjects);

        if (subjectsTaught.has(event.target.name)) {
            subjectsTaught.delete(event.target.name);
            setAboutUserForm(state => ({ ...state, subjects: subjectsTaught }));
            return;
        }

        subjectsTaught.set(event.target.name, event.target.value);

        setAboutUserForm(state => ({ ...state, subjects: subjectsTaught }));
    };

    const handleOnInputChange = event => {
        const subjectsTaught = structuredClone(aboutUserForm.subjects);

        setCustomSubject(event.target.value);

        subjectsTaught.set(event.target.name, event.target.value);

        setAboutUserForm(state => ({ ...state, subjects: subjectsTaught }));
    };

    return (
        <div className={`d-flex flex-column ${index === lastIndex ? 'mt-2' : ''}`}>
            <section className='d-flex'>
                <input
                    type='checkbox'
                    name={`subject-${index}`}
                    value={subject}
                    onChange={handleCheckboxOnchange}
                    checked={isChecked}
                />
                <span className='capitalize ms-1 txt-color-for-aboutme-modal'>{subject}</span>
            </section>
            {(subject === 'other:') && (
                <input
                    placeholder='Enter subject.'
                    className='aboutme-txt-input no-outline'
                    style={{ maxWidth: '250px', opacity: isTxtInputDisabled ? .3 : 1 }}
                    disabled={isTxtInputDisabled}
                    value={customSubject}
                    name={`other-${index}`}
                    onChange={handleOnInputChange}
                />
            )}
        </div>
    );
};

export default SubjectOption;