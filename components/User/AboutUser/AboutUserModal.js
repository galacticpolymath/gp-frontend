/* eslint-disable quotes */
/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import { Accordion, Modal, ModalBody, ModalTitle, useAccordionButton } from 'react-bootstrap';
import { useContext, useEffect, useRef, useState } from 'react';
import { ModalContext } from '../../../providers/ModalProvider';
import GradesOrYearsSelection from './sections/GradesOrYearsSelection';
import { UserContext } from '../../../providers/UserProvider';
import CountrySection from './sections/CountrySection';
import SubjectOption from './sections/SubjectOption';
import SubmitAboutUserFormBtn from './SubmitAboutUserFormBtn';
import { getAboutUserFormForClient, getUrlVal } from '../../../pages/account';
import { useRouter } from 'next/router';
import { CustomCloseButton } from '../../../ModalsContainer';
import { IoIosArrowDown, IoIosArrowUp, IoMdClose } from 'react-icons/io';
import { BiCheckbox, BiCheckboxChecked } from 'react-icons/bi';

const AccordionToggleBtn = ({ children = <></>, btnClassName = "", eventKey, handleBtnClick }) => {
    const handleAccordionToggleBtnClick = useAccordionButton(eventKey, event => {
        event.preventDefault();

        if (typeof handleBtnClick === 'function') {
            handleBtnClick();
        }
    });

    return (
        <button
            type="button"
            onClick={handleAccordionToggleBtnClick}
            className={btnClassName}
        >
            {children}
        </button>
    );
};

const SUBJECTS_OPTIONS = [
    'science',
    'math',
    'english language arts',
    'social studies',
    'STEM',
    'other:',
    'other:',
];
const WHAT_BRINGS_YOU_TO_SITE_OPTS = [
    'interdisciplinary lessons',
    'lessons connected to research',
    'culturally responsive lessons',
    'free resources',
];

