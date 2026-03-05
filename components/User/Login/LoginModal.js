 
 
 
 
 
import { useContext, useEffect, useState } from "react";
import { CloseButton, Modal, ModalHeader, Spinner } from "react-bootstrap";
import { MdOutlineMail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { ModalContext } from "../../../providers/ModalProvider";
import Button from "../../General/Button";
import GoogleSignIn from "../GoogleSignIn";
import ORTxtDivider from "../ORTxtDivider";
import {
  getUserLoginErrType,
  useUserEntry,
} from "../../../customHooks/useUserEntry";
import { FcGoogle } from "react-icons/fc";
import { CustomInput } from "../formElements";
import { validateEmail } from "../../../globalFns";
import { getSessionStorageItem, setSessionStorageItem } from "../../../shared/fns";

const LoginModal = () => {
  const {
    _isLoginModalDisplayed,
    _isCreateAccountModalDisplayed,
    _isPasswordResetModalOn,
  } = useContext(ModalContext);
  const [isLoginModalDisplayed, setIsLoginModalDisplayed] =
    _isLoginModalDisplayed;
  const [, setIsCreateAccountModalDisplayed] = _isCreateAccountModalDisplayed;
  const [, setIsPasswordResetModalOn] = _isPasswordResetModalOn;
  const { _loginForm, sendFormToServer } = useUserEntry();
  const [isLoadingSpinnerOn, setIsLoadingSpinnerOn] = useState(false);
  const [isGoogleLoginSpinnerDisplayed, setIsGoogleLoginSpinnerDisplayed] =
    useState(false);
  const [errors, setErrors] = useState(new Map());
  const [loginForm, setLoginForm] = _loginForm;
  const [redirectUrl, setRedirectUrl] = useState("");

  const resolveRedirectUrl = () => {
    if (typeof window === "undefined") return "";
    const currentUrl = window.location.href;
    const storedRedirect = getSessionStorageItem("userEntryRedirectUrl");
    const pathname = window.location.pathname;
    const isAuthPage =
      pathname === "/account" ||
      pathname === "/sign-up" ||
      pathname === "/student/login" ||
      pathname === "/student/sign-up";

    if (!isAuthPage) {
      return currentUrl;
    }

    return storedRedirect || currentUrl;
  };

  useEffect(() => {
    if (!isLoginModalDisplayed) return;
    const nextRedirectUrl = resolveRedirectUrl();
    if (!nextRedirectUrl) return;
    setSessionStorageItem("userEntryRedirectUrl", nextRedirectUrl);
    setRedirectUrl(nextRedirectUrl);
  }, [isLoginModalDisplayed]);

  const handleOnInputChange = (event) => {
    const { name, value } = event.target;

    if (errors.has(name)) {
      const errorsClone = structuredClone(errors);

      errorsClone.delete(name);

      setErrors(errorsClone);
    }

    setLoginForm((currentState) => ({
      ...currentState,
      [name]: value,
    }));
  };

  const handleOnHide = () => {
    setIsLoginModalDisplayed(false);
  };

  const handleLoginBtnClick = async () => {
    setIsLoadingSpinnerOn(true);
    setErrors(new Map());

    const errors = new Map();
    const { email, password } = loginForm;

    if (!email) {
      errors.set("email", "This field is required.");
    } else if (!validateEmail(email)) {
      errors.set("email", "Invalid email.");
    }

    if (!password) {
      errors.set("password", "This field is required.");
    }

    if (errors.size > 0) {
      setTimeout(() => {
        setIsLoadingSpinnerOn(false);
        setErrors(errors);
      }, 200);
      return;
    }

    const userLoginErrType = await getUserLoginErrType(email, password);

    if (userLoginErrType === "googleLogin") {
      errors.set("email", "Error: Please sign in using Google.");
    } else if (userLoginErrType === "userNotFound") {
      errors.set("email", "Email not found.");
    } else if (userLoginErrType === "invalidCredentials") {
      errors.set("email", "Email or password is incorrect.");
      errors.set("password", "Email or password is incorrect.");
    }

    if (errors.size > 0) {
      setTimeout(() => {
        setIsLoadingSpinnerOn(false);
        setErrors(errors);
      }, 200);
      return;
    }

    localStorage.setItem("userEntryType", JSON.stringify("login"));

    sendFormToServer("login", "credentials", {
      login: {
        email,
        password,
      },
      callbackUrl: redirectUrl,
    });
  };

  const handleCreateOneBtnClick = () => {
    setIsLoginModalDisplayed(false);
    setTimeout(() => {
      setIsCreateAccountModalDisplayed(true);
    }, 300);
  };

  const handleForgotYourPasswordBtnClick = () => {
    setIsLoginModalDisplayed(false);
    setTimeout(() => {
      setIsPasswordResetModalOn(true);
    }, 300);
  };

  return (
    <Modal
      show={isLoginModalDisplayed}
      onHide={handleOnHide}
      dialogClassName="selected-gp-web-app-dialog login-modal-dialog m-0 d-flex justify-content-center align-items-center"
      contentClassName="login-ui-modal login-ui-modal--refresh box-shadow-login-ui-modal"
    >
      <ModalHeader className="login-modal-header border-0">
        <CloseButton
          className="position-absolute top-0 end-0 me-2 mt-2 mb-3 text-grey login-modal-close-btn"
          onClick={handleOnHide}
        />
        <div className="login-modal-brand">
          <img
            className="login-modal-logo"
            src="/GP_bubbleLogo300px.png"
            alt="Galactic Polymath"
            width={48}
            height={48}
          />
          <div>
            <h5 className="login-modal-title">Welcome back!</h5>
            <p className="login-modal-subtitle">
              Sign in to save jobs and unlock your account tools.
            </p>
          </div>
        </div>
      </ModalHeader>
      <div className="login-modal-body">
        <section className="d-flex justify-content-center align-items-center pt-2">
          <GoogleSignIn
            callbackUrl={redirectUrl}
            className="login-modal-google-btn position-relative"
            isLoggingIn
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
              className="mx-2"
              size={31}
            />
            <span
              className="login-modal-google-label"
              style={{ opacity: isGoogleLoginSpinnerDisplayed ? 0 : 1 }}
            >
              Continue with Google
            </span>
          </GoogleSignIn>
        </section>
        <ORTxtDivider color="#d2dcf8" className="d-flex my-3 mb-2" />
        <section>
          <form>
            <div className="login-modal-field-group">
              <label className="login-modal-label" htmlFor="email-id">
                Email
              </label>
              <div className="login-modal-input-row position-relative">
                <span className="login-modal-input-icon" aria-hidden="true">
                  <MdOutlineMail
                    fontSize="20px"
                    color={errors.has("email") ? "#ff6b6b" : "#7a8ec2"}
                  />
                </span>
                <CustomInput
                  inputContainerCss={`no-outline position-relative rounded w-100 login-modal-input-container ${
                    errors.has("email") ? "border-red" : ""
                  }`}
                  inputName="email"
                  inputId="email-id"
                  inputType="email"
                  placeholder="you@example.com"
                  inputClassName={`px-1 py-2 position-relative no-outline border-0 rounded bg-transparent w-100 ${
                    errors.has("email") ? "text-danger" : ""
                  }`}
                  onChange={handleOnInputChange}
                  autoFocus
                  onKeyUp={(event) => {
                    if (event.key === "Enter") {
                      handleLoginBtnClick();
                    }
                  }}
                />
              </div>
              <span className="login-modal-error">{errors.get("email") ?? ""}</span>
            </div>

            <div className="login-modal-field-group">
              <label className="login-modal-label" htmlFor="password-id">
                Password
              </label>
              <div className="login-modal-input-row position-relative">
                <span className="login-modal-input-icon" aria-hidden="true">
                  <FaLock
                    fontSize="18px"
                    color={errors.has("password") ? "#ff6b6b" : "#7a8ec2"}
                  />
                </span>
                <CustomInput
                  inputContainerCss={`no-outline position-relative rounded w-100 bg-light-blue ${
                    errors.has("password") ? "border-red text-danger" : ""
                  }`}
                  isPasswordInput
                  inputStyle={{
                    width: "90%",
                    paddingLeft: "1.9rem",
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
                  iconContainerClassName="h-100 end-0 position-absolute top-0 d-flex justify-content-center align-items-center bg-light-blue login-modal-password-toggle"
                  inputName="password"
                  onChange={handleOnInputChange}
                  inputId="password-id"
                  inputClassName="login-modal-password-input py-2 position-relative no-outline bg-transparent border-0 rounded"
                  onKeyUp={(event) => {
                    if (event.key === "Enter") {
                      handleLoginBtnClick();
                    }
                  }}
                />
              </div>
              <span className="login-modal-error">
                {errors.get("password") ?? ""}
              </span>
            </div>

            <div className="d-flex justify-content-center align-items-center py-2 mt-2">
              <Button
                handleOnClick={handleLoginBtnClick}
                classNameStr="login-modal-submit-btn rounded border-0 px-4 py-2"
              >
                {isLoadingSpinnerOn ? (
                  <Spinner size="sm" className="text-white" />
                ) : (
                  <span className="text-white">Sign in</span>
                )}
              </Button>
            </div>
            <div className="d-flex justify-content-center align-items-center py-2">
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
                handleOnClick={handleForgotYourPasswordBtnClick}
              >
                <span className="login-modal-link">Forgot your password?</span>
              </Button>
            </div>
          </form>
        </section>
        <div className="login-modal-footer d-flex justify-content-center align-items-center flex-column flex-sm-row">
          <span className="login-modal-footer-text">Don{"'"}t have an account?</span>
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
            <span className="login-modal-link ms-1">Create one.</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
