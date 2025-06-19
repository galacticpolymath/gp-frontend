/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable quotes */
/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import React from "react";
import {
  Accordion,
  Modal,
  ModalBody,
  ModalTitle,
  useAccordionButton,
} from "react-bootstrap";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useModalContext } from "../../../providers/ModalProvider";
import GradesOrYearsSelection from "./sections/GradesOrYearsSelection";
import {
  SCHOOL_TYPES,
  SCHOOL_TYPES_SET,
  TSchoolType,
  TUserAccount,
  useUserContext,
} from "../../../providers/UserProvider";
import CountrySection from "./sections/CountrySection";
import SubjectOption from "./sections/SubjectOption";
import SubmitAboutUserFormBtn from "./SubmitAboutUserFormBtn";
import { CustomCloseButton } from "../../../ModalsContainer";
import { IoIosArrowDown, IoIosArrowUp, IoMdClose } from "react-icons/io";
import { BiCheckbox, BiCheckboxChecked } from "react-icons/bi";
import { ErrorTxt } from "../formElements";
import { useRouter } from "next/router";
import _ from "lodash";
import Link from "next/link";
import { TROUBLE_LOGGING_IN_LINK } from "../../../globalVars";
import CheckBoxInput from "../../CheckBoxInput";
import CheckBoxesAndOther from "./components/CheckBoxesAndOther";
import {
  REFERRED_BY_OPTS,
  REFERRED_BY_OPTS_SET,
} from "../../../shared/constants";
import { TReferredByOpt } from "../../../types/global";
import InstitutionAndSchoolType from "./sections/InstitutionAndSchoolType";
import ReasonsForSiteVisitSec from "./sections/ReasonsForSiteVisitSec";
import { getAboutUserFormForClient } from "../../../customHooks/useGetAboutUserForm";
const INPUT_MAX_WIDTH = "400px";

type TAccordionToggleBtnProps = {
  children?: ReactNode;
  btnClassName?: string;
  eventKey: string;
  handleBtnClick?: () => void;
};

const AccordionToggleBtn = ({
  children = <></>,
  btnClassName = "",
  eventKey,
  handleBtnClick,
}: TAccordionToggleBtnProps) => {
  const handleAccordionToggleBtnClick = useAccordionButton(
    eventKey,
    (event) => {
      event.preventDefault();

      if (typeof handleBtnClick === "function") {
        handleBtnClick();
      }
    }
  );

  return (
    <button
      type="button"
      onClick={handleAccordionToggleBtnClick}
      className={btnClassName}
    >
      {children}
    </button>
  );
};

export const SUBJECTS_OPTIONS = [
  "science",
  "math",
  "english language arts",
  "social studies",
  "STEM",
  "other:",
  "other:",
] as const;

export const ErrorsSec = ({ errMsg }: { errMsg: string }) => (
  <section style={{ height: "28px" }}>
    <ErrorTxt>{errMsg ? `*${errMsg}` : ""}</ErrorTxt>
  </section>
);

