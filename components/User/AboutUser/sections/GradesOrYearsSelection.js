/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
import { useContext, useEffect } from 'react';
import Button from '../../../General/Button';
import { UserContext } from '../../../../providers/UserProvider';

const AGE_GROUPS = {
    grades: ['5-12', '4 year college/univ.'],
    years: ['6-13'],
};

const GradesOrYearsSelection = () => {
    const { _aboutUserForm } = useContext(UserContext);
    const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
    const { selection, ageGroupsTaught } = aboutUserForm.gradesOrYears;
    /** @type {[import('../../../../providers/ModalProvider').TUserForm, Function]} */
    const ageGroupOptions = AGE_GROUPS[selection ?? 'grades'];

    useEffect(() => {
        console.log('selection, sup there: ', selection);
    });

    const handleGradesOrYearsBtnClick = gradesOrYearsSelectedOptName => () => {
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

    console.log('yo meng!');

    return (
        <section className='d-flex flex-column col-12 col-lg-6'>
            <label>
                What age do you teach?
            </label>
            <section className='d-flex flex-column mt-2'>
                <section>
                    <Button
                        defaultStyleObj={{
                            borderTopLeftRadius: '.5em',
                            borderBottomLeftRadius: '.5em',
                            width: '100px',
                            borderTop: selection !== 'grades' ? 'solid grey 1px' : '',
                            borderLeft: selection !== 'grades' ? 'solid grey 1px' : '',
                            borderBottom: selection !== 'grades' ? 'solid grey 1px' : '',
                        }}
                        classNameStr={`py-1 no-btn-styles ${selection === 'grades' ? 'selected-grade-or-years-opt' : ''}`}
                        handleOnClick={handleGradesOrYearsBtnClick('grades')}
                        isDisabled={selection === 'grades'}
                    >
                        Grades
                    </Button>
                    <Button
                        defaultStyleObj={{
                            width: '100px',
                            borderTopRightRadius: '.5em',
                            borderBottomRightRadius: '.5em',
                            borderTop: selection !== 'years' ? 'solid grey 1px' : '',
                            borderRight: selection !== 'years' ? 'solid grey 1px' : '',
                            borderBottom: selection !== 'years' ? 'solid grey 1px' : '',
                        }}
                        classNameStr={`py-1 no-btn-styles ${selection === 'years' ? 'selected-grade-or-years-opt' : ''}`}
                        handleOnClick={handleGradesOrYearsBtnClick('years')}
                        isDisabled={selection === 'years'}
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
                                    checked={ageGroupsTaught.includes(ageGroup)}
                                    disabled={!selection}
                                />
                                <span style={{ opacity: !selection ? .3 : 1 }} className='ms-1 txt-color-for-aboutme-modal text-nowrap'>
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