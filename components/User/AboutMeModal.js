/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import { Modal, ModalBody, ModalTitle } from 'react-bootstrap';
import { ModalContext } from '../../providers/ModalProvider';
import { useContext, useEffect, useRef, useState } from 'react';
import Button from '../General/Button';

const SUBJECTS_OPTIONS = [
    'science',
    'math',
    'english language arts',
    'social studies',
    'stem',
    'other',
    'other',
];

const AboutMeModal = () => {
    const { _aboutUserForm } = useContext(ModalContext);
    /** @type {import('../../providers/ModalProvider').TAboutUserForm} */
    const { isModalDisplayed } = _aboutUserForm[0];
    const [gradesOrYearsColorCss, setGradesOrYearsColorCss] = useState({ grades: '', years: '' });
    const [textareaMaxHeight, setTextareaMaxHeight] = useState(0);
    const setAboutUserForm = _aboutUserForm[1];
    const modalBodyRef = useRef();

    const handleOnHide = () => {
        setAboutUserForm(state => ({ ...state, isModalDisplayed: false }));
    };

    const handleGradesOrYearsBtnClick = (selectedOpt, unselectedOpt) => () => {
        setGradesOrYearsColorCss(state => {
            state[selectedOpt] = 'selected-grade-or-years-opt';
            state[unselectedOpt] = 'no-btn-styles text-gray';

            return state;
        });
    };

    useEffect(() => {
        if (modalBodyRef?.current?.clientHeight && isModalDisplayed && !textareaMaxHeight) {
            const height = modalBodyRef.current.clientHeight * .34;
            setTextareaMaxHeight(height);
        }
    }, [isModalDisplayed]);

    return (
        <Modal
            show={isModalDisplayed}
            onHide={handleOnHide}
            dialogClassName='selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='selected-gp-web-app-content user-modal-color'
        >
            <ModalTitle className='px-3 txt-color-for-aboutme-modal'>
                About Me
            </ModalTitle>
            <ModalBody ref={modalBodyRef} className='about-me-modal-body'>
                <form className='position-relative  h-100 w-100'>
                    <section style={{ columnCount: 2 }}>
                        <section className='d-flex flex-column'>
                            <label htmlFor='country-input'>
                                Country:
                            </label>
                            <input
                                placeholder='Country'
                                style={{ maxWidth: '500px' }}
                                className='aboutme-txt-input no-outline'
                            />
                        </section>
                        <section className='d-flex flex-column'>
                            <label htmlFor='country-input'>
                                Zip Code:
                            </label>
                            <input
                                placeholder='Your zip code'
                                type='number'
                                style={{
                                    maxWidth: '200px',
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
                    <section style={{ columnCount: 2 }} className='mt-3'>
                        <section className='d-flex flex-column'>
                            <label htmlFor='country-input'>
                                Grades or years (select one)?
                            </label>
                            <section>
                                <Button
                                    defaultStyleObj={{ borderTopLeftRadius: '.5em', borderBottomLeftRadius: '.5em', width: '100px' }}
                                    classNameStr='py-1 no-btn-styles text-gray border no-border-right'
                                    handleOnClick={handleGradesOrYearsBtnClick('grades', 'years')}
                                >
                                    Grades
                                </Button>
                                <Button
                                    defaultStyleObj={{ background: '#F2F8FD', width: '100px', borderTopRightRadius: '.5em', borderBottomRightRadius: '.5em' }}
                                    classNameStr='py-1 selected-grade-or-years-opt no-btn-styles border-left-0'
                                    handleOnClick={handleGradesOrYearsBtnClick('years', 'grades')}
                                >
                                    Years
                                </Button>
                            </section>
                        </section>
                        <section className='d-flex flex-column'>
                            <label style={{ lineHeight: '25px' }}>
                                How many students do you teach?
                            </label>
                            <input
                                placeholder='Total students'
                                type='number'
                                style={{ maxWidth: '200px' }}
                                className='aboutme-txt-input no-outline'
                            />
                        </section>
                    </section>
                    <section className='d-flex flex-column mt-2'>
                        <label>
                            Subject(s) Taught:
                        </label>
                        <div style={{ columnCount: 2 }} className='pt-1'>
                            {SUBJECTS_OPTIONS.map((subject, index) => {
                                return (
                                    <div key={index} className='d-flex flex-column'>
                                        <section className='d-flex'>
                                            <input
                                                type='checkbox'
                                                name='subject'
                                                value={subject}
                                            />
                                            <span className='capitalize ms-1 txt-color-for-aboutme-modal'>{subject}</span>
                                        </section>
                                        {(subject === 'other') && (
                                            <input
                                                placeholder='Enter subject.'
                                                className='aboutme-txt-input no-outline'
                                                style={{ maxWidth: '400px' }}
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
                        <textarea
                            id='reasonForSiteVisit'
                            style={{ outline: 'none', minHeight: '175px', maxHeight: (textareaMaxHeight === 0) ? 'none' : `${textareaMaxHeight}px` }}
                            className='rounded about-me-input-border p-1 mt-2'
                            placeholder='Your response...'
                        />
                    </section>
                    <Button
                        classNameStr='no-btn-styles text-white bg-primary p-2 rounded shadow position-absolute end-0 bottom-0'
                    >
                        <span>SUBMIT</span>
                    </Button>
                </form>
            </ModalBody>
        </Modal>
    );
};

export default AboutMeModal;