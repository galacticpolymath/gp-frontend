/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
import { useContext } from 'react';
import Button from '../../../General/Button';
import { UserContext } from '../../../../providers/UserProvider';

const AGE_GROUPS_FIELD_U_S = 'U.S.';
const AGE_GROUPS_FIELD_NON_U_S = 'Outside U.S.';
const AGE_GROUPS = {
    [AGE_GROUPS_FIELD_U_S]: ['K-4', '5', '6', '7', '8', '9', '10', '11', '12','College/Univ.'],
    [AGE_GROUPS_FIELD_NON_U_S]: ['1-5', '6', '7', '8', '9', '10', '11', '12', '13', 'University'],
};

const GradesOrYearsSelection = () => {
    const { _aboutUserForm } = useContext(UserContext);
    const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
    const { selection, ageGroupsTaught } = aboutUserForm.gradesOrYears;
    /** @type {[import('../../../../providers/ModalProvider').TUserForm, Function]} */
    const ageGroupOptions = AGE_GROUPS[selection ?? 'U.S.'];

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

    return (
        <section className='d-flex flex-column col-12 col-lg-6'>
            <label>
                What age do you teach?
            </label>
            <section className='d-flex flex-column mt-2'>
                <section className='d-flex flex-sm-row flex-column'>
                    <Button
                        defaultStyleObj={{
                            width: '155px',
                        }}
                        classNameStr={`py-1 grades-or-years-usa-btn no-btn-styles ${selection === AGE_GROUPS_FIELD_U_S ? 'selected-grade-or-years-opt' : ''}`}
                        handleOnClick={handleGradesOrYearsBtnClick(AGE_GROUPS_FIELD_U_S)}
                        isDisabled={selection === AGE_GROUPS_FIELD_U_S}
                    >
                        {AGE_GROUPS_FIELD_U_S}
                    </Button>
                    <Button
                        classNameStr={`py-1 grades-or-years-non-usa-btn no-btn-styles ${!selection ? 'grades-or-years-non-usa-btn-unselected' : ''} ${selection === AGE_GROUPS_FIELD_NON_U_S ? 'selected-grade-or-years-opt' : ''}`}
                        handleOnClick={handleGradesOrYearsBtnClick(AGE_GROUPS_FIELD_NON_U_S)}
                        isDisabled={selection === AGE_GROUPS_FIELD_NON_U_S}
                    >
                        {AGE_GROUPS_FIELD_NON_U_S}
                    </Button>
                </section>
                <section style={{ maxWidth: '300px' }} className='d-flex pt-2 ps-2 flex-wrap flex-column flex-sm-row'>
                    {ageGroupOptions.map((ageGroup, index) => {
                        return (
                            <section
                                key={`${selection}-${index}`}
                                className={`d-flex mt-1 mt-sm-0 ms-2 ${(index != 0) ? '' : ''}`}
                                style={{ width: '45px' }}
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