const AboutUserModal = () => {
    const { _isAboutMeFormModalDisplayed } = useContext(ModalContext);
    const { _aboutUserForm } = useContext(UserContext);
    const [isAboutMeFormModalDisplayed, setIsAboutMeFormModalDisplayed] = _isAboutMeFormModalDisplayed;
    const [textareaMaxHeight, setTextareaMaxHeight] = useState(0);
    const [countryNames, setCountryNames] = useState([]);
    const [errors, setErorrs] = useState(new Map());
    /**
     * @type {[import('../../../providers/UserProvider').TAboutUserForm, import('react').Dispatch<import('react').SetStateAction<import('../../../providers/UserProvider').TAboutUserForm>>]} */
    const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
    const router = useRouter();
    const modalBodyRef = useRef();

    const handleOnHide = () => {
        const aboutUserFormStringified = localStorage.getItem('aboutUserForm');

        if (aboutUserFormStringified) {
            setTimeout(() => {
                const aboutUserForm = JSON.parse(aboutUserFormStringified);
                setAboutUserForm(getAboutUserFormForClient(aboutUserForm));
            }, 300);
        }

        setIsAboutMeFormModalDisplayed(false);
    };

    const handleAreYouATeacherBtnClick = () => {
        setAboutUserForm(state => ({ ...state, isTeacher: !state.isTeacher }));
    };

    useEffect(() => {
        console.log('aboutUserForm: ', aboutUserForm);
    });

    const handleWhatBringsYouToSiteInputChange = event => {
        const reasonsForSiteVisit = structuredClone(aboutUserForm.reasonsForSiteVisit) ?? new Map();

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

        const urlVal = getUrlVal(router, "show_about_user_form");

        if (typeof JSON.parse(urlVal) === 'boolean') {
            const url = router.asPath;
            router.replace(url.split("?")[0]);
        }

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
            <CustomCloseButton
                className='no-btn-styles position-absolute top-0 end-0 me-2'
                handleOnClick={handleOnHide}
            >
                <IoMdClose color="black" size={28} />
            </CustomCloseButton>
            <ModalTitle style={{ maxWidth: '1800px' }} className='px-3 txt-color-for-aboutme-modal w-100'>
                About Me
            </ModalTitle>
            <ModalBody
                style={{ maxWidth: '1800px' }}
                ref={modalBodyRef}
                className='about-me-modal-body w-100'
            >
                <form className='position-relative  h-100 w-100'>
                    <section className='row d-flex flex-column flex-lg-row'>
                        <section className='d-flex flex-column col-12 col-sm-8 col-lg-4'>
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
                                className={`ms-2 ms-sm-0 aboutme-txt-input no-outline pt-1 ${errors.has('occupation') ? 'text-danger border-danger' : ''}`}
                            />
                            <span style={{ height: '25px', fontSize: '16px' }} className='text-danger ms-2 ms-sm-0'>{errors.get('occupation') ?? ''}</span>
                        </section>
                        <CountrySection
                            countryNames={countryNames}
                            _errors={[errors, setErorrs]}
                        />
                        <section className='d-flex flex-column col-12 col-sm-8 col-lg-2'>
                            <label
                                htmlFor='zipCode-input'
                                className={`${errors.has('zipCode') ? 'text-danger' : ''}`}
                                style={{
                                    opacity: aboutUserForm?.country?.toLowerCase() === 'united states' ? 1 : .3,
                                }}
                            >
                                *Zip Code:
                            </label>
                            <input
                                placeholder='Your zip code'
                                type='number'
                                name='zipCode'
                                id='zipCode-input'
                                disabled={aboutUserForm?.country?.toLowerCase() !== 'united states'}
                                value={aboutUserForm?.zipCode ?? ''}
                                onChange={handleOnInputChange}
                                style={{
                                    outline: 'none',
                                    borderTop: 'none',
                                    borderRight: 'none',
                                    borderLeft: 'none',
                                    borderBottom: errors.has('zipCode') ? 'solid 1px red' : 'solid 1px grey',
                                    opacity: aboutUserForm?.country?.toLowerCase() !== 'united states' ? .3 : 1,
                                }}
                                className={`aboutme-txt-input pt-1 ms-2 ms-sm-0 ${errors.has('zipCode') ? 'border-danger' : ''}`}
                            />
                            <span style={{ height: '25px', fontSize: '16px' }} className='text-danger ms-2 ms-sm-0'>{errors.get('zipCode') ?? ''}</span>
                        </section>
                    </section>
                    <Accordion activeKey={aboutUserForm.isTeacher ? "0" : ""}>
                        <div style={{ border: aboutUserForm.isTeacher ? "3.5px solid #EEB7DA" : '3.5px solid transparent', transition: 'border .3s' }} className='px-3 py-2 rounded'>
                            <div className='d-flex justify-content-between'>
                                <section className='d-flex flex-column justify-content-center align-items-center w-100'>
                                    <section className='d-flex col-12  flex-column'>
                                        <h3>Help us to keep the content free for everyone!</h3>
                                        <span><b>For access to teacher guides</b>, we need to know a bit more about who you are.</span>
                                    </section>
                                    <section className='col-12 px-lg3'>
                                        <div style={{ borderBottom: 'solid 1.7px lightgrey' }} className='d-flex col-12 position-relative'>
                                            <AccordionToggleBtn
                                                btnClassName='no-btn-styles'
                                                eventKey="0"
                                                handleBtnClick={handleAreYouATeacherBtnClick}
                                            >
                                                {aboutUserForm.isTeacher ? <BiCheckboxChecked fontSize="21px" /> : <BiCheckbox fontSize="21px" />}
                                            </AccordionToggleBtn>
                                            <span className='pt-1'>
                                                I am a teacher.
                                            </span>
                                            {aboutUserForm.isTeacher ? <IoIosArrowDown className='position-absolute end-0 bottom-0 mb-1' /> : <IoIosArrowUp className='position-absolute end-0 bottom-0 mb-1' />}
                                        </div>
                                    </section>
                                </section>
                            </div>
                            <Accordion.Item eventKey="0" className='p-0 rounded-0 border-0 col-12 px-lg-4'>
                                <Accordion.Body className='p-0 rounded-0'>
                                    <section style={{ columnCount: 2 }} className='mt-3 mb-2 row'>
                                        <GradesOrYearsSelection />
                                        <section className='d-flex flex-column col-12 col-lg-6 mt-2 mt-sm-0'>
                                            <label style={{ lineHeight: '25px' }}>
                                                *How many students do you teach?
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
                                    <section className='d-flex flex-column mt-4 mt-lg-3'>
                                        <label>
                                            *Subject(s) Taught:
                                        </label>
                                        <section className='row d-flex flex-column flex-sm-row ps-2'>
                                            <div className='pt-1 subjects-taught-container col-12 col-sm-6'>
                                                {SUBJECTS_OPTIONS.slice(0, 5).map((subject, index) => (
                                                    <SubjectOption
                                                        key={index}
                                                        index={index}
                                                        subjectFieldNameForMapTracker={`subject-${index}`}
                                                        customCssClassses={index !== 0 ? 'mt-2 mt-sm-0' : ''}
                                                        subject={subject}
                                                    />
                                                ))}
                                            </div>
                                            <div className='pt-1 subjects-taught-container col-12 col-sm-6'>
                                                {SUBJECTS_OPTIONS.slice(5).map((subject, index) => (
                                                    <SubjectOption
                                                        key={index}
                                                        index={index}
                                                        subjectFieldNameForMapTracker={`other-subject-${index}`}
                                                        customCssClassses='mt-2 mt-sm-0'
                                                        subject={subject}
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                    </section>
                                </Accordion.Body>
                            </Accordion.Item>
                        </div>
                    </Accordion>
                    <section className='d-flex flex-column mt-2 mt-4 mt-lg-3'>
                        <label htmlFor='reasonsForSiteVisit'>
                            What brings you to our site?
                        </label>
                        <section className='d-flex flex-column flex-lg-row ps-2'>
                            {WHAT_BRINGS_YOU_TO_SITE_OPTS.map((opt, index) => {
                                const name = `reason-for-visit-${index}`;
                                const isChecked = (aboutUserForm.reasonsForSiteVisit && aboutUserForm.reasonsForSiteVisit instanceof Map) ? aboutUserForm.reasonsForSiteVisit.has(name) : false;

                                return (
                                    <div key={index} className={`d-flex mt-2 mt-sm-0 ${index === 0 ? '' : 'ms-lg-3'}`}>
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
                        <section className='d-flex flex-column ps-2'>
                            <section className='d-flex'>
                                <input
                                    type='checkbox'
                                    name='subject'
                                    onChange={handleToggleTextareaDisability}
                                    checked={(aboutUserForm.reasonsForSiteVisit && aboutUserForm.reasonsForSiteVisit instanceof Map) ? aboutUserForm.reasonsForSiteVisit.has('reason-for-visit-custom') : false}
                                />
                                <span className='ms-1'>
                                    Other:
                                </span>
                            </section>
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
