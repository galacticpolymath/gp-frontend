/* eslint-disable no-unused-vars */

import React,{ ChangeEvent } from 'react';
import {
  SCHOOL_TYPES,
  TAboutUserFormForUI,
  TSchoolType,
} from '../../../../providers/UserProvider';
import { REFERRED_BY_OPTS } from '../../../../shared/constants';
import { TReferredByOpt } from '../../../../types/global';
import { ErrorsSec } from '../AboutUserModal';

export type TAboutUserFormSelectedField =
  | Extract<
      keyof TAboutUserFormForUI,
      'reasonsForSiteVisit' | 'schoolTypeDefaultSelection'
    >
  | 'referredBy';

interface IPropsFns {
  handleFocusRelatedEvent: (isInputFocused: boolean) => () => void;
  handleCheckBoxToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleTextAreaOnChange: (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleOtherInputToggle: (event: ChangeEvent<HTMLInputElement>) => void;
}

interface IProps extends IPropsFns {
  options: typeof SCHOOL_TYPES | typeof REFERRED_BY_OPTS;
  sectionLabelTxt: string;
  aboutUserFormSelectedField: TAboutUserFormSelectedField;
  errMsg?: string;
  aboutUserForm: TAboutUserFormForUI;
  checkBoxNamePrefix: string;
  isTextAreaDisabled: boolean;
  isErrorsSecDisplayed: boolean;
  textareaVal: string;
  textareaId: string;
  textareaName: string;
  className?: string;
}

export type TArgs = {
  schoolTypeDefaultSelection: TSchoolType;
  reasonsForSiteVisit: string;
  referredBy: TReferredByOpt;
};

export type TIsCheckedDeterminerFnsCache = {
  schoolTypeDefaultSelection: (opt: string) => boolean;
  reasonsForSiteVisit: (name: string) => boolean;
  referredBy: (opt: string) => boolean;
} | null;

const CheckBoxesAndOther = ({
  options,
  errMsg,
  isErrorsSecDisplayed,
  sectionLabelTxt,
  aboutUserFormSelectedField,
  aboutUserForm,
  checkBoxNamePrefix,
  handleCheckBoxToggle,
  handleTextAreaOnChange,
  handleFocusRelatedEvent,
  handleOtherInputToggle,
  isTextAreaDisabled,
  textareaVal,
  textareaId,
  textareaName,
  className = 'd-flex flex-column mt-2 mt-4 mt-lg-3',
}: IProps) => {
  let isCheckedDeterminerFnsCache: TIsCheckedDeterminerFnsCache | null = null;

  return (
    <section className={className}>
      <label
        htmlFor='reasonsForSiteVisit'
        className={`${errMsg ? 'text-danger' : ''}`}
      >
        {sectionLabelTxt}
      </label>
      <section className='d-flex flex-column flex-lg-row ps-2'>
        {options.map((opt, index) => {
          const name = `${checkBoxNamePrefix}-${index}`;
          const args: TArgs = {
            reasonsForSiteVisit: name,
            referredBy: opt as TReferredByOpt,
            schoolTypeDefaultSelection: opt as TSchoolType,
          };

          if (!isCheckedDeterminerFnsCache) {
            isCheckedDeterminerFnsCache = {
              schoolTypeDefaultSelection: (opt: string) => {
                return aboutUserForm.schoolTypeDefaultSelection === opt;
              },
              reasonsForSiteVisit: (name: string) => {
                return aboutUserForm.reasonsForSiteVisit &&
                  aboutUserForm.reasonsForSiteVisit instanceof Map
                  ? aboutUserForm.reasonsForSiteVisit.has(name)
                  : false;
              },
              referredBy: (opt: string) => {
                return aboutUserForm.referredByDefault === opt;
              },
            };
          }

          const getIsCheckedDeterminerFnsCache =
            isCheckedDeterminerFnsCache?.[aboutUserFormSelectedField] ?? null;
          const arg = args?.[aboutUserFormSelectedField] ?? null;

          if (!getIsCheckedDeterminerFnsCache || !arg) {
            console.error(
              'Unable to get function from \'isCheckedDeterminerFnsCache\'.'
            );

            return null;
          }

          return (
            <div
              key={index}
              className={`d-flex mt-2 mt-sm-0 ${index === 0 ? '' : 'ms-lg-3'}`}
            >
              <input
                type='checkbox'
                value={opt}
                name={name}
                onChange={handleCheckBoxToggle}
                checked={getIsCheckedDeterminerFnsCache(arg)}
              />
              <span className='capitalize ms-1'>{opt}</span>
            </div>
          );
        })}
      </section>
      <section className='d-flex flex-column ps-2'>
        <section className='d-flex'>
          <input
            type='checkbox'
            name='subject'
            className='pointer'
            onChange={handleOtherInputToggle}
            checked={!isTextAreaDisabled}
          />
          <span className='ms-1'>Other:</span>
        </section>
        <textarea
          disabled={isTextAreaDisabled}
          id={textareaId}
          name={textareaName}
          style={{
            outline: 'none',
            height: '115px',
          }}
          className={`${
            isTextAreaDisabled ? 'opacity-25' : 'opacity-100'
          } rounded about-me-input-border about-user-textarea p-1 mt-2`}
          placeholder='Your response...'
          value={textareaVal}
          onChange={handleTextAreaOnChange}
          onFocus={handleFocusRelatedEvent(true)}
          onBlur={handleFocusRelatedEvent(false)}
        />
      </section>
      {isErrorsSecDisplayed && <ErrorsSec errMsg={errMsg ?? ''} />}
    </section>
  );
};

export default CheckBoxesAndOther;