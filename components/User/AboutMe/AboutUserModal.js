/* eslint-disable no-console */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import { Modal, ModalBody, ModalTitle } from 'react-bootstrap';
import { useContext, useEffect, useRef, useState } from 'react';
import { ModalContext } from '../../../providers/ModalProvider';
import Button from '../../General/Button';
import GradesOrYearsSelection from './sections/GradesOrYearsSelection';
import { UserContext } from '../../../providers/UserProvider';
import CountrySection from './sections/CountrySection';

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
    /** @type {[import('../../../providers/ModalProvider').TUserForm, Function]} */
    const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
    const [countries, setCountries] = useState([]);
    const modalBodyRef = useRef();

    const handleOnHide = () => {
        setIsAboutMeFormModalDisplayed(false);
    };

    const handleWhatBringsYouToSiteInputChange = event => {
        setAboutUserForm({
            ...aboutUserForm,
            reasonForSiteVisit: event.target.value,
        });
    };

    const handleToggleTextareaDisability = () => {
        setIsTextareaDisabled(state => !state);
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
            dialogClassName='border-0 selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='about-me-modal user-modal-color rounded-0 overflow-scroll'
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
                                placeholder='What do you do?'
                                style={{ maxWidth: '400px' }}
                                className='aboutme-txt-input no-outline'
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
                                style={{
                                    outline: 'none',
                                    borderTop: 'none',
                                    borderRight: 'none',
                                    borderLeft: 'none',
                                    borderBottom: 'solid 1px grey',
                                }}
                                className='aboutme-txt-input'
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
                            {SUBJECTS_OPTIONS.map((subject, index) => {
                                return (
                                    <div key={index} className={`d-flex flex-column ${index === (SUBJECTS_OPTIONS.length - 1) ? 'mt-2' : ''}`}>
                                        <section className='d-flex'>
                                            <input
                                                type='checkbox'
                                                name='subject'
                                                value={subject}
                                            />
                                            <span className='capitalize ms-1 txt-color-for-aboutme-modal'>{subject}</span>
                                        </section>
                                        {(subject === 'other:') && (
                                            <input
                                                placeholder='Enter subject.'
                                                className='aboutme-txt-input no-outline'
                                                style={{ maxWidth: '250px' }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                    <section className='d-flex flex-column mt-2'>
                        <label htmlFor='reasonForSiteVisit'>
                            What brings you to our site?
                        </label>
                        <section className='d-flex flex-column flex-lg-row'>
                            {WHAT_BRINGS_YOU_TO_SITE_OPTS.map((opt, index) => (
                                <div key={index} className={`d-flex ${index === 0 ? '' : 'ms-lg-3'}`}>
                                    <input
                                        type='checkbox'
                                        name='subject'
                                        value={opt}
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
                            id='reasonForSiteVisit'
                            style={{
                                outline: 'none',
                                opacity: isTextareaDisabled ? .3 : 1,
                                height: '125px',
                            }}
                            className='rounded about-me-input-border about-user-textarea p-1 mt-2'
                            placeholder='Your response...'
                        />
                    </section>
                    <section className='d-flex justify-content-end'>
                        <Button
                            classNameStr='mt-2 no-btn-styles text-white bg-primary p-2 rounded'
                        >
                            <span>SUBMIT & SAVE</span>
                        </Button>
                    </section>
                </form>
            </ModalBody>
        </Modal>
    );
};

export default AboutUserModal;