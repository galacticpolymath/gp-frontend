/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */

import React, { useEffect, useState } from "react";
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
import { SELECTED_GP_PLUS_BILLING_TYPE } from "./gp-plus";
import { redirect, useSearchParams } from "next/navigation";
import { PRESENT_WELCOME_MODAL_PARAM_NAME } from "../shared/constants";
import { getSessionStorageItem } from "../shared/fns";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";

export const FONT_SIZE_CHECKBOX = "28px";
const ERROR_TXT_HEIGHT = "23px";
const inputElementsFocusedDefault = new Map();

inputElementsFocusedDefault.set("email", false);
inputElementsFocusedDefault.set("firstName", false);
inputElementsFocusedDefault.set("lastName", false);

export interface ICallbackUrl {
  callbackUrl: string;
  redirectPgType: "account" | "home" | "pgWithSignUpBtn";
}

const SignUpPage: React.FC = () => {
  const { _createAccountForm, sendFormToServer, validateForm } = useUserEntry();
  const urlSearchParams = useSearchParams();
  const [errors, setErrors] = useState(new Map());
  const [isLoadingSpinnerOn, setIsLoadingSpinnerOn] = useState(false);
  const [isGoogleLoadingSpinnerOn, setIsGoogleLoadingSpinnerOn] =
    useState(false);
  const [inputElementsFocused, setInputElementsFocused] = useState(
    inputElementsFocusedDefault
  );
  const [createAccountForm, setCreateAccountForm] = _createAccountForm;
  const [passwordInputType, setPasswordInputType] = useState("password");
  const router = useRouter();

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

  const createCallbackUrl = (): ICallbackUrl => {
    let callbackUrl = `${window.location.origin}/?${PRESENT_WELCOME_MODAL_PARAM_NAME}=true`;

    if (urlSearchParams.has(SELECTED_GP_PLUS_BILLING_TYPE)) {
      const gpPlusBillingPeriod = urlSearchParams.get(
        SELECTED_GP_PLUS_BILLING_TYPE
      );
      callbackUrl = `${window.location.origin}/account?show_about_user_form=true&${SELECTED_GP_PLUS_BILLING_TYPE}=${gpPlusBillingPeriod}`;

      return {
        callbackUrl,
        redirectPgType: "account",
      };
    }

    const signUpRedirectUrl = getSessionStorageItem("userEntryRedirectUrl");

    if (signUpRedirectUrl) {
      console.log("signUpRedirectUrl: ", signUpRedirectUrl);

      return {
        callbackUrl: signUpRedirectUrl,
        redirectPgType: "pgWithSignUpBtn",
      };
    }

    return { callbackUrl, redirectPgType: "home" };
  };

  const handleSubmitCredentialsBtnClick = async () => {
    setIsLoadingSpinnerOn(true);

    const errors = await validateForm("credentials");

    if (errors.size > 0) {
      alert("An error has occurred. Please check your inputs.");
      setTimeout(() => {
        setErrors(errors);
        setIsLoadingSpinnerOn(false);
      }, 250);
      return;
    }

    const { email, firstName, lastName, password, isOnMailingList } =
      createAccountForm;
    const { callbackUrl } = createCallbackUrl();
    const signUpForm = {
      createAccount: {
        email,
        firstName,
        lastName,
        password,
        isOnMailingList,
        redirectTo: callbackUrl,
      },
      callbackUrl,
    };

    console.log("signUpForm: ", signUpForm);

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

    const callbackUrl = createCallbackUrl();

    if (createAccountForm.isOnMailingList) {
      localStorage.setItem("isOnMailingList", JSON.stringify(true));
    } else {
      localStorage.removeItem("isOnMailingList");
    }

    localStorage.setItem("userEntryType", JSON.stringify("create-account"));

    signIn("google", { callbackUrl: callbackUrl.callbackUrl });
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
      <div className="min-vh-100 d-flex justify-content-center bg-light py-3 py-md-5 sign-up-pg-container position-relative">
        <div
          className="shadow-lg rounded sign-up-card pb-4"
          style={{ width: "97%", height: "fit-content" }}
        >
          <div className="bg-white rounded p-1 p-sm-3 p-md-2 w-100">
            {/* Header — Desktop & tablet */}
            <div className="d-none d-sm-block text-center mb-3">
              <img
                src="/imgs/gp_logo_gradient_transBG.png"
                alt="gp_logo"
                className="mx-auto mb-2"
                style={{ width: "88px", height: "88px", objectFit: "contain" }}
              />
              <h5 className="fw-bold mb-1">
                Access 100+ of the best science resources <em>anywhere</em>!
              </h5>
              <p className="text-muted mb-0">(Grant-funded, FREE!)</p>
              <hr className="mt-3 mb-0" />
            </div>

            {/* Header — Mobile */}
            <div className="d-sm-none text-center mt-1">
              <img
                src="/imgs/gp_logo_gradient_transBG.png"
                alt="gp_logo"
                className="mx-auto mb-2"
                style={{ width: "60px", height: "60px", objectFit: "contain" }}
              />
              <p className="fw-bold mb-1">
                Sign up to access 100+ of the best science resources{" "}
                <em>anywhere</em>!
              </p>
              <p className="text-muted mb-0">(Grant-funded, FREE!)</p>
              <hr className="mt-3 mb-0" />
            </div>
            {/* Mailing List Toggle */}
            <div className="border-bottom border-top py-2 py-sm-3 py-xxl-1 my-0 mb-3 mt-0 mt-sm-1 mt-md-2">
              <div className="d-flex justify-content-center align-items-center">
                <div className="d-flex create-account-toggle-btn-container">
                  <div className="d-flex align-items-center justify-content-center">
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
                  <div
                    onClick={handleToAddToMailingListToggleBtnClick}
                    className="py-xxl-4 pointer ms-0 email-listing-txt d-flex align-items-center justify-content-sm-center"
                  >
                    Send me updates about the latest!
                  </div>
                </div>
              </div>
            </div>

            {/* Google Sign Up */}
            <section className="my-2 my-sm-3 my-xxl-4 my-xl-3 d-flex justify-content-center align-items-center">
              <CreateAccountWithGoogle
                handleGoogleBtnClickCustom={
                  handleCreateAnAccountWithGoogleBtnClick
                }
                callbackUrl={`${
                  typeof window !== "undefined" ? window.location.origin : ""
                }/account?show_about_user_form=true`}
                className="rounded shadow position-relative w-100 p-1 py-2 p-sm-2 p-xl-3 d-flex flex-row flex-sm-column justify-content-center align-items-center border google-sign-in-btn"
                style={{ maxWidth: "600px" }}
              >
                <FcGoogle
                  className="mx-2 d-none d-md-block"
                  size={45}
                  style={{ opacity: isGoogleLoadingSpinnerOn ? 0 : 1 }}
                />
                <FcGoogle
                  className="mx-2 d-block d-sm-none"
                  size={25}
                  style={{ opacity: isGoogleLoadingSpinnerOn ? 0 : 1 }}
                />
                <FcGoogle
                  className="mx-2 d-none d-sm-block d-md-none"
                  size={30}
                  style={{ opacity: isGoogleLoadingSpinnerOn ? 0 : 1 }}
                />
                {isGoogleLoadingSpinnerOn && (
                  <div className="center-absolutely">
                    <Spinner className="text-center" />
                  </div>
                )}
                <span className="d-inline-flex justify-content-center align-items-center h-100 sign-up-w-google-txt fs-6">
                  <span style={{ opacity: isGoogleLoadingSpinnerOn ? 0 : 1 }}>
                    Sign up with Google.
                  </span>
                </span>
              </CreateAccountWithGoogle>
            </section>

            {/* OR Divider */}
            <div className="d-flex justify-content-center mb-1 mb-sm-2 mb-xl-2">
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
              <div className="row w-100 d-flex justify-content-center align-items-center mb-0 mb-sm-1 mb-xl-1">
                <div className="d-flex col-6 flex-column">
                  <label
                    className={`d-none d-sm-block w-75 pb-0 pb-sm-1 sign-up-input-label fw-bold ${
                      errors.has("firstName") ? "text-danger" : ""
                    }`}
                    htmlFor="first-name"
                  >
                    First name:
                  </label>
                  <label
                    className={`sign-up-input-label d-block d-sm-none w-75 pb-0 pb-sm-1 fw-bold ${
                      errors.has("firstName") ? "text-danger" : ""
                    }`}
                    htmlFor="first-name"
                  >
                    Name:
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
                    } p-1 w-100 py-1 py-sm-2`}
                    autoFocus
                    name="firstName"
                    onChange={handleOnInputChange}
                    onFocus={handleOnFocus}
                    onBlur={handleOnBlur}
                  />
                  <section style={{ height: ERROR_TXT_HEIGHT }}>
                    {errors.has("firstName") && (
                      <ErrorTxt>{errors.get("firstName")}</ErrorTxt>
                    )}
                  </section>
                </div>
                <InputSection
                  errors={errors}
                  errorsFieldName="lastName"
                  containerClassName="d-sm-flex d-none flex-column col-6 position-relative"
                  inputId="lastName"
                  inputName="lastName"
                  errorSectionStyle={{
                    height: ERROR_TXT_HEIGHT,
                  }}
                  inputStyle={{
                    borderRadius: "5px",
                    fontSize: "18px",
                    background: USER_INPUT_BACKGROUND_COLOR,
                  }}
                  labelClassName={`sign-up-input-label d-block w-100 pb-1 fw-bold ${
                    errors.has("lastName") ? "text-danger" : ""
                  }`}
                  inputPlaceholder="Last name"
                  label="Last Name: "
                  inputClassName={`${
                    inputElementsFocused.get("lastName")
                      ? INPUT_FOCUS_BLUE_CLASSNAME
                      : "no-outline"
                  } ${
                    errors.has("lastName") ? "border-danger" : "border-0"
                  } p-1 w-100 py-1 py-sm-2 no-outline`}
                  onFocus={handleOnFocus}
                  onBlur={handleOnBlur}
                  handleOnInputChange={handleOnInputChange}
                />
                <InputSection
                  errors={errors}
                  errorsFieldName="lastName"
                  containerClassName="d-sm-none d-flex flex-column col-6 position-relative"
                  inputId="lastName"
                  inputName="lastName"
                  inputStyle={{
                    borderRadius: "5px",
                    fontSize: "18px",
                    background: USER_INPUT_BACKGROUND_COLOR,
                  }}
                  labelClassName={`sign-up-input-label d-block invisible w-100 pb-1 fw-bold ${
                    errors.has("lastName") ? "text-danger" : ""
                  }`}
                  inputPlaceholder="Last name"
                  label="X: "
                  inputClassName={`${
                    inputElementsFocused.get("lastName")
                      ? INPUT_FOCUS_BLUE_CLASSNAME
                      : "no-outline"
                  } ${
                    errors.has("lastName") ? "border-danger" : "border-0"
                  } p-1 w-100 py-1 py-sm-2 no-outline`}
                  onFocus={handleOnFocus}
                  onBlur={handleOnBlur}
                  handleOnInputChange={handleOnInputChange}
                />
              </div>
              <div className="row w-100 d-flex justify-content-center align-items-center mb-0 mb-sm-1 mb-xl-1">
                <div className="d-flex flex-column position-relative col-sm-6">
                  <label
                    className={`${
                      errors.has("email") ? "text-danger" : ""
                    } d-block w-75 pb-0 sign-up-input-label pb-sm-1 fw-bold`}
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
                      errors.has("email")
                        ? "error-border"
                        : "border-0 no-outline"
                    } ${
                      inputElementsFocused.get("email")
                        ? INPUT_FOCUS_BLUE_CLASSNAME
                        : ""
                    } ${
                      errors.has("email") ? "text-danger" : ""
                    } p-1 w-100 py-1 py-sm-2`}
                    name="email"
                    onChange={handleOnInputChange}
                  />
                  <section style={{ height: ERROR_TXT_HEIGHT }}>
                    {errors.has("email") && (
                      <ErrorTxt>{errors.get("email")}</ErrorTxt>
                    )}
                  </section>
                </div>
                <div className="col-6 d-none d-sm-block" />
              </div>
              <div className="row w-100 d-flex justify-content-center align-items-center mb-1 mb-sm-2 mb-xl-2">
                <div className="d-flex flex-column position-relative col-6">
                  <label
                    className={`d-block w-75 pb-0 sign-up-input-label pb-sm-1 fw-bold ${
                      errors.has("password") ? "text-danger" : ""
                    }`}
                    htmlFor="email-input"
                  >
                    Password:
                  </label>
                  <CustomInput
                    inputId="password"
                    isPasswordInput
                    handleShowPasswordTxtBtnClick={
                      handlePasswordTxtShowBtnClick
                    }
                    inputType={passwordInputType}
                    placeholder="Enter your password"
                    inputContainerCss="d-none d-sm-flex flex-column position-relative col-12 p-0"
                    inputContainerStyle={{ borderRadius: "5px" }}
                    inputStyle={{
                      borderRadius: "5px",
                      fontSize: "18px",
                      background: "#E8F0FE",
                      border: errors.has("password") ? "solid 1px red" : "",
                    }}
                    inputClassName={`p-1 w-100 py-1 py-sm-2 no-outline ${
                      errors.has("password") ? "text-danger" : "border-0"
                    }`}
                    inputName="password"
                    onChange={handleOnInputChange}
                    iconContainerStyle={{
                      borderTopRightRadius: "5px",
                      borderBottomRightRadius: "5px",
                      zIndex: 1,
                      marginRight: "5px",
                    }}
                    noInputBorderColorOnBlur
                  />
                  <CustomInput
                    inputId="password"
                    isPasswordInput
                    handleShowPasswordTxtBtnClick={
                      handlePasswordTxtShowBtnClick
                    }
                    inputType={passwordInputType}
                    placeholder="Enter"
                    inputContainerCss="d-sm-none d-flex flex-column position-relative col-12 p-0"
                    inputContainerStyle={{ borderRadius: "5px" }}
                    inputStyle={{
                      borderRadius: "5px",
                      fontSize: "18px",
                      background: "#E8F0FE",
                      border: errors.has("password") ? "solid 1px red" : "",
                    }}
                    inputClassName={`p-1 w-100 py-1 py-sm-2 no-outline ${
                      errors.has("password") ? "text-danger" : "border-0"
                    }`}
                    inputName="password"
                    onChange={handleOnInputChange}
                    iconContainerStyle={{
                      borderTopRightRadius: "5px",
                      borderBottomRightRadius: "5px",
                      zIndex: 1,
                      marginRight: "5px",
                    }}
                    noInputBorderColorOnBlur
                  />
                  <section className="d-sm-none d-block">
                    {errors.has("password") && (
                      <ErrorTxt>{errors.get("password")}</ErrorTxt>
                    )}
                  </section>
                  <section
                    className="d-sm-block d-none"
                    style={{ height: ERROR_TXT_HEIGHT }}
                  >
                    {errors.has("password") && (
                      <ErrorTxt>{errors.get("password")}</ErrorTxt>
                    )}
                  </section>
                </div>
                <div className="d-flex flex-column position-relative col-6">
                  <label
                    className={`d-sm-block d-none sign-up-input-label w-75 pb-0 pb-sm-1 fw-bold ${
                      errors.has("confirmPassword") ? "text-danger" : ""
                    }`}
                    htmlFor="email-input"
                  >
                    Confirm password:
                  </label>
                  <label
                    className={`d-sm-none d-block invisible sign-up-input-label w-75 pb-0 pb-sm-1 fw-bold ${
                      errors.has("confirmPassword") ? "text-danger" : ""
                    }`}
                    htmlFor="email-input"
                  >
                    X
                  </label>
                  <CustomInput
                    inputId="confirm-password-id"
                    isPasswordInput
                    handleShowPasswordTxtBtnClick={
                      handlePasswordTxtShowBtnClick
                    }
                    inputType={passwordInputType}
                    placeholder="Confirm password"
                    inputContainerCss="d-none d-sm-flex flex-column position-relative col-12 p-0"
                    iconContainerClassName="h-100 end-0 position-absolute top-0 transparent d-flex justify-content-center align-items-center me-sm-0 me-2"
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
                    inputClassName={`p-1 w-100 py-1 py-sm-2 no-outline ${
                      errors.has("confirmPassword") ? "text-danger" : "border-0"
                    }`}
                    inputName="confirmPassword"
                    onChange={handleOnInputChange}
                    noInputBorderColorOnBlur
                  />
                  <CustomInput
                    inputId="confirm-password-id"
                    isPasswordInput
                    handleShowPasswordTxtBtnClick={
                      handlePasswordTxtShowBtnClick
                    }
                    inputType={passwordInputType}
                    placeholder="Confirm"
                    inputContainerCss="d-flex d-sm-none flex-column position-relative col-12 p-0"
                    iconContainerClassName="h-100 end-0 position-absolute top-0 transparent d-flex justify-content-center align-items-center me-sm-0 me-2"
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
                    inputClassName={`p-1 w-100 py-1 py-sm-2 no-outline ${
                      errors.has("confirmPassword") ? "text-danger" : "border-0"
                    }`}
                    inputName="confirmPassword"
                    onChange={handleOnInputChange}
                    noInputBorderColorOnBlur
                  />
                  <section className="d-sm-none d-block">
                    {errors.has("confirmPassword") && (
                      <ErrorTxt>{errors.get("confirmPassword")}</ErrorTxt>
                    )}
                  </section>
                  <section
                    className="d-sm-block d-none"
                    style={{ height: ERROR_TXT_HEIGHT }}
                  >
                    {errors.has("confirmPassword") && (
                      <ErrorTxt>{errors.get("confirmPassword")}</ErrorTxt>
                    )}
                  </section>
                </div>
              </div>
              <div className="d-flex justify-content-center align-items-center mt-3 mt-sm-1 mb-3 mb-sm-2 mb-xl-2 w-100">
                <Button
                  handleOnClick={handleSubmitCredentialsBtnClick}
                  classNameStr="bg-primary rounded border-0 py-1 px-4 text-white underline-on-hover sign-up-btn"
                  defaultStyleObj={{
                    height: "40px",
                  }}
                >
                  {isLoadingSpinnerOn ? (
                    <Spinner className="text-white" size="sm" />
                  ) : (
                    <span className="text-white">SIGN UP</span>
                  )}
                </Button>
              </div>
            </form>

            {/* Login Link */}
            <div className="d-flex justify-content-center align-items-center border-top pt-1 pt-sm-2 pt-xl-2 flex-column flex-sm-row mt-1 mt-sm-2">
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
      </div>
    </Layout>
  );
};

export const getServerSideProps = async ({
  req,
}: GetServerSidePropsContext) => {
  const sessionToken = req.cookies["next-auth.session-token"];

  if (sessionToken) {
    return {
      redirect: {
        destination: "/account",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default SignUpPage;
