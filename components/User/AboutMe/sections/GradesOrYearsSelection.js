/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
import { useState } from 'react';
import Button from '../../../General/Button';

const GradesOrYearsSelection = () => {
    const [gradesColorCss, setGradesColorsCss] = useState('selected-grade-or-years-opt');
    const [yearsColorCss, setYearsColorsCss] = useState('text-gray border');

    const handleGradesOrYearsBtnClick = (setCssOfSelectedBtn, setCssOfUnSelectBtn) => () => {
        setCssOfSelectedBtn('selected-grade-or-years-opt');
        setCssOfUnSelectBtn('text-gray border');
    };

    return (
        <section className='d-flex flex-column col-6'>
            <label>
                What age range do you teach?
            </label>
            <section className='d-flex flex-column mt-2'>
                <section>
                    <Button
                        defaultStyleObj={{ borderTopLeftRadius: '.5em', borderBottomLeftRadius: '.5em', width: '100px' }}
                        classNameStr={`py-1 no-btn-styles ${gradesColorCss}`}
                        handleOnClick={handleGradesOrYearsBtnClick(setGradesColorsCss, setYearsColorsCss)}
                    >
                        Grades
                    </Button>
                    <Button
                        defaultStyleObj={{ background: '#F2F8FD', width: '100px', borderTopRightRadius: '.5em', borderBottomRightRadius: '.5em' }}
                        classNameStr={`py-1 no-btn-styles ${yearsColorCss}`}
                        handleOnClick={handleGradesOrYearsBtnClick(setYearsColorsCss, setGradesColorsCss)}
                    >
                        Years
                    </Button>
                </section>
                <section className='d-flex'>
                    <section className='d-flex ms-2'>
                        <input
                            type='checkbox'
                            name='subject'
                            value="5-12"
                        />
                        <span className='capitalize ms-1 txt-color-for-aboutme-modal'>5-12</span>
                    </section>
                    <section className='d-flex ms-3'>
                        <input
                            type='checkbox'
                            name='subject'
                            value="5-12"
                        />
                        <span className='ms-1 txt-color-for-aboutme-modal'>4 year college/univ.</span>
                    </section>
                </section>
            </section>
        </section>
    );
};

export default GradesOrYearsSelection;