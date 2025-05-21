/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */

import React from 'react';
import Button from '../../../General/Button';
import {
  TAboutUserFormForUI,
} from '../../../../providers/UserProvider';
import { ErrorTxt } from '../../formElements';
import { TUseStateReturnVal } from '../../../../types/global';
import { TAgeGroupSelection } from '../../../../backend/models/User/types';

const AGE_GROUPS_FIELD_U_S = 'U.S.';
const AGE_GROUPS_FIELD_NON_U_S = 'Outside U.S.';
const AGE_GROUPS = {
  [AGE_GROUPS_FIELD_U_S]: [
    'K-4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    'College/Univ.',
  ],
  [AGE_GROUPS_FIELD_NON_U_S]: [
    '1-5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    'University',
  ],
};

interface IProps {
  _aboutUserForm: TUseStateReturnVal<TAboutUserFormForUI>;
  _errors: TUseStateReturnVal<Map<string, string>>;
}

const GradesOrYearsSelection = ({ _errors, _aboutUserForm }: IProps) => {
  const [errors, setErrors] = _errors;
  const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
  let ageGroupOptions: string[] = AGE_GROUPS['U.S.'];
  let { selection, ageGroupsTaught } = aboutUserForm.gradesOrYears ?? {};

  if (aboutUserForm.gradesTaught) {
    ageGroupsTaught = aboutUserForm.gradesTaught;
  }

  if (
    aboutUserForm.gradesType === 'Outside U.S.' ||
    aboutUserForm.gradesType === 'U.S.'
  ) {
    ageGroupOptions = AGE_GROUPS[aboutUserForm.gradesType];
    selection = aboutUserForm.gradesType;
  } else if (aboutUserForm.gradesOrYears) {
    ageGroupOptions =
      AGE_GROUPS[
        selection && Object.keys(AGE_GROUPS).includes(selection)
          ? selection
          : 'U.S.'
      ];
  }

  const handleGradesOrYearsBtnClick =
    (gradesOrYearsSelectedOptName: TAgeGroupSelection) => () => {
      setErrors((state) => {
        const errorsClone = structuredClone(state);

        if (errorsClone.has('gradesOrYears')) {
          errorsClone.delete('gradesOrYears');
        }

        return errorsClone;
      });

      setAboutUserForm((state) => ({
        ...state,
        gradesType: gradesOrYearsSelectedOptName,
        gradesTaught: [],
      }));
    };

  const handleCheckboxInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value: selectedAgeGroup } = event.target;

    setErrors((state) => {
      const errorsClone = structuredClone(state);

      if (errorsClone.has('gradesOrYears')) {
        errorsClone.delete('gradesOrYears');
      }

      return errorsClone;
    });

    if (!ageGroupOptions.includes(selectedAgeGroup)) {
      console.error('Error: Invalid age group selected');
      return;
    }

    setAboutUserForm((state) => {
      const gradesTaught = new Set(state.gradesTaught);

      if (gradesTaught.has(selectedAgeGroup)) {
        gradesTaught.delete(selectedAgeGroup);

        return {
          ...state,
          gradesTaught: Array.from(gradesTaught),
        };
      }

      gradesTaught.add(selectedAgeGroup);

      return {
        ...state,
        gradesTaught: Array.from(gradesTaught),
      };
    });
  };

  return (
    <section className='d-flex flex-column col-12 col-lg-6'>
      <label className={`${errors.get('gradesOrYears') ? 'text-danger' : ''}`}>
        *What age do you teach?
      </label>
      <span
        style={{ fontSize: '16px' }}
        className={`${errors.get('gradesOrYears') ? 'text-danger' : ''}`}
      >
        <i>
          Sharing a few more details helps us understand our users and keep
          resources free!
        </i>
      </span>
      <section className='d-flex flex-column mt-2'>
        <section className='d-flex flex-sm-row flex-column'>
          <Button
            defaultStyleObj={{
              width: '155px',
            }}
            classNameStr={`py-1 grades-or-years-usa-btn d-flex flex-column justify-content-center align-items-center no-btn-styles ${
              selection === AGE_GROUPS_FIELD_U_S
                ? 'selected-grade-or-years-opt'
                : ''
            }`}
            handleOnClick={handleGradesOrYearsBtnClick(AGE_GROUPS_FIELD_U_S)}
            isDisabled={selection === AGE_GROUPS_FIELD_U_S}
          >
            <span>{AGE_GROUPS_FIELD_U_S}</span>
            <span>(Grades)</span>
          </Button>
          <Button
            classNameStr={`py-1 d-flex flex-column justify-content-center align-items-center grades-or-years-non-usa-btn no-btn-styles ${
              !selection ||
              (selection && !Object.keys(AGE_GROUPS).includes(selection))
                ? 'grades-or-years-non-usa-btn-unselected'
                : ''
            } ${
              selection === AGE_GROUPS_FIELD_NON_U_S
                ? 'selected-grade-or-years-opt'
                : ''
            }`}
            handleOnClick={handleGradesOrYearsBtnClick(
              AGE_GROUPS_FIELD_NON_U_S
            )}
            isDisabled={selection === AGE_GROUPS_FIELD_NON_U_S}
          >
            <span>{AGE_GROUPS_FIELD_NON_U_S}</span>
            <span>(Years)</span>
          </Button>
        </section>
        <section
          style={{ maxWidth: '300px' }}
          className='d-flex pt-2 ps-2 flex-wrap flex-column flex-sm-row'
        >
          {!!ageGroupOptions?.length &&
            ageGroupOptions.map((ageGroup, index) => {
              return (
                <section
                  key={`${selection}-${index}`}
                  className={`d-flex mt-1 mt-sm-0 ms-2 ${index != 0 ? '' : ''}`}
                  style={{ width: '45px' }}
                >
                  <input
                    type='checkbox'
                    name='subject'
                    value={ageGroup}
                    onChange={handleCheckboxInputChange}
                    checked={ageGroupsTaught?.includes(ageGroup)}
                    disabled={!selection}
                  />
                  <span
                    style={{ opacity: !selection ? 0.3 : 1 }}
                    className='ms-1 txt-color-for-aboutme-modal text-nowrap'
                  >
                    {ageGroup}
                  </span>
                </section>
              );
            })}
        </section>
        <section className='error-txt-about-user-container'>
          <ErrorTxt>{errors.get('gradesOrYears') ?? ''}</ErrorTxt>
        </section>
      </section>
    </section>
  );
};

export default GradesOrYearsSelection;