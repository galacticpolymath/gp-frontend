/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */

import { useContext, useState } from "react";
import { UserContext } from "../../../../providers/UserProvider";

const SubjectOption = ({ subject, index, lastIndex }) => {
    const { _aboutUserForm } = useContext(UserContext);
    /** @type {[import("../../../../providers/UserProvider").TUserForm, Function]} */
    const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
    const [isInputTxtDisabled, setIsInputTxtDisabled] = useState(true);
    const [customSubject, setCustomSubject] = useState("");

    const handleCheckboxOnchange = event => {
        console.log('event.target.value: ', event.target.value);
        if ((event.target.value === 'other:') && !isInputTxtDisabled) {
            const subjectsTaught = structuredClone(aboutUserForm.subjects);

            subjectsTaught.delete(`other-${index}`);

            setAboutUserForm(state => ({ ...state, subjects: subjectsTaught }));

            setCustomSubject('');

            setIsInputTxtDisabled(true);
            return;
        }

        if (event.target.value === 'other:') {
            setIsInputTxtDisabled(false);
            return;
        }

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
                />
                <span className='capitalize ms-1 txt-color-for-aboutme-modal'>{subject}</span>
            </section>
            {(subject === 'other:') && (
                <input
                    placeholder='Enter subject.'
                    className='aboutme-txt-input no-outline'
                    style={{ maxWidth: '250px', opacity: isInputTxtDisabled ? .3 : 1 }}
                    disabled={isInputTxtDisabled}
                    value={customSubject}
                    name={`other-${index}`}
                    onChange={handleOnInputChange}
                />
            )}
        </div>
    );
};

export default SubjectOption;