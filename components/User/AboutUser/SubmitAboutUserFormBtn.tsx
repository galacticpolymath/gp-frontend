/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */

import React from "react";
import { useUserContext } from "../../../providers/UserProvider";
import axios from "axios";
import { useSession } from "next-auth/react";
import { CustomError } from "../../../backend/utils/errors";
import { getIsParsableToVal, sleep } from "../../../globalFns";
import { useModalContext } from "../../../providers/ModalProvider";
import { Button, Spinner } from "react-bootstrap";
import { COUNTRY_NAMES } from "../../../shared/constants";
import {
  IUpdatedAboutUserForm,
  IUserSession,
  TUseStateReturnVal,
} from "../../../types/global";
import { TAboutUserForm } from "../../../backend/models/User/types";

interface IProps {
  setErrors: TUseStateReturnVal<Map<string, string>>[1];
  _wasFormSubmitted: TUseStateReturnVal<boolean>;
  _wasBtnClicked: TUseStateReturnVal<boolean>;
  _subjectsTaughtCustom: TUseStateReturnVal<Map<string, string>>;
  _name: TUseStateReturnVal<{ first: string; last: string }>;
}

const SubmitAboutUserFormBtn = ({
  setErrors,
  _wasBtnClicked,
  _subjectsTaughtCustom,
  _wasFormSubmitted,
  _name,
}: IProps) => {
  const { _aboutUserForm } = useUserContext();
  const [subjectsTaughtCustom] = _subjectsTaughtCustom;
  const [, setWasFormSubmitted] = _wasFormSubmitted;
  const { _notifyModal, _isAboutMeFormModalDisplayed } = useModalContext();
  const { data, update } = useSession();
  const [aboutUserForm] = _aboutUserForm;
  const [wasBtnClicked, setWasBtnClicked] = _wasBtnClicked;

  const [name] = _name;
  const [, setIsAboutUserModalDisplayed] = _isAboutMeFormModalDisplayed;
  const [, setNotifyModal] = _notifyModal;
  const { user, token } = (data ?? {}) as IUserSession;

  const handleSubmitBtnClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    setWasBtnClicked(true);

    await sleep(200);

    try {
      if (!user?.email) {
        throw new CustomError(
          "Email is not present.",
          undefined,
          "emailNotPresent"
        );
      }

      let aboutUserFormClone = structuredClone(aboutUserForm) as TAboutUserForm<
        Map<string, string> | object
      > & { isTeacherConfirmed?: boolean };
      let {
        country,
        zipCode,
        siteVisitReasonsCustom,
        siteVisitReasonsDefault,
        classSize,
        isNotTeaching,
        gradesTaught,
        gradesType,
        subjectsTaughtDefault,
        occupation,
        isTeacher,
        isTeacherConfirmed,
        institution,
        schoolTypeDefaultSelection,
        schoolTypeOther,
      } = aboutUserFormClone;
      const errors = new Map();

      if (name.first.trim().length === 0) {
        errors.set("firstName", "*This field is required.");
      }

      if (name.last.trim().length === 0) {
        errors.set("lastName", "*This field is required.");
      }

      aboutUserFormClone = {
        ...aboutUserFormClone,
        firstName: name.first,
        lastName: name.last,
      };

      if (
        isTeacher &&
        typeof institution === "string" &&
        institution.trim().length === 0
      ) {
        errors.set("institution", "This field is required.");
      }

      if (
        (!schoolTypeDefaultSelection && !schoolTypeOther) ||
        (schoolTypeOther?.length && schoolTypeOther?.trim().length === 0) ||
        (schoolTypeDefaultSelection?.length &&
          schoolTypeDefaultSelection?.trim().length === 0)
      ) {
        errors.set("schoolType", "This field is required.");
      }

      console.log("subjectsTaughtCustom, sup there: ", subjectsTaughtCustom);

      if (!gradesType) {
        errors.set(
          "gradesOrYears",
          "Please select either 'U.S.' or 'Outside U.S.'"
        );
      }

      if (!gradesTaught?.length) {
        errors.set("gradesOrYears", "Please select atleast one grade or year.");
      }

      if (gradesType && !["Outside U.S.", "U.S."].includes(gradesType)) {
        errors.set(
          "gradesOrYears",
          "*Invalid selection. Please refresh the page and try again."
        );
      }

      if (!isTeacher) {
        aboutUserFormClone.classSize = 0;
        aboutUserFormClone.isNotTeaching = true;
      }

      if (siteVisitReasonsDefault?.length) {
        aboutUserFormClone = {
          ...aboutUserFormClone,
          siteVisitReasonsDefault: siteVisitReasonsDefault,
        };
      }

      if (siteVisitReasonsCustom?.length) {
        aboutUserFormClone = {
          ...aboutUserFormClone,
          siteVisitReasonsCustom,
        };
      }

      const zipCodeStr =
        typeof zipCode === "string" && Number.isInteger(+zipCode)
          ? zipCode.trim()
          : "";

      if (isTeacher && !isTeacherConfirmed) {
        errors.set("isTeacherConfirmationErr", "*This field is required.");
      }

      if (
        country?.toLowerCase() === "united states" &&
        (!zipCodeStr || zipCodeStr?.length == 0)
      ) {
        errors.set("zipCode", "This field is required.");
      } else if (
        country.toLowerCase() === "united states" &&
        ((typeof zipCode === "number" && zipCode < 0) ||
          (typeof zipCode === "string" && parseInt(zipCode) < 0))
      ) {
        errors.set("zipCode", "Cannot be a negative number.");
      } else if (
        country.toLowerCase() === "united states" &&
        ((zipCodeStr?.length > 0 && zipCodeStr?.length < 5) ||
          zipCodeStr.length > 5)
      ) {
        errors.set("zipCode", "Invalid zip code. Must be 5 digits.");
      }

      if (!occupation || occupation?.length <= 0) {
        errors.set("occupation", "*This field is required.");
      }

      if (country?.length <= 0) {
        errors.set("country", "*This field is required.");
      } else if (!COUNTRY_NAMES.has(country)) {
        errors.set("country", "*Invalid country name.");
      }

      if (isTeacher && !isNotTeaching && !classSize) {
        errors.set(
          "classroomSize",
          "This field is required. Must be greater than 0."
        );
      }

      if (
        isTeacher &&
        ((subjectsTaughtCustom.size > 0 &&
          !Array.from(subjectsTaughtCustom).every(
            ([_, subject]) => subject.length > 0
          )) ||
          (subjectsTaughtCustom.size === 0 && !subjectsTaughtDefault?.length))
      ) {
        errors.set("subjects", "*Please enter a subject.");
      }

      if (errors?.size > 0) {
        console.error("ERRORS: ", errors);
        setErrors(errors);

        const errMsg =
          errors.size === 1
            ? "Invalid entry. Please try again"
            : "Invalid entries. Please try again";

        throw new CustomError(errMsg, undefined, "invalidAboutUserForm.");
      }

      const _subjectsTaughtCustom = structuredClone(subjectsTaughtCustom);

      if (
        _subjectsTaughtCustom.has("other-subject-0") &&
        !_subjectsTaughtCustom.has("other-subject-1")
      ) {
        _subjectsTaughtCustom.set("other-subject-1", "");
      }

      if (
        !_subjectsTaughtCustom.has("other-subject-0") &&
        _subjectsTaughtCustom.has("other-subject-1")
      ) {
        _subjectsTaughtCustom.set("other-subject-0", "");
      }

      if (isTeacher && _subjectsTaughtCustom.size) {
        console.log("_subjectsTaughtCustom: ", _subjectsTaughtCustom);
        const subjectsTaughtCustomArr = Array.from(_subjectsTaughtCustom);

        subjectsTaughtCustomArr.sort(
          (subjectsKeyValAPair, subjectsKeyValBPair) =>
            subjectsKeyValAPair[0].localeCompare(subjectsKeyValBPair[0])
        );

        const subjectsTaughtCustomArrForServer = subjectsTaughtCustomArr.map(
          (subject) => subject[1].trim()
        );

        aboutUserFormClone = {
          ...aboutUserFormClone,
          subjectsTaughtCustom: subjectsTaughtCustomArrForServer,
        };
      } else if (isTeacher && !_subjectsTaughtCustom.size) {
        aboutUserFormClone = {
          ...aboutUserFormClone,
          subjectsTaughtCustom: [],
        };
      }

      if (country?.toLowerCase() === "united states") {
        aboutUserFormClone = {
          ...aboutUserFormClone,
          zipCode:
            typeof zipCode === "number"
              ? zipCode.toString()
              : (zipCode as string),
        };
      }

      console.log("aboutUserFormClone: ", aboutUserFormClone);

      const responseBody: IUpdatedAboutUserForm = {
        aboutUserForm: aboutUserFormClone,
      };

      const response = await axios.put(
        `${window.location.origin}/api/save-about-user-form`,
        responseBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200) {
        throw new CustomError(
          "Failed to save form. Refresh the page, and try again.",
          undefined,
          "aboutUserFormReqFailure"
        );
      }

      setWasFormSubmitted(true);
      const userAccountParsable = localStorage.getItem("userAccount");
      const userAccount =
        typeof userAccountParsable === "string" &&
        getIsParsableToVal(userAccountParsable, "object")
          ? JSON.parse(userAccountParsable)
          : {};
      aboutUserFormClone = {
        ...userAccount,
        ...aboutUserFormClone,
      };
      console.log("aboutUserFormClone: ", aboutUserFormClone);
      localStorage.setItem("userAccount", JSON.stringify(aboutUserFormClone));
      setErrors(new Map());
      setTimeout(() => {
        setIsAboutUserModalDisplayed(false);
        setWasBtnClicked(false);
        setNotifyModal({
          isDisplayed: true,
          bodyTxt: "",
          headerTxt: "Form Saved! Thank you!",
          handleOnHide: () => {},
        });
        update();
      }, 300);
    } catch (error) {
      console.error("error: ", error);
      const { message, response } = (error ?? {}) as {
        message: string;
        response: any;
      };

      console.error(
        "An error has occurred. Couldn't update the 'About User' form. Reason: ",
        error
      );

      alert(
        message
          ? `${response ? "From server:" : ""} ${message}. ${
              response?.data ?? ""
            }`
          : "Failed to save your changes. Please refresh the page and try again."
      );
      setWasBtnClicked(false);
    }
  };
  return (
    <Button
      onClick={handleSubmitBtnClick}
      className="mt-2 no-btn-styles text-white p-2 rounded "
      style={{
        width: "150px",
        backgroundColor: wasBtnClicked ? "grey" : "#4C96CC",
      }}
    >
      {wasBtnClicked ? (
        <Spinner size="sm" className="text-white" />
      ) : (
        <span>SUBMIT & SAVE</span>
      )}
    </Button>
  );
};

export default SubmitAboutUserFormBtn;
