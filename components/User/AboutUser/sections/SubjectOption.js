/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */

import { useContext } from "react";
import { UserContext } from "../../../../providers/UserProvider";

const SubjectOption = ({ subject, index, lastIndex }) => {
    const { _aboutUserForm } = useContext(UserContext);
    /** @type {[import("../../../../providers/UserProvider").TAboutUserForm, Function]} */
    const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
    const subjectName = `subject-${index}`;
    const customSubjectName = `other-${index}`;
    const isChecked = aboutUserForm.subjects.has(subjectName) || aboutUserForm.subjects.has(customSubjectName);

    const handleCheckboxOnchange = event => {
        const subjectsTaught = structuredClone(aboutUserForm.subjects);

        if ((event.target.value === 'other:') && isChecked) {
            subjectsTaught.delete(customSubjectName);

            setAboutUserForm(state => ({ ...state, subjects: subjectsTaught }));

            return;
        }

        if (event.target.value === 'other:') {
            subjectsTaught.set(customSubjectName, '');

            setAboutUserForm(state => ({ ...state, subjects: subjectsTaught }));

            return;
        }

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
                    style={{ maxWidth: '250px', opacity: !isChecked ? .3 : 1 }}
                    disabled={!isChecked}
                    value={aboutUserForm.subjects.get(customSubjectName) ?? ''}
                    name={`other-${index}`}
                    onChange={handleOnInputChange}
                />
            )}
        </div>
    );
};

export default SubjectOption;