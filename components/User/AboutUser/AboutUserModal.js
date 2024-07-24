/* eslint-disable no-console */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import { Modal, ModalBody, ModalTitle } from 'react-bootstrap';
import { useContext, useEffect, useRef, useState } from 'react';
import { ModalContext } from '../../../providers/ModalProvider';
import GradesOrYearsSelection from './sections/GradesOrYearsSelection';
import { UserContext } from '../../../providers/UserProvider';
import CountrySection from './sections/CountrySection';
import SubjectOption from './sections/SubjectOption';
import SubmitAboutUserFormBtn from './SubmitAboutUserFormBtn';

const SUBJECTS_OPTIONS = [
    'science',
    'math',
    'english language arts',
    'social studies',
    'STEM',
    'other:',
    'other:',
];
// whatBringsYouToSiteOpts
const WHAT_BRINGS_YOU_TO_SITE_OPTS = [
    'interdisciplinary lesson',
    'science research',
    'culturally responsive',
    'free resources',
];

const AboutUserModal = () => {
    const { _isAboutMeFormModalDisplayed } = useContext(ModalContext);
    const { _aboutUserForm } = useContext(UserContext);
    /** @type {[boolean, Function]} */
    const [isAboutMeFormModalDisplayed, setIsAboutMeFormModalDisplayed] = _isAboutMeFormModalDisplayed;
    const [textareaMaxHeight, setTextareaMaxHeight] = useState(0);
    const [isTextareaDisabled, setIsTextareaDisabled] = useState(true);
    const [reasonForVisitCustom, setReasonForVisitCustom] = useState('');
    const [errors, setErorrs] = useState({});
    /** @type {[import('../../../providers/UserProvider').TAboutUserForm, Function]} */
    const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
    const modalBodyRef = useRef();

    const handleOnHide = () => {
        setIsAboutMeFormModalDisplayed(false);
    };

    const handleWhatBringsYouToSiteInputChange = event => {
        const reasonsForSiteVisit = structuredClone(aboutUserForm.reasonsForSiteVisit);

        if (event.target.name === 'reason-for-visit-custom') {
            setReasonForVisitCustom(event.target.value);

            reasonsForSiteVisit.set(event.target.name, event.target.value);

            setAboutUserForm({
                ...aboutUserForm,
                reasonsForSiteVisit: reasonsForSiteVisit,
            });

            return;
        }

        if (reasonsForSiteVisit.has(event.target.name)) {
            reasonsForSiteVisit.delete(event.target.name);
        } else {
            reasonsForSiteVisit.set(event.target.name, event.target.value);
        }

        setAboutUserForm({
            ...aboutUserForm,
            reasonsForSiteVisit: reasonsForSiteVisit,
        });
    };

    const handleToggleTextareaDisability = () => {
        if (!isTextareaDisabled) {
            setReasonForVisitCustom('');

            const reasonsForSiteVisit = structuredClone(aboutUserForm.reasonsForSiteVisit);

            reasonsForSiteVisit.delete('reason-for-visit-custom');

            setAboutUserForm({
                ...aboutUserForm,
                reasonsForSiteVisit: reasonsForSiteVisit,
            });
        }

        setIsTextareaDisabled(state => !state);
    };

    const handleOnInputChange = event => {
        setAboutUserForm(state => ({
            ...state,
            [event.target.name]: event.target.value,
        }));
    };

    const parseAboutUserFormReviver = (key, val) => {
        if (['subjects', 'reasonsForSiteVisit'].includes(key)){
            const map = new Map(Object.entries(val));

            return map;
        }

        return val;
    };

    const handleOnShow = () => {
        const aboutUserFormStringified = localStorage.getItem('aboutUserForm');

        if (aboutUserFormStringified) {
            const aboutUserForm = JSON.parse(aboutUserFormStringified, parseAboutUserFormReviver);
            console.log('aboutUserForm: ', aboutUserForm);
            console.log('hey there!');
            setAboutUserForm(aboutUserForm);
        }
    };

    useEffect(() => {
        if (modalBodyRef?.current?.clientHeight && isAboutMeFormModalDisplayed && !textareaMaxHeight) {
            const height = modalBodyRef.current.clientHeight * .27;
            setTextareaMaxHeight(height);
        }
    }, [isAboutMeFormModalDisplayed]);

    return (
        <Modal
            show={isAboutMeFormModalDisplayed}
            onHide={handleOnHide}
            onShow={handleOnShow}
            dialogClassName='border-0 selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='about-me-modal user-modal-color rounded-0'
        >
            <ModalTitle className='px-3 txt-color-for-aboutme-modal'>
                About Me
            </ModalTitle>
            <ModalBody ref={modalBodyRef} className='about-me-modal-body'>
                <form className='position-relative  h-100 w-100'>
                    <section className='row d-flex flex-column flex-lg-row'>
                        <section className='d-flex flex-column col-8 col-lg-4'>
                            <label htmlFor='country-input'>
                                Occupation:
                            </label>
                            <input
                                name='occupation'
                                onChange={handleOnInputChange}
                                placeholder='What do you do?'
                                value={aboutUserForm.occupation}
                                style={{ maxWidth: '400px' }}
                                className='aboutme-txt-input no-outline pt-1'
                            />
                        </section>
                        <CountrySection />
                        <section className='d-flex flex-column col-8 col-lg-2'>
                            <label htmlFor='country-input'>
                                Zip Code:
                            </label>
                            <input
                                placeholder='Your zip code'
                                type='number'
                                name='zipCode'
                                value={aboutUserForm.zipCode}
                                onChange={handleOnInputChange}
                                style={{
                                    outline: 'none',
                                    borderTop: 'none',
                                    borderRight: 'none',
                                    borderLeft: 'none',
                                    borderBottom: 'solid 1px grey',
                                }}
                                className='aboutme-txt-input pt-1'
                            />
                        </section>
                    </section>
                    <section style={{ columnCount: 2 }} className='mt-4 mb-2 row'>
                        <GradesOrYearsSelection />
                        <section className='d-flex flex-column col-12 col-lg-6'>
                            <label style={{ lineHeight: '25px' }}>
                                How many students do you teach?
                            </label>
                            <input
                                placeholder='Total students'
                                type='number'
                                name='classroomSize'
                                onChange={handleOnInputChange}
                                style={{ maxWidth: '200px', transform: 'translateY(50%)' }}
                                className='aboutme-txt-input no-outline'
                            />
                        </section>
                    </section>
                    <section className='d-flex flex-column mt-4 mt-lg-2'>
                        <label>
                            Subject(s) Taught:
                        </label>
                        <div className='pt-1 subjects-taught-container'>
                            {SUBJECTS_OPTIONS.map((subject, index) => (
                                <SubjectOption
                                    key={index}
                                    index={index}
                                    lastIndex={SUBJECTS_OPTIONS.length - 1}
                                    subject={subject}
                                />
                            ))}
                        </div>
                    </section>
                    <section className='d-flex flex-column mt-2'>
                        <label htmlFor='reasonsForSiteVisit'>
                            What brings you to our site?
                        </label>
                        <section className='d-flex flex-column flex-lg-row'>
                            {WHAT_BRINGS_YOU_TO_SITE_OPTS.map((opt, index) => (
                                <div key={index} className={`d-flex ${index === 0 ? '' : 'ms-lg-3'}`}>
                                    <input
                                        type='checkbox'
                                        value={opt}
                                        name={`reason-for-visit-${index}`}
                                        onChange={handleWhatBringsYouToSiteInputChange}
                                    />
                                    <span className='capitalize ms-1'>
                                        {opt}
                                    </span>
                                </div>
                            ))}
                        </section>
                        <div className='d-flex'>
                            <input
                                type='checkbox'
                                name='subject'
                                onChange={handleToggleTextareaDisability}
                            />
                            <span className='ms-1'>
                                Other:
                            </span>
                        </div>
                        <textarea
                            disabled={isTextareaDisabled}
                            id='reasonsForSiteVisit'
                            name='reason-for-visit-custom'
                            style={{
                                outline: 'none',
                                opacity: isTextareaDisabled ? .3 : 1,
                                height: '115px',
                            }}
                            className='rounded about-me-input-border about-user-textarea p-1 mt-2'
                            placeholder='Your response...'
                            value={reasonForVisitCustom}
                            onChange={handleWhatBringsYouToSiteInputChange}
                        />
                    </section>
                    <section className='d-flex justify-content-end'>
                        <SubmitAboutUserFormBtn setErrors={setErorrs} />
                    </section>
                </form>
            </ModalBody>
        </Modal>
    );
};

export default AboutUserModal;