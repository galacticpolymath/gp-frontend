/* eslint-disable no-unused-vars */

import React, { JSX } from 'react';
import { TInputType } from '../../../../types/global';
import { TAboutUserFormForUI } from '../../../../providers/UserProvider';

interface IProps {
  didErr: boolean;
  aboutUserForm: TAboutUserFormForUI;
  inputType: TInputType;
  inputLabelTxt: string;
  checkboxLabelTxt: string;
  inputName: string;
  inputVal: string;
  checkBoxVal: string;
  checkBoxName: string;
  containerClassName: string;
  isChecked: boolean;
  ErrSec?: JSX.Element;
  handleOnInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleOnCheckBoxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFocusRelatedEvent: (isInputFocused: boolean) => () => void;
}

const InputAndRadioBtn = ({
  containerClassName,
  didErr,
  inputLabelTxt,
  checkboxLabelTxt,
  handleOnInputChange,
  checkBoxName,
  isChecked,
  inputType,
  checkBoxVal,
  handleOnCheckBoxChange,
  handleFocusRelatedEvent,
  ErrSec,
  inputName,
  inputVal,
}: IProps) => {
  return (
    <section className={containerClassName}>
      <label
        className={`${didErr ? 'text-danger' : ''}`}
        style={{ lineHeight: '25px' }}
      >
        {inputLabelTxt}
      </label>
      <input
        type={inputType}
        className={`${
          isChecked ? 'opacity-25' : ''
        } aboutme-txt-input no-outline mt-1`}
        name={inputName}
        value={inputVal}
        disabled={isChecked}
        onChange={handleOnInputChange}
        style={{
          maxWidth: '200px',
          opacity: isChecked ? 0.3 : 1,
        }}
        onFocus={handleFocusRelatedEvent(true)}
        onBlur={handleFocusRelatedEvent(false)}
      />
      <section className='mt-1'>
        <input
          value={checkBoxVal}
          checked={isChecked}
          type='checkbox'
          name={checkBoxName}
          onChange={handleOnCheckBoxChange}
          onFocus={handleFocusRelatedEvent(true)}
          onBlur={handleFocusRelatedEvent(false)}
        />
        <label className='fw-normal ms-1 pb-1'>{checkboxLabelTxt}</label>
      </section>
      {ErrSec ?? null}
    </section>
  );
};

export default InputAndRadioBtn;