const AboutUserModal = () => {
  const { _isAboutMeFormModalDisplayed } = useModalContext();
  const { _aboutUserForm } = useUserContext();
  const [isAboutMeFormModalDisplayed, setIsAboutMeFormModalDisplayed] =
    _isAboutMeFormModalDisplayed;
  const [textareaMaxHeight, setTextareaMaxHeight] = useState(0);
  const [errors, setErrors] = useState(new Map());
  const [, setIsInputFocused] = useState(false);
  const [wasBtnClicked, setWasBtnClicked] = useState(false);
  const router = useRouter();
  const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
  const [subjectsTaughtCustom, setSubjectsTaughtCustom] = useState<
    Map<string, string>
  >(
    new Map([
      ["other-subject-0", ""],
      ["other-subject-1", ""],
    ])
  );

  const createNameDefault = () => {
    if (typeof localStorage === "undefined") {
      return { first: "", last: "" };
    }

    const userAccountSaved = JSON.parse(
      localStorage.getItem("userAccount") ?? "{}"
    );

    return {
      first: userAccountSaved?.firstName ?? userAccountSaved?.name?.first ?? "",
      last: userAccountSaved?.lastName ?? userAccountSaved?.name?.last ?? "",
    } as { first: string; last: string };
  };

  const [name, setName] = useState(createNameDefault());
  const modalBodyRef = useRef<HTMLDivElement>(null);

  const handleOnNameInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    if (errors.has(name)) {
      setErrors((state) => {
        const stateClone = structuredClone(state);

        stateClone.delete(name);

        return stateClone;
      });
    }

    setName((state) => ({
      ...state,
      [name]: value,
    }));
  };

  const handleIsTeacherConfirmationCheckBoxClick = () => {
    if (errors.has("isTeacherConfirmationErr")) {
      setErrors((state) => {
        const stateClone = structuredClone(state);

        stateClone.delete("isTeacherConfirmationErr");

        return stateClone;
      });
    }

    setAboutUserForm((state) => ({
      ...state,
      isTeacherConfirmed: !state.isTeacherConfirmed,
    }));
  };

  const handleFocusRelatedEvent = (isInputFocused: boolean) => () => {
    setIsInputFocused(isInputFocused);
  };

  const [wasFormSubmitted, setWasFormSubmitted] = useState(false);

  const handleOnHide = () => {
    if (wasFormSubmitted) {
      setWasFormSubmitted(false);
      return;
    }

    const userAccountStringified = localStorage.getItem("userAccount");

    if (userAccountStringified) {
      setTimeout(() => {
        const userAccount = JSON.parse(userAccountStringified) as TUserAccount;

        setAboutUserForm(getAboutUserFormForClient(userAccount));
      }, 300);
    }

    setErrors(new Map());

    const _subjectsTaughtCustom = aboutUserForm?.subjectsTaughtCustom?.length
      ? aboutUserForm.subjectsTaughtCustom?.map(
          (subject, index) => [`other-subject-${index}`, subject] as const
        )
      : null;

    setSubjectsTaughtCustom(
      new Map(_subjectsTaughtCustom ? _subjectsTaughtCustom : [])
    );

    setIsAboutMeFormModalDisplayed(false);
  };

  const handleAreYouATeacherBtnClick = () => {
    setAboutUserForm((state) => ({ ...state, isTeacher: !state.isTeacher }));
  };

  const isCheckedUpdaters: { [key: string]: () => typeof aboutUserForm } = {
    institution: () => {
      return {
        ...aboutUserForm,
        institution: aboutUserForm.institution == null ? "" : null,
      };
    },
  };

  const handleCheckBoxToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updateTargetIsCheckedProp = isCheckedUpdaters[event.target.name] as
      | (typeof isCheckedUpdaters)[string]
      | undefined;

    if (!updateTargetIsCheckedProp) {
      console.error(
        `Error: Could not update checkbox state for ${event.target.name}`
      );
      return;
    }

    setErrors((errors) => {
      const errorsClone = structuredClone(errors);

      errorsClone.delete(event.target.name);

      return errorsClone;
    });

    setAboutUserForm(updateTargetIsCheckedProp());
  };

  const handleOnInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (errors.has(name)) {
      const errorsClone = structuredClone(errors);

      errorsClone.delete(name);

      setErrors(errorsClone);
    }

    setAboutUserForm((state) => {
      const stateClone = structuredClone(state);

      _.set(stateClone, name, value);

      return stateClone;
    });
  };

  useEffect(() => {
    if (
      modalBodyRef?.current?.clientHeight &&
      isAboutMeFormModalDisplayed &&
      !textareaMaxHeight
    ) {
      const height = modalBodyRef.current.clientHeight * 0.27;
      setTextareaMaxHeight(height);
    }
  }, [isAboutMeFormModalDisplayed]);

  return (
    <Modal
      show={isAboutMeFormModalDisplayed}
      onHide={handleOnHide}
      onShow={() => {
        setTimeout(() => {
          const url = router.asPath;
          router.replace(url.split("?")[0]);
        }, 250);

        const subjectsTaughtCustomDefault = new Map<string, string>();

        if (aboutUserForm?.subjectsTaughtCustom) {
          for (const index in aboutUserForm.subjectsTaughtCustom) {
            const subjectTaughtCustom =
              aboutUserForm.subjectsTaughtCustom[index];

            if (subjectTaughtCustom) {
              subjectsTaughtCustomDefault.set(
                `other-subject-${index}`,
                subjectTaughtCustom
              );
            }
          }
        } else if (aboutUserForm.subjects) {
          const subjectEntries = Array.from(aboutUserForm.subjects.entries());

          subjectEntries.forEach(([key, val]) => {
            if (key.includes("other-subject")) {
              subjectsTaughtCustomDefault.set(key, val);
            }
          });
        }

        setSubjectsTaughtCustom(subjectsTaughtCustomDefault);

        setName(createNameDefault());
      }}
      dialogClassName="border-0 selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center"
      contentClassName="about-me-modal user-modal-color rounded-0"
    >
      <CustomCloseButton
        className="no-btn-styles position-absolute top-0 end-0 me-2"
        handleOnClick={handleOnHide}
      >
        <IoMdClose color="black" size={28} />
      </CustomCloseButton>
      <ModalTitle
        style={{ maxWidth: "1800px" }}
        className="px-3 txt-color-for-aboutme-modal w-100"
      >
        About Me
      </ModalTitle>
      <ModalBody
        style={{ maxWidth: "1800px" }}
        ref={modalBodyRef}
        className="about-me-modal-body w-100"
      >
        <form className="position-relative  h-100 w-100">
          <section className="row d-flex flex-column flex-lg-row">
            <section className="d-flex flex-column col-12 col-sm-8 col-lg-4">
              <label
                htmlFor="country-input"
                className={`${errors.has("firstName") ? "text-danger" : ""}`}
              >
                *First name:
              </label>
              <input
                name="first"
                onChange={handleOnNameInputChange}
                placeholder="First name"
                value={name.first ?? ""}
                defaultValue={name.first ?? ""}
                style={{ maxWidth: INPUT_MAX_WIDTH }}
                className={`account-settings-input no-outline pt-1 ${
                  errors.has("firstName") ? "text-danger border-danger" : ""
                }`}
              />
              <span
                style={{ height: "25px", fontSize: "16px" }}
                className="text-danger"
              >
                {errors.get("firstName") ?? ""}
              </span>
            </section>
            <section className="d-flex flex-column col-12 col-sm-8 col-lg-4">
              <label
                htmlFor="last-name"
                className={`${errors.has("lastName") ? "text-danger" : ""}`}
              >
                *Last name:
              </label>
              <input
                placeholder="Last name"
                name="last"
                id="last-name"
                value={name.last ?? ""}
                defaultValue={name.last ?? ""}
                onChange={handleOnNameInputChange}
                style={{
                  outline: "none",
                  borderTop: "none",
                  borderRight: "none",
                  borderLeft: "none",
                  maxWidth: INPUT_MAX_WIDTH,
                }}
                className={`account-settings-input pt-1 ${
                  errors.has("lastName") ? "border-danger" : ""
                }`}
              />
              <span
                style={{ height: "25px", fontSize: "16px" }}
                className="text-danger"
              >
                {errors.get("lastName") ?? ""}
              </span>
            </section>
          </section>
          <section className="row d-flex flex-column flex-lg-row mt-2">
            <section className="d-flex flex-column col-12 col-sm-8 col-lg-4">
              <label
                htmlFor="country-input"
                className={`${errors.has("occupation") ? "text-danger" : ""}`}
              >
                *Occupation:
              </label>
              <input
                name="occupation"
                onChange={handleOnInputChange}
                placeholder="What do you do?"
                value={aboutUserForm?.occupation ?? ""}
                onFocus={handleFocusRelatedEvent(true)}
                onBlur={handleFocusRelatedEvent(false)}
                style={{ maxWidth: "400px" }}
                autoFocus={!aboutUserForm?.occupation}
                className={`ms-2 ms-sm-0 aboutme-txt-input no-outline pt-1 ${
                  errors.has("occupation") ? "text-danger border-danger" : ""
                }`}
              />
              <span
                style={{ fontSize: "16px" }}
                className="text-danger ms-2 ms-sm-0"
              >
                {errors.get("occupation") ?? ""}
              </span>
            </section>
            <CountrySection
              setIsInputFocused={setIsInputFocused}
              _errors={[errors, setErrors]}
            />
            <section className="d-flex flex-column col-12 col-sm-8 col-lg-2">
              <label
                htmlFor="zipCode-input"
                className={`${errors.has("zipCode") ? "text-danger" : ""} ${
                  aboutUserForm?.country?.toLowerCase() === "united states"
                    ? ""
                    : "opacity-25"
                }`}
              >
                *Zip Code:
              </label>
              <input
                placeholder="Your zip code"
                type="number"
                name="zipCode"
                id="zipCode-input"
                disabled={
                  aboutUserForm?.country?.toLowerCase() !== "united states"
                }
                value={aboutUserForm?.zipCode ?? ""}
                onChange={handleOnInputChange}
                style={{
                  outline: "none",
                  borderTop: "none",
                  borderRight: "none",
                  borderLeft: "none",
                  borderBottom: errors.has("zipCode")
                    ? "solid 1px red"
                    : "solid 1px grey",
                }}
                onFocus={handleFocusRelatedEvent(true)}
                onBlur={handleFocusRelatedEvent(false)}
                className={`${
                  aboutUserForm?.country?.toLowerCase() !== "united states"
                    ? "opacity-25"
                    : ""
                } aboutme-txt-input pt-1 ms-2 ms-sm-0 ${
                  errors.has("zipCode") ? "border-danger text-danger" : ""
                }`}
              />
              <section style={{ height: "47px" }}>
                <ErrorTxt>{errors.get("zipCode") ?? ""}</ErrorTxt>
              </section>
            </section>
          </section>
          <Accordion activeKey={aboutUserForm.isTeacher ? "0" : ""}>
            <div
              style={{
                border: "3.5px solid #EEB7DA",
                transition: "border .3s",
              }}
              className="px-3 py-2 rounded mt-0 mt-sm-3"
            >
              <div className="d-flex justify-content-between">
                <section className="d-flex flex-column justify-content-center align-items-center w-100">
                  <section className="d-flex col-12  flex-column">
                    <h3>Help us to keep the content free for everyone!</h3>
                    <span>
                      <b>For access to teacher guides</b>, we need to know a bit
                      more about who you are.
                    </span>
                  </section>
                  <section className="col-12 px-lg3">
                    <div
                      style={{ borderBottom: "solid 1.7px lightgrey" }}
                      className="d-flex col-12 position-relative"
                    >
                      <AccordionToggleBtn
                        btnClassName="no-btn-styles pointer"
                        eventKey="0"
                        handleBtnClick={handleAreYouATeacherBtnClick}
                      >
                        {aboutUserForm.isTeacher ? (
                          <BiCheckboxChecked
                            fontSize="21px"
                            className="pointer"
                          />
                        ) : (
                          <BiCheckbox fontSize="21px" className="pointer" />
                        )}
                      </AccordionToggleBtn>
                      <span className="pt-1">I am a teacher.</span>
                      {aboutUserForm.isTeacher ? (
                        <IoIosArrowDown className="position-absolute end-0 bottom-0 mb-1" />
                      ) : (
                        <IoIosArrowUp className="position-absolute end-0 bottom-0 mb-1" />
                      )}
                    </div>
                  </section>
                </section>
              </div>
              <Accordion.Item
                eventKey="0"
                className="p-0 rounded-0 border-0 col-12 px-lg-4"
              >
                <Accordion.Body className="p-0 rounded-0">
                  <section style={{ columnCount: 2 }} className="mt-3 mb-1 row">
                    <GradesOrYearsSelection
                      _errors={[errors, setErrors]}
                      _aboutUserForm={[aboutUserForm, setAboutUserForm]}
                    />
                    <InstitutionAndSchoolType
                      _aboutUserForm={[aboutUserForm, setAboutUserForm]}
                      _errors={[errors, setErrors]}
                      handleFocusRelatedEvent={handleFocusRelatedEvent}
                      handleOnInputChange={handleOnInputChange}
                      handleCheckBoxToggle={handleCheckBoxToggle}
                    />
                  </section>
                  <CheckBoxesAndOther
                    className="d-flex flex-column mt-2"
                    options={SCHOOL_TYPES}
                    aboutUserForm={aboutUserForm}
                    isErrorsSecDisplayed
                    aboutUserFormSelectedField="schoolTypeDefaultSelection"
                    errMsg={errors.get("schoolType")}
                    checkBoxNamePrefix="school-type"
                    isTextAreaDisabled={aboutUserForm.schoolTypeOther == null}
                    textareaVal={aboutUserForm.schoolTypeOther ?? ""}
                    handleFocusRelatedEvent={handleFocusRelatedEvent}
                    handleTextAreaOnChange={(event) => {
                      setErrors((errors) => {
                        const errorsCopy = structuredClone(errors);

                        errorsCopy.delete("schoolType");

                        return errorsCopy;
                      });
                      setAboutUserForm((aboutUserForm) => {
                        return {
                          ...aboutUserForm,
                          schoolTypeOther: event.target.value,
                        };
                      });
                    }}
                    sectionLabelTxt="*School type: "
                    textareaId="school-type-id"
                    textareaName="schoolTypeOther"
                    handleCheckBoxToggle={(event) => {
                      setErrors((errors) => {
                        const errorsCopy = structuredClone(errors);

                        errorsCopy.delete("schoolType");

                        return errorsCopy;
                      });

                      if (
                        !SCHOOL_TYPES_SET.has(event.target.value as TSchoolType)
                      ) {
                        console.error("Invalid selection.");
                        return;
                      }

                      setAboutUserForm((aboutUserForm) => {
                        if (
                          typeof aboutUserForm.schoolTypeDefaultSelection ===
                            "string" &&
                          aboutUserForm.schoolTypeDefaultSelection ===
                            event.target.value
                        ) {
                          return {
                            ...aboutUserForm,
                            schoolTypeOther: null,
                            schoolTypeDefaultSelection: null,
                          };
                        }

                        return {
                          ...aboutUserForm,
                          schoolTypeOther: null,
                          schoolTypeDefaultSelection: event.target
                            .value as TSchoolType,
                        };
                      });
                    }}
                    handleOtherInputToggle={(event) => {
                      setErrors((errors) => {
                        const errorsCopy = structuredClone(errors);

                        errorsCopy.delete("schoolType");

                        return errorsCopy;
                      });

                      setAboutUserForm((aboutUserForm) => {
                        if (!event.target.checked) {
                          return {
                            ...aboutUserForm,
                            schoolTypeOther: null,
                            schoolTypeDefaultSelection: null,
                          };
                        }

                        return {
                          ...aboutUserForm,
                          schoolTypeOther: "",
                          schoolTypeDefaultSelection: null,
                        };
                      });
                    }}
                  />
                  <section className="d-flex flex-column mt-4 mt-lg-3">
                    <label
                      className={`${
                        errors.has("subjects") ? "text-danger" : ""
                      }`}
                    >
                      *Subject(s) Taught:
                    </label>
                    <section className="row d-flex flex-column flex-sm-row ps-2">
                      <div className="pt-1 subjects-taught-container col-12 col-sm-6">
                        {SUBJECTS_OPTIONS.slice(0, 5).map(
                          (subject, index, self) => (
                            <SubjectOption
                              key={index}
                              index={index}
                              _aboutUserForm={_aboutUserForm}
                              _errors={[errors, setErrors]}
                              _subjectsTaughtCustom={[
                                subjectsTaughtCustom,
                                setSubjectsTaughtCustom,
                              ]}
                              subjectFieldNameForMapTracker={`subject-${index}`}
                              customCssClassses={index !== 0 ? "mt-1" : ""}
                              subject={subject}
                              totalSubjects={self.length}
                            />
                          )
                        )}
                        {SUBJECTS_OPTIONS.slice(5).map(
                          (subject, index, self) => {
                            return (
                              <SubjectOption
                                totalSubjects={self.length}
                                key={index}
                                index={index}
                                _aboutUserForm={_aboutUserForm}
                                _subjectsTaughtCustom={[
                                  subjectsTaughtCustom,
                                  setSubjectsTaughtCustom,
                                ]}
                                _errors={[errors, setErrors]}
                                subjectFieldNameForMapTracker={`other-subject-${index}`}
                                customCssClassses={index !== 0 ? "mt-1" : ""}
                                subject={subject}
                              />
                            );
                          }
                        )}
                      </div>
                    </section>
                    <section style={{ height: "28px" }}>
                      <ErrorTxt>{errors.get("subjects") ?? ""}</ErrorTxt>
                    </section>
                  </section>
                  <section className="d-flex flex-column mt-2">
                    <label
                      className={`${
                        errors.has("isTeacherConfirmationErr")
                          ? "text-danger"
                          : ""
                      } pointer`}
                    >
                      *Teacher Confirmation:
                    </label>
                    <section className="ps-2">
                      <CheckBoxInput
                        handleOnTxtClick={() => {
                          setErrors((errors) => {
                            errors.delete("isTeacherConfirmationErr");

                            return errors;
                          });
                          setAboutUserForm((aboutUserForm) => {
                            return {
                              ...aboutUserForm,
                              isTeacherConfirmed:
                                !aboutUserForm.isTeacherConfirmed,
                            };
                          });
                        }}
                        handleCheckboxOnchange={
                          handleIsTeacherConfirmationCheckBoxClick
                        }
                        name="isTeacherConfirmation"
                        isChecked={aboutUserForm.isTeacherConfirmed}
                        txtClassName={`${
                          errors.has("isTeacherConfirmationErr")
                            ? "text-danger"
                            : ""
                        } pointer`}
                        checkBoxInputClassName={`pb-1 me-1 ${
                          errors.has("isTeacherConfirmationErr")
                            ? "border-danger"
                            : ""
                        }`}
                        txtStyle={{ fontSize: "18px" }}
                      >
                        I solemnly swear I{"'"}m not a student just trying to
                        get the answer key🤨
                      </CheckBoxInput>
                    </section>
                    <section style={{ height: "28px" }}>
                      <ErrorTxt>
                        {errors.get("isTeacherConfirmationErr") ?? ""}
                      </ErrorTxt>
                    </section>
                  </section>
                </Accordion.Body>
              </Accordion.Item>
            </div>
          </Accordion>
          <ReasonsForSiteVisitSec
            _aboutUserForm={[aboutUserForm, setAboutUserForm]}
            handleFocusRelatedEvent={handleFocusRelatedEvent}
          />
          <CheckBoxesAndOther
            options={REFERRED_BY_OPTS}
            isErrorsSecDisplayed={false}
            aboutUserForm={aboutUserForm}
            aboutUserFormSelectedField="referredBy"
            checkBoxNamePrefix="referred-by"
            isTextAreaDisabled={aboutUserForm.referredByOther == null}
            textareaVal={aboutUserForm.referredByOther ?? ""}
            handleFocusRelatedEvent={handleFocusRelatedEvent}
            handleTextAreaOnChange={(event) => {
              setAboutUserForm((aboutUserForm) => {
                return {
                  ...aboutUserForm,
                  referredByOther: event.target.value,
                };
              });
            }}
            sectionLabelTxt="How'd you find us? "
            textareaId="reffered-by-other-id"
            textareaName="refferedByOther"
            handleCheckBoxToggle={(event) => {
              setAboutUserForm((aboutUserForm) => {
                if (
                  !REFERRED_BY_OPTS_SET.has(
                    event.target.value as TReferredByOpt
                  )
                ) {
                  console.error(
                    "Error in handleCheckBoxToggle. Received an invalid input. Received: ",
                    event.target.value
                  );

                  return aboutUserForm;
                }

                if (
                  typeof aboutUserForm.referredByDefault === "string" &&
                  aboutUserForm.referredByDefault === event.target.value
                ) {
                  return {
                    ...aboutUserForm,
                    referredByOther: null,
                    referredByDefault: null,
                  };
                }

                return {
                  ...aboutUserForm,
                  referredByOther: null,
                  referredByDefault: event.target.value as TReferredByOpt,
                };
              });
            }}
            handleOtherInputToggle={(event) => {
              setAboutUserForm((aboutUserForm) => {
                if (!event.target.checked) {
                  return {
                    ...aboutUserForm,
                    referredByOther: null,
                    referredByDefault: null,
                  };
                }

                return {
                  ...aboutUserForm,
                  referredByOther: "",
                  referredByDefault: null,
                };
              });
            }}
          />
          <section className="d-flex justify-content-between mt-2">
            <Link
              href={TROUBLE_LOGGING_IN_LINK}
              className="no-link-decoration underline-on-hover ms-1 mt-2 p-2 text-primary"
            >
              Trouble logging in?
            </Link>
            <SubmitAboutUserFormBtn
              _wasFormSubmitted={[wasFormSubmitted, setWasFormSubmitted]}
              _subjectsTaughtCustom={[
                subjectsTaughtCustom,
                setSubjectsTaughtCustom,
              ]}
              setErrors={setErrors}
              _wasBtnClicked={[wasBtnClicked, setWasBtnClicked]}
              _name={[name, setName]}
            />
          </section>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default AboutUserModal;
