/* eslint-disable no-unused-vars */

import React from 'react';
import { TAboutUserFormForUI } from '../../../../providers/UserProvider';
import { TUseStateReturnVal } from '../../../../types/global';
import { ErrorsSec } from '../AboutUserModal';
import InputAndRadioBtn from '../components/InputAndRadioBtn';

interface IProps {
  _aboutUserForm: TUseStateReturnVal<TAboutUserFormForUI>;
  _errors: TUseStateReturnVal<Map<string, string>>;
  handleFocusRelatedEvent: (isInputFocused: boolean) => () => void;
  handleOnInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckBoxToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InstitutionAndSchoolType = ({
  _aboutUserForm,
  _errors,
  handleFocusRelatedEvent,
  handleOnInputChange,
  handleCheckBoxToggle,
}: IProps) => {
  const [errors, setErrors] = _errors;
  const [aboutUserForm, setAboutUserForm] = _aboutUserForm;

  const handleIsTeachingInputToggle = () => {
    setErrors((state) => {
      const stateClone = structuredClone(state);

      stateClone.delete('classroomSize');

      return stateClone;
    });

    setAboutUserForm((state) => ({
      ...state,
      isNotTeaching: !state.isNotTeaching,
    }));
  };

  const handleOnClassRoomSizeInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const num = Number.isInteger(+event.target.value)
      ? Number.parseInt(event.target.value)
      : 0;

    setErrors((state) => {
      const stateClone = structuredClone(state);

      stateClone.delete('classroomSize');

      return stateClone;
    });

    setAboutUserForm((state) => ({
      ...state,
      classSize: num <= 0 ? 0 : parseInt(event.target.value),
    }));
  };

  const isNotTeaching =
    typeof aboutUserForm.isNotTeaching === 'boolean'
      ? aboutUserForm.isNotTeaching
      : !!aboutUserForm.classroomSize.isNotTeaching;
  const classSize =
    typeof aboutUserForm.classSize === 'number'
      ? aboutUserForm.classSize
      : aboutUserForm.classroomSize.num ?? 0;

  return (
    <section className='d-flex flex-column col-12 col-lg-6 mt-2 mt-sm-0'>
      <InputAndRadioBtn
        inputType='text'
        checkBoxName='institution'
        isChecked={aboutUserForm.institution == null}
        checkBoxVal={aboutUserForm.institution ?? 'N/A'}
        containerClassName='d-flex flex-column mt-4'
        ErrSec={<ErrorsSec errMsg={errors.get('institution') ?? ''} />}
        didErr={errors.has('institution')}
        aboutUserForm={aboutUserForm}
        checkboxLabelTxt='None'
        handleFocusRelatedEvent={handleFocusRelatedEvent}
        handleOnInputChange={handleOnInputChange}
        handleOnCheckBoxChange={handleCheckBoxToggle}
        inputLabelTxt='*School/Institution'
        inputVal={aboutUserForm.institution ?? 'N/A'}
        inputName='institution'
      />
      <InputAndRadioBtn
        inputType={isNotTeaching ? 'text' : 'number'}
        checkBoxVal={JSON.stringify(isNotTeaching)}
        isChecked={isNotTeaching}
        checkBoxName='isNotTeaching'
        containerClassName='d-flex flex-column'
        didErr={errors.has('classroomSize')}
        ErrSec={<ErrorsSec errMsg={errors.get('classroomSize') ?? ''} />}
        aboutUserForm={aboutUserForm}
        checkboxLabelTxt={'I\'m not teaching.'}
        handleFocusRelatedEvent={handleFocusRelatedEvent}
        handleOnInputChange={handleOnClassRoomSizeInputChange}
        handleOnCheckBoxChange={handleIsTeachingInputToggle}
        inputLabelTxt='*How many students do you teach?'
        inputVal={
          isNotTeaching ? 'N/A' : classSize == 0 ? '' : classSize.toString()
        }
        inputName='classroomSize'
      />
    </section>
  );
};

export default InstitutionAndSchoolType;