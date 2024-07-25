/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */

import { useContext } from "react";
import { UserContext } from "../../../../providers/UserProvider";

const SubjectOption = ({ subject, customCssClassses = '', subjectFieldNameForMapTracker }) => {
    const { _aboutUserForm } = useContext(UserContext);
    /** @type {[import("../../../../providers/UserProvider").TAboutUserForm, Function]} */
    const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
    const isChecked = aboutUserForm?.subjects?.has(subjectFieldNameForMapTracker);

    const handleCheckboxOnchange = ({ target }) => {
        const { value, name } = target;
        const subjectsTaught = structuredClone(aboutUserForm.subjects) ?? new Map();

        if ((value === 'other:') && isChecked) {
            subjectsTaught.delete(name);

            setAboutUserForm(state => ({ ...state, subjects: subjectsTaught }));

            return;
        }

        if (value === 'other:') {
            subjectsTaught.set(name, '');

            setAboutUserForm(state => ({ ...state, subjects: subjectsTaught }));

            return;
        }

        if (subjectsTaught?.has(name)) {
            subjectsTaught.delete(name);

            setAboutUserForm(state => ({ ...state, subjects: subjectsTaught }));

            return;
        }

        subjectsTaught.set(name, value);

        setAboutUserForm(state => ({ ...state, subjects: subjectsTaught }));
    };

    const handleOnTxtInputChange = event => {
        const subjectsTaught = structuredClone(aboutUserForm.subjects) ?? new Map();

        subjectsTaught.set(event.target.name, event.target.value);

        setAboutUserForm(state => ({ ...state, subjects: subjectsTaught }));
    };
    // index === lastIndex ? 'mt-2' : ''

    return (
        <div className={`d-flex flex-column ${customCssClassses}`}>
            <section className='d-flex'>
                <input
                    type='checkbox'
                    name={subjectFieldNameForMapTracker}
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
                    value={aboutUserForm?.subjects?.get(subjectFieldNameForMapTracker) ?? ''}
                    name={subjectFieldNameForMapTracker}
                    onChange={handleOnTxtInputChange}
                />
            )}
        </div>
    );
};

export default SubjectOption;