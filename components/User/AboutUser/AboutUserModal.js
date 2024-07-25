/* eslint-disable no-debugger */
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
    const errorsMap = new Map();
    errorsMap.set('occupation', 'This field is required');
    const [errors, setErorrs] = useState(errorsMap);
    /** @type {[import('../../../providers/UserProvider').TAboutUserForm, Function]} */
    const [aboutUserForm, setAboutUserForm] = _aboutUserForm;

    const modalBodyRef = useRef();

    const handleOnHide = () => {
        setIsAboutMeFormModalDisplayed(false);
    };

    const handleWhatBringsYouToSiteInputChange = event => {
        const reasonsForSiteVisit = structuredClone(aboutUserForm.reasonsForSiteVisit);

        if (event.target.name === 'reason-for-visit-custom') {
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
        const reasonsForSiteVisit = structuredClone(aboutUserForm.reasonsForSiteVisit) ?? new Map();

        if (reasonsForSiteVisit.has('reason-for-visit-custom')) {
            reasonsForSiteVisit.delete('reason-for-visit-custom');

            setAboutUserForm({
                ...aboutUserForm,
                reasonsForSiteVisit: reasonsForSiteVisit,
            });

            return;
        }

        reasonsForSiteVisit.set('reason-for-visit-custom', '');

        setAboutUserForm({
            ...aboutUserForm,
            reasonsForSiteVisit: reasonsForSiteVisit,
        });
    };

    const handleOnInputChange = event => {
        if (errors.has(event.target.name)) {
            const errorsClone = structuredClone(errors);

            errorsClone.delete(event.target.name);

            setErorrs(errorsClone);
        }
        setAboutUserForm(state => ({
            ...state,
            [event.target.name]: event.target.value,
        }));
    };

    const handleParseUserForm = (key, val) => {
        if (['subjects', 'reasonsForSiteVisit'].includes(key)) {
            const map = new Map(Object.entries(val));

            return map;
        }

        return val;
    };

    const handleOnShow = () => {
        const aboutUserFormStringified = localStorage.getItem('aboutUserForm');

        if (aboutUserFormStringified) {
            const aboutUserForm = JSON.parse(aboutUserFormStringified, handleParseUserForm);
            setAboutUserForm(aboutUserForm);
        }
    };

    useEffect(() => {
        if (modalBodyRef?.current?.clientHeight && isAboutMeFormModalDisplayed && !textareaMaxHeight) {
            const height = modalBodyRef.current.clientHeight * .27;
            setTextareaMaxHeight(height);
        }
    }, [isAboutMeFormModalDisplayed]);

    const [countryNames, setCountryNames] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
                const responseBodyData = await response.json();

                if (responseBodyData?.length) {
                    const countryNamesReceived = responseBodyData.map(country => country.name.common);

                    countryNamesReceived.sort();

                    setCountryNames(countryNamesReceived);
                }
            } catch (error) {
                console.error('Failed to retrieve countries. Reason: ', error);
            }
        })();
    }, []);

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
                        <section className='d-flex flex-column col-8 col-lg-4 b7order'>
                            <label htmlFor='country-input' className={`${errors.has('occupation') ? 'text-danger' : ''}`}>
                                *Occupation:
                            </label>
                            <input
                                name='occupation'
                                onChange={handleOnInputChange}
                                placeholder='What do you do?'
                                value={aboutUserForm?.occupation ?? ''}
                                style={{ maxWidth: '400px' }}
                                autoFocus={!aboutUserForm?.occupation}
                                className={`aboutme-txt-input no-outline  pt-1 ${errors.has('occupation') ? 'text-danger border-danger' : ''}`}
                            />
                            {errors.has('occupation') && <span className='text-danger'>{errors.get('occupation')}</span>}
                        </section>
                        <CountrySection countryNames={countryNames} />
                        <section className='d-flex flex-column col-8 col-lg-2'>
                            <label htmlFor='country-input' style={{ opacity: aboutUserForm?.country?.toLowerCase() !== 'united states' ? .3 : 1 }}>
                                *Zip Code:
                            </label>
                            <input
                                placeholder='Your zip code'
                                type='number'
                                name='zipCode'
                                disabled={aboutUserForm?.country?.toLowerCase() !== 'united states'}
                                value={aboutUserForm?.zipCode ?? ''}
                                onChange={handleOnInputChange}
                                style={{
                                    outline: 'none',
                                    borderTop: 'none',
                                    borderRight: 'none',
                                    borderLeft: 'none',
                                    borderBottom: 'solid 1px grey',
                                    opacity: aboutUserForm?.country?.toLowerCase() !== 'united states' ? .3 : 1,
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
                                value={aboutUserForm?.classroomSize ?? '0'}
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
                        <section className='row d-flex flex-column flex-sm-row'>
                            <div className='pt-1 subjects-taught-container col-6'>
                                {SUBJECTS_OPTIONS.slice(0, 5).map((subject, index) => (
                                    <SubjectOption
                                        key={index}
                                        index={index}
                                        subjectFieldNameForMapTracker={`subject-${index}`}
                                        subject={subject}
                                    />
                                ))}
                            </div>
                            <div className='pt-1 subjects-taught-container col-6'>
                                {SUBJECTS_OPTIONS.slice(5).map((subject, index) => (
                                    <SubjectOption
                                        key={index}
                                        index={index}
                                        subjectFieldNameForMapTracker={`other-subject-${index}`}
                                        subject={subject}
                                    />
                                ))}
                            </div>
                        </section>
                    </section>
                    <section className='d-flex flex-column mt-2'>
                        <label htmlFor='reasonsForSiteVisit'>
                            What brings you to our site?
                        </label>
                        <section className='d-flex flex-column flex-lg-row'>
                            {WHAT_BRINGS_YOU_TO_SITE_OPTS.map((opt, index) => {
                                const name = `reason-for-visit-${index}`;
                                const isChecked = (aboutUserForm.reasonsForSiteVisit && aboutUserForm.reasonsForSiteVisit instanceof Map) ? aboutUserForm.reasonsForSiteVisit.has(name) : false;

                                return (
                                    <div key={index} className={`d-flex ${index === 0 ? '' : 'ms-lg-3'}`}>
                                        <input
                                            type='checkbox'
                                            value={opt}
                                            name={name}
                                            onChange={handleWhatBringsYouToSiteInputChange}
                                            checked={isChecked}
                                        />
                                        <span className='capitalize ms-1'>
                                            {opt}
                                        </span>
                                    </div>
                                );
                            })}
                        </section>
                        <div className='d-flex'>
                            <input
                                type='checkbox'
                                name='subject'
                                onChange={handleToggleTextareaDisability}
                                checked={(aboutUserForm.reasonsForSiteVisit && aboutUserForm.reasonsForSiteVisit instanceof Map) ? aboutUserForm.reasonsForSiteVisit.has('reason-for-visit-custom') : false}
                            />
                            <span className='ms-1'>
                                Other:
                            </span>
                        </div>
                        <textarea
                            disabled={!((aboutUserForm.reasonsForSiteVisit && aboutUserForm.reasonsForSiteVisit instanceof Map) ? aboutUserForm.reasonsForSiteVisit.has('reason-for-visit-custom') : false)}
                            id='reasonsForSiteVisit'
                            name='reason-for-visit-custom'
                            style={{
                                outline: 'none',
                                opacity: !aboutUserForm?.reasonsForSiteVisit?.has('reason-for-visit-custom') ? .3 : 1,
                                height: '115px',
                            }}
                            className='rounded about-me-input-border about-user-textarea p-1 mt-2'
                            placeholder='Your response...'
                            value={aboutUserForm?.reasonsForSiteVisit?.has('reason-for-visit-custom') ? aboutUserForm.reasonsForSiteVisit.get('reason-for-visit-custom') : ''}
                            onChange={handleWhatBringsYouToSiteInputChange}
                        />
                    </section>
                    <section className='d-flex justify-content-end'>
                        <SubmitAboutUserFormBtn setErrors={setErorrs} countryNames={countryNames} />
                    </section>
                </form>
            </ModalBody>
        </Modal>
    );
};

export default AboutUserModal;