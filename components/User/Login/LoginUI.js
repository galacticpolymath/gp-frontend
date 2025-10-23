/* eslint-disable quotes */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import { useContext, useMemo, useState } from "react";
import { ModalContext } from "../../../providers/ModalProvider";
import Button from "../../General/Button";
import GoogleSignIn from "../GoogleSignIn";
import { CustomInput } from "../formElements";
import { FcGoogle } from "react-icons/fc";
import { Spinner } from "react-bootstrap";
import Link from "next/link";
import { TROUBLE_LOGGING_IN_LINK } from "../../../globalVars";
import { useRouter } from "next/router";
import { useUserEntry } from "../../../customHooks/useUserEntry";
import { getSessionStorageItem } from "../../../shared/fns";
import Image from "next/image";

const LoginUI = ({
  className = "",
  headingTitleClassName = "text-white text-center mt-2",
}) => {
  const {
    _loginForm,
    handleLoginBtnClick,
    _isUserEntryInProcess,
    _userEntryErrors,
  } = useUserEntry();
  const router = useRouter();
  const [passwordInputType, setPasswordInputType] = useState("password");
  const { _isPasswordResetModalOn } = useContext(ModalContext);
  const [isGoogleLoginSpinnerDisplayed, setIsGoogleLoginSpinnerDisplayed] =
    useState(false);
  const [, setLoginForm] = _loginForm;
  const [, setIsPasswordResetModalOn] = _isPasswordResetModalOn;
  const [isUserEntryInProcess] = _isUserEntryInProcess;
  const [userEntryErrors, setUserEntryErrors] = _userEntryErrors;
  const inputFieldClassName = "col-12 col-sm-7";
  const mobileInputFieldClassName = "col-11 col-sm-7";

  const handleOnInputChange = (event) => {
    const { name, value } = event.target;

    if (userEntryErrors.has(name)) {
      setUserEntryErrors((state) => {
        const userEntryErrorsClone = structuredClone(state);

        userEntryErrorsClone.delete(name);

        return userEntryErrorsClone;
      });
    }

    setLoginForm((currentState) => ({
      ...currentState,
      [name]: value,
    }));
  };

  const handleCreateOneBtnClick = () => {
    router.push("/sign-up");
  };

  const redirectUrl = useMemo(() => {
    const redirectUrl = getSessionStorageItem("userEntryRedirectUrl");

    if (redirectUrl) {
      return redirectUrl;
    }

    return typeof window === "undefined" ? "" : window.location.href;
  }, []);

  return (
    <div className={className}>
      <div className="d-flex justify-content-center flex-row align-items-center pt-0 pt-sm-1 pt-md-0">
        <Image
          src="/imgs/gp_logo_gradient_transBG.png"
          alt="gp_logo"
          width={60}
          height={60}
          className="d-none d-sm-block d-md-none d-lg-block me-2"
        />
        <Image
          src="/imgs/gp_logo_gradient_transBG.png"
          alt="gp_logo"
          width={45}
          height={45}
          className="d-block d-sm-none d-md-block d-lg-none me-2"
        />
        <h1
          style={{ fontWeight: 600 }}
          className={`${headingTitleClassName} fs-6`}
        >
          <span className="d-none d-sm-inline d-md-none d-lg-inline fs-4">GP Teacher Portal Sign In</span>
          <span className="d-inline d-sm-none d-md-inline d-lg-none">GP Portal</span>
        </h1>
      </div>
      <div className="w-100 flex-column d-flex justify-content-center align-items-center mt-2 mb-1 mb-sm-0 mt-sm-1 mt-md-2">
        <h5
          style={{ fontWeight: 300 }}
          className="mt-0 mb-0 mt-sm-1 mt-md-2 text-black text-center w-100 h-100 fs-6 fs-sm-5"
        >
          <span className="d-none d-sm-inline d-md-none d-lg-inline">
            Get 100+ of the best science + STE(A)M resources available{" "}
            <i>anywhere</i>!
          </span>
          <span className="d-inline d-sm-none d-md-inline d-lg-none">
            Get 100+ science resources <i>anywhere</i>!
          </span>
        </h5>
        <h5
          style={{ fontWeight: 300 }}
          className="mt-0 mt-md-1 text-black text-center w-100 h-100 fs-6 fs-sm-5"
        >
          (Grant-funded, FREE!)
        </h5>
      </div>
      <section className="mt-0 mt-sm-1 mt-md-2 mb-0 mb-sm-1 mb-md-2 justify-content-center align-items-center d-flex">
        <div
          style={{ width: "85%" }}
          className="d-flex py-1 py-sm-1 py-md-2 flex-sm-row flex-column justify-content-center align-items-center border-top border-bottom"
        >
          <span className="text-black fs-6 fs-sm-5">
            Don{"'"}t have an account?
          </span>
          <Button
            color="#3C719F"
            defaultStyleObj={{
              background: "none",
              color: "inherit",
              border: "none",
              font: "inherit",
              cursor: "pointer",
              outline: "inherit",
            }}
            className="d-block no-link-decoration"
            handleOnClick={handleCreateOneBtnClick}
          >
            <span className="ms-1 text-primary underline-on-hover fs-6 fs-sm-5">
              Sign up.
            </span>
          </Button>
        </div>
      </section>
      <section className="d-flex justify-content-center align-items-center pt-3 pb-3 py-sm-0 py-md-1 pt-sm-1 pb-sm-2 pb-md-3 mt-0 mt-sm-1 mt-md-2">
        <GoogleSignIn
          callbackUrl={redirectUrl}
          className="google-sign-in-btn rounded px-2 px-sm-3 px-md-4 py-2 py-md-3 d-flex flex-row flex-sm-column justify-content-center align-items-center border shadow col-12 col-sm-7 position-relative"
          executeExtraBtnClickLogic={() => {
            setIsGoogleLoginSpinnerDisplayed(true);
          }}
          executeFinallyBlockLogic={() => {
            setTimeout(() => {
              setIsGoogleLoginSpinnerDisplayed(false);
            }, 1000);
          }}
        >
          {isGoogleLoginSpinnerDisplayed && (
            <div className="center-absolutely">
              <Spinner size="lg" className="text-center" />
            </div>
          )}
          <FcGoogle
            opacity={isGoogleLoginSpinnerDisplayed ? 0 : 1}
            className="mx-1 mx-sm-2"
            size={25}
            style={{ fontSize: "25px" }}
          />
          <span
            style={{
              fontSize: "13px",
              opacity: isGoogleLoginSpinnerDisplayed ? 0 : 1,
            }}
            className="ms-1 ms-sm-0 mt-0 mt-sm-1 fs-6 fs-sm-5"
          >
            Sign in with Google.
          </span>
        </GoogleSignIn>
      </section>
      <div className="d-flex justify-content-center mt-0 mt-sm-1 mt-md-2 mb-0 mb-sm-0 mb-md-1">
        <div
          style={{ width: "45%" }}
          className="d-flex justify-content-center justify-content-sm-end align-items-center"
        >
          <div
            style={{ height: "1px", width: "80%" }}
            className={`bg-black rounded`}
          />
        </div>
        <div
          style={{ width: "25px" }}
          className="d-flex justify-content-center align-items-center"
        >
          <span
            className={`text-black fs-6 fs-sm-5`}
            style={{ fontSize: "10px" }}
          >
            OR
          </span>
        </div>
        <div
          style={{ width: "45%" }}
          className="d-flex justify-content-center justify-content-sm-start align-items-center"
        >
          <div
            style={{ height: "1px", width: "80%" }}
            className={`bg-black rounded`}
          />
        </div>
      </div>
      <section className="mb-0 mb-sm-4">
        <form>
          <div className="mt-0 mt-sm-1 mt-md-2 d-flex justify-content-center align-items-center flex-column">
            <label
              className={`d-flex p-0 position-relative ${mobileInputFieldClassName} ${userEntryErrors.has("email") ? "text-danger" : ""
                }  fw-bold pb-0 pb-md-1 fs-6 fs-sm-5`}
              htmlFor="email-input"
            >
              Email:
            </label>
            <CustomInput
              onChange={(event) => {
                handleOnInputChange(event);
              }}
              inputStyle={{ width: "100%", height: "30px", fontSize: "14px" }}
              inputContainerCss={`${mobileInputFieldClassName} py-1 py-md-2 rounded position-relative bg-light-blue ${userEntryErrors.has("email") ? "border-danger" : "border"
                }`}
              inputClassName='px-1 py-1 position-relative no-outline border-0 rounded bg-light-blue'
              inputId="email-input"
              inputName="email"
              inputType=""
            />
          </div>
          <div style={{ height: '28px' }} className="my-0 my-md-1 py-0 d-flex justify-content-center">
            <div
              className={`${mobileInputFieldClassName} d-flex align-items-center position-relative`}
            >
              <span
                style={{ fontSize: "11px" }}
                className="left-0 text-danger position-absolute"
              >
                {userEntryErrors.get("email") ?? ""}
              </span>
            </div>
          </div>
          <div className="mt-0 mt-sm-1 mt-md-2 d-flex justify-content-center align-items-center flex-column">
            <label
              className={`d-flex p-0 position-relative ${userEntryErrors.has("password") ? "text-danger" : ""
                } ${mobileInputFieldClassName} fw-bold pb-0 pb-md-1 fs-6 fs-sm-5`}
              htmlFor="password-input"
            >
              Password:
            </label>
            <CustomInput
              onChange={(event) => {
                handleOnInputChange(event);
              }}
              inputStyle={{
                width: "90%",
                height: "30px",
                fontSize: "14px",
                borderTopRightRadius: "0px",
                borderBottomRightRadius: "0px",
                borderTopLeftRadius: "6.75px",
                borderBottomLeftRadius: "6.75px",
              }}
              willUseDefaultTxtShowToggle
              iconContainerStyle={{
                width: "10%",
                borderTopRightRadius: "6.75px",
                borderBottomRightRadius: "6.75px",
              }}
              iconContainerClassName="h-100 end-0 position-absolute top-0 d-flex justify-content-center align-items-center bg-light-blue"
              inputContainerCss={`py-1 py-md-2 ${mobileInputFieldClassName} ${userEntryErrors.has("password")
                ? "border-danger text-danger"
                : "border"
                } rounded position-relative bg-light-blue`}
              inputClassName="px-1 py-1 position-relative no-outline border-0 bg-light-blue"
              inputId="password-input"
              inputName="password"
              isPasswordInput
              inputType={passwordInputType}
              handleShowPasswordTxtBtnClick={() => {
                setPasswordInputType((inputType) => {
                  return inputType === "password" ? "text" : "password";
                });
              }}
            />
          </div>
          <div style={{ height: '28px' }} className="my-0 my-md-1 py-0 d-flex justify-content-center">
            <div
              className={`d-flex align-items-center position-relative ${mobileInputFieldClassName}`}
            >
              <span
                style={{ fontSize: "11px" }}
                className="left-0 text-danger position-absolute"
              >
                {userEntryErrors.get("password") ?? ""}
              </span>
            </div>
          </div>
          <div className="px-2 px-sm-0 py-0 mt-0 mt-sm-1 mt-md-2 row d-flex justify-content-center align-items-center">
            <Button
              handleOnClick={() => {
                handleLoginBtnClick(redirectUrl);
              }}
              defaultStyleObj={{ borderRadius: "5px" }}
              classNameStr={`bg-primary border-0 px-2 px-sm-3 px-md-4 py-1 py-sm-1 py-md-2 ${mobileInputFieldClassName}`}
            >
              {isUserEntryInProcess ? (
                <div
                  className="spinner-border spinner-border-sm text-light"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <span className="text-white fs-6 fs-sm-5">Login</span>
              )}
            </Button>
          </div>
          <div className="d-flex justify-content-center align-items-center mt-0 mt-sm-1 mt-md-2 mb-0 mb-sm-0 mb-md-1">
            <Button
              color="#3C719F"
              defaultStyleObj={{
                background: "none",
                color: "inherit",
                border: "none",
                font: "inherit",
                cursor: "pointer",
                outline: "inherit",
              }}
              className={`d-block no-link-decoration ${mobileInputFieldClassName}`}
              handleOnClick={() => {
                setIsPasswordResetModalOn(true);
              }}
            >
              <span className="text-primary underline-on-hover fs-6 fs-sm-5">
                Forgot your password?
              </span>
            </Button>
          </div>
          <div className="d-flex justify-content-center align-items-center mt-0 mb-1 mb-sm-2 mb-md-3">
            <Link
              href={TROUBLE_LOGGING_IN_LINK}
              className="no-link-decoration underline-on-hover ms-1 mt-0 mt-md-1 p-0 p-sm-1 text-primary fs-6 fs-sm-5"
            >
              Trouble logging in?
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
};

export default LoginUI;
