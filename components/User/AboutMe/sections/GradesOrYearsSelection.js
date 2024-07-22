/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
import { useContext, useState } from 'react';
import Button from '../../../General/Button';
import { UserContext } from '../../../../providers/UserProvider';

const AGE_GROUPS = {
    grades: ['5-12', '4 year college/univ.'],
    years: ['6-13'],
};

const GradesOrYearsSelection = () => {
    const { _aboutUserForm } = useContext(UserContext);
    const [gradesColorCss, setGradesColorsCss] = useState('selected-grade-or-years-opt');
    const [yearsColorCss, setYearsColorsCss] = useState('text-gray border');
    /** @type {[import('../../../../providers/ModalProvider').TUserForm, Function]} */
    const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
    const { selection, ageGroupsTaught } = aboutUserForm.gradesOrYears;
    const ageGroupOptions = AGE_GROUPS[selection];

    const handleGradesOrYearsBtnClick = (setCssOfSelectedBtn, setCssOfUnSelectBtn, gradesOrYearsSelectedOptName) => () => {
        setCssOfSelectedBtn('selected-grade-or-years-opt');
        setCssOfUnSelectBtn('text-gray border');
        setAboutUserForm(state => ({
            ...state,
            gradesOrYears: {
                selection: gradesOrYearsSelectedOptName,
                ageGroupsTaught: [],
            },
        }));
    };

    const handleCheckboxInputChange = event => {
        const { value: selectedAgeGroup } = event.target;

        if (ageGroupsTaught.find(ageGroup => ageGroup === selectedAgeGroup)) {
            setAboutUserForm(state => ({
                ...state,
                gradesOrYears: {
                    ...state.gradesOrYears,
                    ageGroupsTaught: ageGroupsTaught.filter(ageGroup => ageGroup !== selectedAgeGroup),
                },
            }));
            return;
        }

        setAboutUserForm(state => ({
            ...state,
            gradesOrYears: {
                ...state.gradesOrYears,
                ageGroupsTaught: [...ageGroupsTaught, selectedAgeGroup],
            },
        }));
    };

    return (
        <section className='d-flex flex-column col-12 col-lg-6'>
            <label>
                What age do you teach?
            </label>
            <section className='d-flex flex-column mt-2'>
                <section>
                    <Button
                        defaultStyleObj={{ borderTopLeftRadius: '.5em', borderBottomLeftRadius: '.5em', width: '100px' }}
                        classNameStr={`py-1 no-btn-styles ${gradesColorCss}`}
                        handleOnClick={handleGradesOrYearsBtnClick(setGradesColorsCss, setYearsColorsCss, 'grades')}
                    >
                        Grades
                    </Button>
                    <Button
                        defaultStyleObj={{ background: '#F2F8FD', width: '100px', borderTopRightRadius: '.5em', borderBottomRightRadius: '.5em' }}
                        classNameStr={`py-1 no-btn-styles ${yearsColorCss}`}
                        handleOnClick={handleGradesOrYearsBtnClick(setYearsColorsCss, setGradesColorsCss, 'years')}
                    >
                        Years
                    </Button>
                </section>
                <section className='d-flex pt-2 ps-2'>
                    {ageGroupOptions.map((ageGroup, index) => {
                        return (
                            <section
                                key={`${selection}-${index}`}
                                className={`d-flex ${(index != 0) ? 'ms-3' : ''}`}
                            >
                                <input
                                    type='checkbox'
                                    name='subject'
                                    value={ageGroup}
                                    onChange={handleCheckboxInputChange}
                                />
                                <span className='ms-1 txt-color-for-aboutme-modal text-nowrap'>
                                    {ageGroup}
                                </span>
                            </section>
                        );
                    })}
                </section>
            </section>
        </section>
    );
};

export default GradesOrYearsSelection;