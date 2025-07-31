/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable no-useless-escape */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
/* eslint-disable indent */
import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import Button from "../components/General/Button";
import CreateAccountWithGoogle from "../components/User/GoogleSignIn";
import { FcGoogle } from "react-icons/fc";
import {
  CustomInput,
  ErrorTxt,
  InputSection,
} from "../components/User/formElements";
import { signIn } from "next-auth/react";
import { BiCheckbox, BiCheckboxChecked } from "react-icons/bi";
import {
  INPUT_FOCUS_BLUE_CLASSNAME,
  USER_INPUT_BACKGROUND_COLOR,
} from "../globalVars";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useUserEntry } from "../customHooks/useUserEntry";

export const FONT_SIZE_CHECKBOX = "28px";
const inputElementsFocusedDefault = new Map();

inputElementsFocusedDefault.set("email", false);
inputElementsFocusedDefault.set("firstName", false);
inputElementsFocusedDefault.set("lastName", false);

const SignUpPage: React.FC = () => {
  const { _createAccountForm, sendFormToServer, validateForm, _isUserTeacher } =
    useUserEntry();
  const [errors, setErrors] = useState(new Map());
  const [isLoadingSpinnerOn, setIsLoadingSpinnerOn] = useState(false);
  const [isGoogleLoadingSpinnerOn, setIsGoogleLoadingSpinnerOn] =
    useState(false);
  const [inputElementsFocused, setInputElementsFocused] = useState(
    inputElementsFocusedDefault
  );
  const [createAccountForm, setCreateAccountForm] = _createAccountForm;
  const [, setIsUserTeacher] = _isUserTeacher;
  const [passwordInputType, setPasswordInputType] = useState("password");
  const router = useRouter();
  /**
   * @typedef {"I solemnly swear I'm not a student just trying to get the answer key."} TUserIsTeacherTxt
   * @type {[TUserIsTeacherTxt, import('react').Dispatch<import('react').SetStateAction<TUserIsTeacherTxt>>]}
   */
  const [, setUserIsTeacherTxt] = useState(
    "I solemnly swear I'm not a student just trying to get the answer key."
  );

  const handlePasswordTxtShowBtnClick = () => {
    setPasswordInputType((state: string) =>
      state === "password" ? "text" : "password"
    );
  };

  const handleOnFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setInputElementsFocused((state) => {
      const stateClone = structuredClone(state);
      stateClone.set(event.target.name, !stateClone.get(event.target.name));
      return stateClone;
    });
  };

  const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setInputElementsFocused((state) => {
      const stateClone = structuredClone(state);
      stateClone.set(event.target.name, false);
      return stateClone;
    });
  };

  const handleToAddToMailingListToggleBtnClick = () => {
    setCreateAccountForm((state) => ({
      ...state,
      isOnMailingList: !state.isOnMailingList,
    }));
  };

  const handleSubmitCredentialsBtnClick = async () => {
    setIsLoadingSpinnerOn(true);

    const errors = await validateForm("credentials");

    if (errors.size > 0) {
      alert("An error has occurred. Please check your inputs.");
      setTimeout(() => {
        setErrors(errors);
        setIsLoadingSpinnerOn(false);
      });
      return;
    }

    const { email, firstName, lastName, password, isOnMailingList } =
      createAccountForm;
    const signUpForm = {
      createAccount: {
        email,
        firstName,
        lastName,
        password,
        isOnMailingList,
      },
      callbackUrl: `${window.location.origin}/account?show_about_user_form=true`,
    };

    sendFormToServer("createAccount", "credentials", signUpForm);
  };

  const handleOnInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (errors.has(name)) {
      const errorsClone = structuredClone(errors);
      errorsClone.delete(name);
      setErrors(errorsClone);
    }

    if (name === "confirmPassword" || name === "password") {
      setErrors((errors) => {
        const errorsClone = structuredClone(errors);
        errorsClone.delete("confirmPassword");
        errorsClone.delete("password");
        return errorsClone;
      });
    }

    setCreateAccountForm((form) => ({
      ...form,
      [name]: value,
    }));
  };

  const handleCreateAnAccountWithGoogleBtnClick = async (
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    setIsGoogleLoadingSpinnerOn(true);

    const errors = await validateForm("google");

    if (errors.has("isUserTeacherErr")) {
      setTimeout(() => {
        alert("An error has occurred. Please check your inputs.");
        setErrors(errors);
        setIsGoogleLoadingSpinnerOn(false);
      }, 250);
      return;
    }

    const callbackUrl = `${
      typeof window !== "undefined" ? window.location.origin : ""
    }/account?show_about_user_form=true`;

    if (createAccountForm.isOnMailingList) {
      localStorage.setItem("isOnMailingList", JSON.stringify(true));
    } else {
      localStorage.removeItem("isOnMailingList");
    }

    localStorage.setItem("userEntryType", JSON.stringify("create-account"));

    signIn("google", { callbackUrl: callbackUrl });
  };

  const handleLoginBtnClick = () => {
    router.push("/account");
  };

  return (
    <Layout
      title="Sign Up - Galactic Polymath"
      description="Create your teacher portal account to access 100+ free STEM resources!"
      url="https://teach.galacticpolymath.com/sign-up"
      imgSrc="/imgs/gp_logo_gradient_transBG.png"
      imgAlt="Galactic Polymath Logo"
      keywords="sign up, teacher portal, galactic polymath, create account"
      langLinks={[]}
    >
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light py-5 mt-md-0 mt-sm-5">
        <div
          className="bg-white shadow-lg rounded p-4"
          style={{ width: "90%" }}
        >
          <div className="mb-xl-4 position-relative d-flex flex-column flex-xl-row sign-up-header-container">
            <img
              className="position-absolute top-0 start-0 me-5 mt-1 d-xl-block d-none"
              src="/imgs/gp_logo_gradient_transBG.png"
              alt="gp_logo"
              width={100}
              height={100}
              style={{
                transform: "translateY(-18%)",
                top: 0,
              }}
            />
            <div className="d-xl-none d-flex w-100 justify-content-center align-items-center">
              <img
                src="/imgs/gp_logo_gradient_transBG.png"
                alt="gp_logo"
                width={100}
                height={100}
              />
            </div>
            <h5 className="mt-3 mt-xl-0 text-black text-center w-100 h-100 d-flex justify-content-center align-items-center">
              Create your teacher portal account to access 100+ free STEM
              resources!
            </h5>
          </div>
          {/* Mailing List Toggle */}
          <div className="border-bottom border-top py-4 my-3 mb-xl-4 mt-xl-5">
            <div className="d-flex justify-content-center align-items-center">
              <div className="d-flex create-account-toggle-btn-container">
                <div>
                  {createAccountForm.isOnMailingList ? (
                    <BiCheckboxChecked
                      onClick={handleToAddToMailingListToggleBtnClick}
                      fontSize={FONT_SIZE_CHECKBOX}
                      className="pointer"
                    />
                  ) : (
                    <BiCheckbox
                      onClick={handleToAddToMailingListToggleBtnClick}
                      fontSize={FONT_SIZE_CHECKBOX}
                      className="pointer"
                    />
                  )}
                </div>
                <label
                  onClick={handleToAddToMailingListToggleBtnClick}
                  style={{
                    fontSize: "18px",
                  }}
                  className="pointer ms-2"
                >
                  Send me updates about new/free resources (You{"'"}ll get an
                  email to confirm subscription).
                </label>
              </div>
            </div>
          </div>

          {/* Google Sign Up */}
          <section className="mb-4 d-flex justify-content-center align-items-center">
            <CreateAccountWithGoogle
              handleGoogleBtnClickCustom={
                handleCreateAnAccountWithGoogleBtnClick
              }
              callbackUrl={`${
                typeof window !== "undefined" ? window.location.origin : ""
              }/account?show_about_user_form=true`}
              className="rounded shadow position-relative w-100 p-4 d-flex flex-column flex-sm-row justify-content-center align-items-center border google-sign-in-btn"
              style={{ maxWidth: "600px" }}
            >
              <FcGoogle
                className="mx-2"
                size={45}
                style={{ opacity: isGoogleLoadingSpinnerOn ? 0 : 1 }}
              />
              {isGoogleLoadingSpinnerOn && (
                <div className="center-absolutely">
                  <Spinner size="sm" className="text-center" />
                </div>
              )}
              <span
                style={{ fontSize: "24px" }}
                className="d-inline-flex justify-content-center align-items-center h-100"
              >
                <span style={{ opacity: isGoogleLoadingSpinnerOn ? 0 : 1 }}>
                  Sign up with Google.
                </span>
              </span>
            </CreateAccountWithGoogle>
          </section>

          {/* OR Divider */}
          <div className="d-flex justify-content-center mb-4">
            <div
              style={{ width: "48%" }}
              className="d-flex justify-content-center justify-content-sm-end align-items-center"
            >
              <div
                style={{ height: "3px", width: "95%" }}
                className="bg-black rounded me-3 me-sm-2"
              />
            </div>
            <div
              style={{ width: "4%" }}
              className="d-flex justify-content-center align-items-center"
            >
              <span className="text-black">OR</span>
            </div>
            <div
              style={{ width: "48%" }}
              className="d-flex justify-content-center justify-content-sm-start align-items-center"
            >
              <div
                style={{ height: "3px", width: "95%" }}
                className="bg-black rounded ms-3 ms-sm-2"
              />
            </div>
          </div>

          {/* Sign Up Form */}
          <form className="d-flex justify-content-center align-items-center flex-column">
            <div className="row w-100 d-flex justify-content-center align-items-center mb-3">
              <div className="d-flex col-sm-6 flex-column">
                <label
                  className={`d-block w-75 pb-1 fw-bold ${
                    errors.has("firstName") ? "text-danger" : ""
                  }`}
                  htmlFor="first-name"
                >
                  First name:
                </label>
                <input
                  id="first-name"
                  placeholder="First name"
                  style={{
                    borderRadius: "5px",
                    fontSize: "18px",
                    border: errors.has("firstName") ? "solid 1px red" : "",
                    background: USER_INPUT_BACKGROUND_COLOR,
                  }}
                  className={`${
                    inputElementsFocused.get("firstName")
                      ? INPUT_FOCUS_BLUE_CLASSNAME
                      : ""
                  } ${
                    errors.has("firstName")
                      ? "border-danger"
                      : "border-0 no-outline"
                  } p-1 w-100 py-2`}
                  autoFocus
                  name="firstName"
                  onChange={handleOnInputChange}
                  onFocus={handleOnFocus}
                  onBlur={handleOnBlur}
                />
                <section style={{ height: "29px" }}>
                  {errors.has("firstName") && (
                    <ErrorTxt>{errors.get("firstName")}</ErrorTxt>
                  )}
                </section>
              </div>
              <InputSection
                errors={errors}
                errorsFieldName="lastName"
                inputId="lastName"
                inputName="lastName"
                inputStyle={{
                  borderRadius: "5px",
                  fontSize: "18px",
                  background: USER_INPUT_BACKGROUND_COLOR,
                }}
                labelClassName={`d-block w-100 pb-1 fw-bold ${
                  errors.has("lastName") ? "text-danger" : ""
                }`}
                inputPlaceholder="Last name"
                label="Last Name"
                inputClassName={`${
                  inputElementsFocused.get("lastName")
                    ? INPUT_FOCUS_BLUE_CLASSNAME
                    : "no-outline"
                } ${
                  errors.has("lastName") ? "border-danger" : "border-0"
                } p-1 w-100 py-2 no-outline`}
                onFocus={handleOnFocus}
                onBlur={handleOnBlur}
                handleOnInputChange={handleOnInputChange}
              />
            </div>
            <div className="row w-100 d-flex justify-content-center align-items-center mb-3">
              <div className="d-flex flex-column position-relative col-sm-6">
                <label
                  className={`${
                    errors.has("email") ? "text-danger" : ""
                  } d-block w-75 pb-1 fw-bold`}
                  htmlFor="email-input"
                >
                  Email:
                </label>
                <input
                  id="email-input"
                  placeholder="Email"
                  style={{
                    borderRadius: "5px",
                    fontSize: "18px",
                    background: USER_INPUT_BACKGROUND_COLOR,
                  }}
                  onFocus={handleOnFocus}
                  onBlur={handleOnBlur}
                  className={`${
                    errors.has("email") ? "error-border" : "border-0 no-outline"
                  } ${
                    inputElementsFocused.get("email")
                      ? INPUT_FOCUS_BLUE_CLASSNAME
                      : ""
                  } ${errors.has("email") ? "text-danger" : ""} p-1 w-100 py-2`}
                  name="email"
                  onChange={handleOnInputChange}
                />
                <section style={{ height: "29px" }}>
                  {errors.has("email") && (
                    <ErrorTxt>{errors.get("email")}</ErrorTxt>
                  )}
                </section>
              </div>
              <div className="col-6 d-none d-sm-block" />
            </div>
            <div className="row w-100 d-flex justify-content-center align-items-center mb-4">
              <div className="d-flex flex-column position-relative col-sm-6">
                <label
                  className={`d-block w-75 pb-1 fw-bold ${
                    errors.has("password") ? "text-danger" : ""
                  }`}
                  htmlFor="email-input"
                >
                  Password:
                </label>
                <CustomInput
                  inputId="password"
                  isPasswordInput
                  handleShowPasswordTxtBtnClick={handlePasswordTxtShowBtnClick}
                  inputType={passwordInputType}
                  placeholder="Enter your password"
                  inputContainerCss="d-flex flex-column position-relative col-12 p-0"
                  inputContainerStyle={{ borderRadius: "5px" }}
                  inputStyle={{
                    borderRadius: "5px",
                    fontSize: "18px",
                    background: "#E8F0FE",
                    border: errors.has("password") ? "solid 1px red" : "",
                  }}
                  inputClassName={`p-1 w-100 py-2 no-outline ${
                    errors.has("password") ? "text-danger" : "border-0"
                  }`}
                  inputName="password"
                  onChange={handleOnInputChange}
                  iconContainerStyle={{
                    borderTopRightRadius: "5px",
                    borderBottomRightRadius: "5px",
                    zIndex: 1,
                  }}
                  noInputBorderColorOnBlur
                />
                <section style={{ height: "29px" }}>
                  {errors.has("password") && (
                    <ErrorTxt>{errors.get("password")}</ErrorTxt>
                  )}
                </section>
              </div>
              <div className="d-flex flex-column position-relative col-sm-6">
                <label
                  className={`d-block w-75 pb-1 fw-bold ${
                    errors.has("confirmPassword") ? "text-danger" : ""
                  }`}
                  htmlFor="email-input"
                >
                  Confirm password:
                </label>
                <CustomInput
                  inputId="confirm-password-id"
                  isPasswordInput
                  handleShowPasswordTxtBtnClick={handlePasswordTxtShowBtnClick}
                  inputType={passwordInputType}
                  placeholder="Enter your password"
                  inputContainerCss="d-flex flex-column position-relative col-12 p-0"
                  iconContainerStyle={{
                    borderTopRightRadius: "5px",
                    borderBottomRightRadius: "5px",
                    zIndex: 1,
                    width: "10%",
                  }}
                  inputContainerStyle={{
                    borderRadius: "5px",
                  }}
                  inputStyle={{
                    borderRadius: "5px",
                    fontSize: "18px",
                    background: "#E8F0FE",
                    border: errors.has("confirmPassword")
                      ? "solid 1px red"
                      : "",
                  }}
                  inputClassName={`p-1 w-100 py-2 no-outline ${
                    errors.has("confirmPassword") ? "text-danger" : "border-0"
                  }`}
                  inputName="confirmPassword"
                  onChange={handleOnInputChange}
                  noInputBorderColorOnBlur
                />
                <section style={{ height: "29px" }}>
                  {errors.has("confirmPassword") && (
                    <ErrorTxt>{errors.get("confirmPassword")}</ErrorTxt>
                  )}
                </section>
              </div>
            </div>
            <div className="d-flex justify-content-center align-items-center mb-4 w-100">
              <Button
                handleOnClick={handleSubmitCredentialsBtnClick}
                classNameStr="bg-primary rounded border-0 py-2 px-5 text-white underline-on-hover sign-up-btn"
              >
                {isLoadingSpinnerOn ? (
                  <Spinner size="sm" className="text-white" />
                ) : (
                  <span className="text-white">SIGN UP</span>
                )}
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div className="d-flex justify-content-center align-items-center border-top pt-4 flex-column flex-sm-row">
            <span className="text-black">Already have an account?</span>
            <Button
              defaultStyleObj={{
                background: "none",
                color: "inherit",
                border: "none",
                font: "inherit",
                cursor: "pointer",
                outline: "inherit",
              }}
              classNameStr="d-block no-link-decoration"
              handleOnClick={handleLoginBtnClick}
            >
              <span className="text-primary underline-on-hover ms-1">
                Sign in.
              </span>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignUpPage;
