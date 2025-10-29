/* eslint-disable quotes */

import React from "react";
import { TAboutUserFormForUI } from "../../../../providers/UserProvider";
import { TUseStateReturnVal } from "../../../../types/global";
import { TDefaultSubject } from "../../../../backend/models/User/types";

interface IProps {
  subject: string;
  customCssClassses?: string;
  index?: number;
  subjectFieldNameForMapTracker: string;
  //   _errors: [Map<string, string>, (errors: Map<string, string>) => void];
  _errors: TUseStateReturnVal<Map<string, string>>;
  _aboutUserForm: TUseStateReturnVal<TAboutUserFormForUI>;
  _subjectsTaughtCustom: TUseStateReturnVal<Map<string, string>>;
  totalSubjects: number;
}

const SubjectOption = ({
  subject,
  customCssClassses = "",
  subjectFieldNameForMapTracker,
  _errors,
  _aboutUserForm,
  index,
  _subjectsTaughtCustom,
}: IProps) => {
  const [errors, setErrors] = _errors;
  const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
  const [subjectsTaughtCustom, setSubjectsTaughtCustom] = _subjectsTaughtCustom;
  let isChecked = aboutUserForm?.subjects?.has(subjectFieldNameForMapTracker);

  if (subject !== "other:" && aboutUserForm?.subjectsTaughtDefault) {
    isChecked = aboutUserForm?.subjectsTaughtDefault.includes(
      subject as TDefaultSubject
    );
  } else if (subject === "other:" && aboutUserForm?.subjectsTaughtCustom) {
    isChecked = subjectsTaughtCustom.has(`other-subject-${index}`);
  }

  const handleCheckboxOnchange = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = target;

    setErrors((state) => {
      const stateClone = structuredClone(state);

      if (stateClone.has("subjects")) {
        stateClone.delete("subjects");
      }

      return stateClone;
    });

    if (value.toLowerCase() === "other:") {
      setSubjectsTaughtCustom((state) => {
        const clone = structuredClone(state);

        if (clone.has(`other-subject-${index}`)) {
          clone.delete(`other-subject-${index}`);

          return clone;
        }

        clone.set(`other-subject-${index}`, "");

        return clone;
      });
      return;
    }

    setAboutUserForm((state) => {
      const _val = value as TDefaultSubject;

      if (state.subjectsTaughtDefault?.includes(_val)) {
        return {
          ...state,
          subjectsTaughtDefault: state?.subjectsTaughtDefault?.filter(
            (subject) => subject !== _val
          ),
        };
      }

      return {
        ...state,
        subjectsTaughtDefault: state?.subjectsTaughtDefault
          ? [...state.subjectsTaughtDefault, _val]
          : [_val],
      };
    });
  };

  const handleOnTxtInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (errors.has("subjects")) {
      const errorsClone = structuredClone(errors);

      errorsClone.delete("subjects");

      setErrors(errorsClone);
    }

    setSubjectsTaughtCustom((state) => {
      const stateClone = structuredClone(state);

      stateClone.set(`other-subject-${index}`, event.target.value);

      return stateClone;
    });
  };

  let otherSubject = aboutUserForm?.subjects?.get(
    subjectFieldNameForMapTracker
  );

  console.log(
    "aboutUserForm?.subjectsTaughtCustom: ",
    aboutUserForm?.subjectsTaughtCustom
  );

  if (subjectsTaughtCustom && subject === "other:") {
    otherSubject = subjectsTaughtCustom.get(`other-subject-${index}`) ?? "";
  }

  return (
    <div className={`d-flex flex-column ${customCssClassses}`}>
      <section className="d-flex">
        <input
          type="checkbox"
          name={subjectFieldNameForMapTracker}
          value={subject}
          onChange={handleCheckboxOnchange}
          checked={isChecked}
          className="pointer"
        />
        <span className="capitalize ms-1 txt-color-for-aboutme-modal text-nowrap">
          {subject}
        </span>
      </section>
      {subject === "other:" && (
        <input
          placeholder="Enter subject."
          className={`aboutme-txt-input no-outline pointer ${
            !isChecked ? "opacity-25" : ""
          }`}
          style={{ maxWidth: "250px" }}
          disabled={!isChecked}
          value={otherSubject}
          name={subjectFieldNameForMapTracker}
          onChange={handleOnTxtInputChange}
        />
      )}
    </div>
  );
};

export default SubjectOption;
