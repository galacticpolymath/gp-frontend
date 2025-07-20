/* eslint-disable quotes */

import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../components/Layout";
import { Spinner } from "react-bootstrap";
import Image from "next/image";
import Logo from "../assets/img/logo.ico";
import useSiteSession from "../customHooks/useSiteSession";
import { updateUser } from "../apiServices/user/crudFns";
import useOutsetaInputValidation from "../customHooks/useOutsetaInputValidation";
import {
  defautlNotifyModalVal,
  useModalContext,
} from "../providers/ModalProvider";
import CustomLink from "../components/CustomLink";
import { CONTACT_SUPPORT_EMAIL } from "../globalVars";
import useHandleOpeningGpPlusAccount from "../customHooks/useHandleOpeningGpPlusAccount";
import { resetUrl } from "../globalFns";
import { useRouter } from "next/router";
import { useGpPlusModalInteraction } from "../customHooks/useGpPlusModalInteraction";

const ICON_DIMENSION = 125;

const LiContentWithImg: React.FC<{ txt: string }> = ({ txt }) => {
  return (
    <>
      <div className="d-flex">
        <div className="d-flex justify-content-center align-items-center">
          <Image
            src="/imgs/gp-logos/gp_submark.png"
            alt="gp_plus_logo"
            width={55}
            height={55}
            style={{ width: "55px", height: "55px", objectFit: "contain" }}
          />
        </div>
        <div className="d-flex justify-content-center align-items-center ms-1">
          {txt}
        </div>
      </div>
    </>
  );
};

const GpPlus: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const {
    _notifyModal,
    _isCreateAccountModalDisplayed,
    _isLoginModalDisplayed,
  } = useModalContext();
  const [, setNotifyModal] = _notifyModal;
  const { token, status, user, logUserOut } = useSiteSession();
  const [isSignupModalDisplayed, setIsSignupModalDisplayed] = useState(false);
  const {
    _wasGpPlusBtnClicked,
    handleGpPlusAccountBtnClick,
    anchorElement,
    gpPlusSubscription,
    isFetching,
    _wasGpPlusSubRetrieved,
  } = useHandleOpeningGpPlusAccount(true);
  const [wasGpPlusSubRetrieved] = _wasGpPlusSubRetrieved;
  const [wasGpPlusBtnClicked, setWasGpPlusBtnClicked] = _wasGpPlusBtnClicked;
  const router = useRouter();

  useGpPlusModalInteraction(!!gpPlusSubscription?.membership);
  useOutsetaInputValidation();

  console.log("gpPlusSubscription, in GP+ component: ", gpPlusSubscription);

  // TODO: if the user is a member, then show the profile modal to the user telling the user to select a membership to buy or if the user chose a membership that they are
  // -tell the user that.

  // Calculate savings percentage (yearly: $60, monthly: $10 * 12 = $120, savings: 50%)
  const yearlySavings = 50; // 50% savings
  const monthlyPrice = 10;
  const yearlyPrice = 60;
  const monthlyEquivalent = yearlyPrice / 12; // $5/month when paid yearly
  const gpPlusBtnTxt = useMemo(() => {
    console.log("gpPlusSubscription, sup there: ", gpPlusSubscription);

    if (
      gpPlusSubscription?.membership?.AccountStageLabel === "Cancelling" ||
      gpPlusSubscription?.membership?.AccountStageLabel === "Subscribing" ||
      gpPlusSubscription?.membership?.AccountStageLabel === "Past due"
    ) {
      return "Manage account";
    }

    return "Sign up";
  }, [gpPlusSubscription, isFetching]);
  const gpLiteBtnTxt = useMemo(() => {
    console.log("gpPlusSubscription, sup there: ", gpPlusSubscription);

    if (status === "authenticated") {
      return "ACCOUNT CREATED";
    }

    return "Sign up for free";
  }, [status]);

  const handleToggle = () => {
    setBillingPeriod((prev) => (prev === "monthly" ? "yearly" : "monthly"));
  };
  const handleSignUpGpPlusBtnClick = async () => {
    if (
      gpPlusSubscription?.membership?.AccountStageLabel === "Cancelling" ||
      gpPlusSubscription?.membership?.AccountStageLabel === "Subscribing" ||
      gpPlusSubscription?.membership?.AccountStageLabel === "Past due"
    ) {
      await handleGpPlusAccountBtnClick();
      return;
    }

    setWasGpPlusBtnClicked(true);

    if (status === "unauthenticated") {
      setTimeout(() => {
        setWasGpPlusBtnClicked(false);
      }, 500);
      return;
    }

    setTimeout(() => {
      setIsSignupModalDisplayed(true);
      setWasGpPlusBtnClicked(false);
    }, 500);
  };
  const handleSignUpLiteBtnClick = async () => {
  };

  useEffect(() => {
    if (isSignupModalDisplayed) {
      console.log("sign up modal displayed");

      const continueToCheckoutBtn = document.querySelector(
        ".o--Register--nextButton"
      ) as HTMLButtonElement | null;
      const payPeriodToggle = document.querySelector(
        ".o--HorizontalToggle--displayMode-auto"
      ) as HTMLButtonElement | null;
      const monthlyOption = payPeriodToggle?.firstChild?.firstChild
        ?.firstChild as HTMLElement | undefined;
      const yearlyOption = payPeriodToggle?.firstChild?.lastChild
        ?.firstChild as HTMLElement | undefined;

      if (billingPeriod === "monthly" && monthlyOption) {
        monthlyOption.click();
      } else if (billingPeriod === "yearly" && yearlyOption) {
        yearlyOption.click();
      }

      console.log("continueToCheckoutBtn: ", continueToCheckoutBtn);

      continueToCheckoutBtn?.addEventListener("click", async (event) => {
        console.log("The continue button was clicked...");

        if ((event.target as HTMLButtonElement).disabled) {
          console.log("The button is disabled.");
          return;
        }

        const emailInput = document.querySelector('[name="Person.Email"]');
        const outsetaEmail = emailInput
          ? (emailInput as HTMLInputElement).value
          : "";

        console.log("outsetaEmail, sup there: ", outsetaEmail);

        if (!outsetaEmail) {
          setNotifyModal({
            headerTxt: "An error has occurred",
            bodyTxt: (
              <>
                Unable to start your checkout session. If this error persists,
                please contact{" "}
                <CustomLink
                  hrefStr={CONTACT_SUPPORT_EMAIL}
                  className="ms-1 mt-2 text-break"
                >
                  feedback@galacticpolymath.com
                </CustomLink>
                .
              </>
            ),
            isDisplayed: true,
            handleOnHide() {
              setNotifyModal(defautlNotifyModalVal);
              window.location.reload();
            },
          });
          setIsSignupModalDisplayed(false);
          return;
        }

        if (!user?.email || !token) {
          setNotifyModal({
            headerTxt: "An error has occurred",
            bodyTxt: (
              <>
                Unable to start your checkout session. You are not logged in.
                The page will refresh after you close this modal.
              </>
            ),
            isDisplayed: true,
            handleOnHide() {
              setNotifyModal(defautlNotifyModalVal);
              logUserOut();
              window.location.reload();
            },
          });
          setIsSignupModalDisplayed(false);
          return;
        }

        console.log(
          "Will save the email the user inputted. Email: ",
          outsetaEmail
        );

        const updateUserResponse = await updateUser(
          { email: user.email },
          { outsetaPersonEmail: outsetaEmail },
          {},
          token
        );

        if (!updateUserResponse?.wasSuccessful) {
          setNotifyModal({
            headerTxt: "An error has occurred",
            bodyTxt: (
              <>
                An error has occurred while trying to update the user's email.
                If this error persists, please contact{" "}
                <CustomLink
                  hrefStr={CONTACT_SUPPORT_EMAIL}
                  className="ms-1 mt-2 text-break"
                >
                  feedback@galacticpolymath.com
                </CustomLink>
                .
              </>
            ),
            isDisplayed: true,
            handleOnHide() {
              setNotifyModal(defautlNotifyModalVal);
              window.location.reload();
            },
          });
          setIsSignupModalDisplayed(false);
          return;
        }
      });
    }
  }, [isSignupModalDisplayed]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const idToken = url.searchParams.get("magic_credential");

    if (idToken){
      console.log("GP+ page loaded with idToken: ", idToken);
      (window as any).Outseta.setMagicLinkIdToken(idToken);
      resetUrl(router);
    } 
  }, []);

  return (
    <Layout
      title="GP+ - Galactic Polymath"
      description="GP+ - Galactic Polymath. Gain access to exclusive feature for GP Plus members."
      langLinks={[]}
      imgSrc="/assets/img/galactic_polymath_logo.png"
      imgAlt="Galactic Polymath Logo"
      url="/gp-plus"
    >
      <div style={{ height: "fit-content" }}>
        <div className="gpplus-pricing-section pt-5">
          <div className="container-fluid">
            <div className="row justify-content-center mt-sm-3 mt-md-0">
              <div
                style={{ height: "80px" }}
                className="position-relative mt-3 col-sm-11 col-md-12"
              >
                <Image
                  src="/plus/gp_plus_desktop.png"
                  alt="gp_plus_logo"
                  fill
                  style={{ objectFit: "contain" }}
                  className="d-none d-sm-block"
                />
                <Image
                  src="/plus/gp_plus_mobile.png"
                  alt="gp_plus_logo"
                  fill
                  style={{ objectFit: "contain" }}
                  className="d-block d-sm-none"
                />
              </div>
            </div>
          </div>
          <div className="gpplus-toggle-row w-100 d-flex justify-content-center align-items-center">
            <div className="d-flex w-75 justify-content-center align-items-center">
              <div className="p-3">
                <span className={billingPeriod === "monthly" ? "active" : ""}>
                  Monthly&nbsp;
                </span>
              </div>
              <label style={{ minWidth: "48px" }} className="gpplus-switch">
                <input
                  type="checkbox"
                  checked={billingPeriod === "yearly"}
                  onChange={handleToggle}
                />
                <span className="gpplus-slider" />
              </label>
              <div className="d-flex flex-column p-3">
                <span
                  className={`${
                    billingPeriod === "yearly" ? "active" : ""
                  } text-center`}
                >
                  &nbsp;Yearly{" "}
                </span>
                <span
                  className={`${
                    billingPeriod === "yearly" ? "active" : ""
                  } text-center`}
                >
                  &nbsp;(Save 50%)
                </span>
              </div>
            </div>
          </div>
          <div
            style={{ height: "fit-content" }}
            className="gpplus-cards-wrapper"
          >
            <div className="gpplus-card lite position-relative">
              <div className="d-flex flex-column align-items-center bg-white h-100">
                <div className="w-100 d-flex justify-content-center align-items-center">
                  <Image
                    alt="lite_logo"
                    src={Logo}
                    width={ICON_DIMENSION}
                    height={ICON_DIMENSION}
                    style={{
                      objectFit: "contain",
                    }}
                  />
                </div>
                <div className="pt-3 pb-1">
                  <div className="gpplus-card-header">Lite</div>
                </div>
                <div>
                  <div className="gpplus-card-subheader mt-2 text-center">
                    INDIVIDUAL
                  </div>
                </div>
                <div>
                  <ul className="gpplus-features">
                    <li>+ 1 user</li>
                    <li>+ 15 STEM units</li>
                    <li>+ 50 STEM lessons</li>
                    <li>+ Access to future lessons</li>
                    <li>+ View-Only access</li>
                  </ul>
                </div>
                <div
                  style={{ height: "195px" }}
                  className="w-100 d-flex justify-content-center align-items-center mt-2"
                >
                  <div className="position-absolute bottom-0 mb-4 w-75">
                    <div>
                      <div className="gpplus-price mb-2 d-flex justify-content-center align-items-center">
                        $0 <span className="ms-1 mt-1">/ {billingPeriod}</span>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={handleSignUpLiteBtnClick}
                        disabled={
                          wasGpPlusSubRetrieved
                            ? status === "authenticated"
                            : true
                        }
                        className={`gpplus-signup-btn lite ${
                          wasGpPlusSubRetrieved
                            ? status === "authenticated"
                              ? "opacity-25"
                              : ""
                            : "opacity-25"
                        }`}
                        style={{
                          height: "65px",
                          cursor: wasGpPlusSubRetrieved
                            ? status === "authenticated"
                              ? "not-allowed"
                              : "pointer"
                            : "not-allowed",
                        }}
                      >
                        {wasGpPlusSubRetrieved ? gpLiteBtnTxt : <Spinner />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="gpplus-card plus highlighted position-relative">
              <div className="d-flex flex-column align-items-center bg-white">
                <div className="w-100 d-flex justify-content-center align-items-center">
                  <Image
                    alt="gp_plus_logo"
                    src="/imgs/gp-logos/gp_submark.png"
                    width={ICON_DIMENSION}
                    height={ICON_DIMENSION}
                    style={{
                      objectFit: "contain",
                      width: ICON_DIMENSION,
                      height: ICON_DIMENSION,
                    }}
                  />
                </div>
                <div className="pt-3 pb-1">
                  <div className="gpplus-card-header">Plus</div>
                </div>
                <div>
                  <div className="gpplus-card-subheader mt-2 text-center">
                    INDIVIDUAL
                  </div>
                </div>
                <div>
                  <ul className="gpplus-features">
                    <li>
                      + Everything in <b>Lite</b>
                    </li>
                    <li>+ Bulk GDrive export of entire units</li>
                    <li>+ Editable lessons</li>
                  </ul>
                </div>
                <div>
                  <div className="bonus-content w-100 text-center text-decoration-underline">
                    BONUS ACCESS TO:{" "}
                  </div>
                  <ul className="gpplus-features pt-2">
                    <li className="gpplus-bonus d-flex justify-content-center align-items-center">
                      <LiContentWithImg txt="JobViz App" />
                    </li>
                  </ul>
                </div>
                <div
                  style={{ height: "195px" }}
                  className="w-100 d-flex justify-content-center align-items-center mt-2"
                >
                  <div className="position-absolute bottom-0 mb-4 w-75">
                    <div
                      className={`${billingPeriod === "yearly" ? "mb-2" : ""}`}
                    >
                      <div
                        className={`gpplus-price ${
                          billingPeriod === "monthly" ? "mb-2" : ""
                        } d-flex justify-content-center align-items-center`}
                      >
                        {billingPeriod === "yearly" ? (
                          <span
                            style={{ fontSize: "1.5rem" }}
                            className="text-muted text-decoration-line-through"
                          >
                            ${monthlyPrice * 12}
                          </span>
                        ) : null}
                        &nbsp;
                        {billingPeriod === "monthly"
                          ? `$${monthlyPrice}`
                          : `$${yearlyPrice}`}{" "}
                        <span className="ms-1 mt-1">
                          / {billingPeriod === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                      {billingPeriod === "yearly" && (
                        <>
                          <div className="d-flex justify-content-center align-items-center text-muted">
                            OR
                          </div>
                          <div className="gpplus-price d-flex justify-content-center align-items-center">
                            <span
                              style={{ fontSize: "1.5rem" }}
                              className="text-muted text-decoration-line-through"
                            >
                              ${monthlyPrice}
                            </span>
                            &nbsp;${monthlyEquivalent}
                            <span className="ms-1 mt-1">/ month</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div>
                      <button
                        className={`gpplus-signup-btn plus ${
                          !wasGpPlusSubRetrieved || wasGpPlusBtnClicked
                            ? "opacity-25"
                            : ""
                        }`}
                        disabled={!wasGpPlusSubRetrieved || wasGpPlusBtnClicked}
                        onClick={handleSignUpGpPlusBtnClick}
                        style={{
                          height: "65px",
                          cursor:
                            !wasGpPlusSubRetrieved || wasGpPlusBtnClicked
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {!wasGpPlusSubRetrieved || wasGpPlusBtnClicked ? (
                          <Spinner />
                        ) : (
                          gpPlusBtnTxt
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="gpplus-card group">
              <div className="d-flex flex-column align-items-center bg-white h-100">
                <div className="w-100 d-flex justify-content-center align-items-center">
                  <Image
                    alt="gp_plus_logo"
                    src="/imgs/gp-logos/gp_submark.png"
                    width={ICON_DIMENSION}
                    height={ICON_DIMENSION}
                    style={{
                      objectFit: "contain",
                      width: ICON_DIMENSION,
                      height: ICON_DIMENSION,
                    }}
                  />
                </div>
                <div className="pt-3 pb-1">
                  <div className="gpplus-card-header">Group</div>
                </div>
                <div>
                  <div className="gpplus-card-subheader mt-2 text-center">
                    SCHOOL & DISTRICT
                  </div>
                </div>
                <div>
                  <ul className="gpplus-features">
                    <li>
                      + Everything in <b>Plus</b>
                    </li>
                    <li>+ 10 users</li>
                  </ul>
                </div>
                <div
                  style={{ height: "195px" }}
                  className="w-100 d-flex justify-content-center align-items-center mt-2"
                >
                  <div className="position-absolute bottom-0 mb-4 w-75">
                    <button
                      className="gpplus-signup-btn group"
                      style={{
                        height: "65px",
                      }}
                    >
                      Request a quote
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {["Subscribing", "Canceling"].includes(
          gpPlusSubscription?.membership?.AccountStageLabel ?? ""
        )
          ? anchorElement
          : null}
        <div
          id="signup-modal-div"
          style={{
            zIndex: 1000000,
            width: "100vw",
            height: "100vh",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
          className={`position-fixed ${
            isSignupModalDisplayed ? "visible" : "invisible"
          }`}
        >
          <div className="position-relative w-100 h-100">
            <div
              id="success-modal-close-btn"
              className={`position-absolute top-0 start-0 w-100 h-100 bg-dark ${
                isSignupModalDisplayed ? "d-block fade-backdrop-in" : "d-none"
              }`}
              onClick={() => {
                setIsSignupModalDisplayed(false);
              }}
            />
            <div
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                borderRadius: ".5em",
                zIndex: isSignupModalDisplayed ? 1000 : -1000,
                maxHeight: "95vh",
              }}
              className={`position-absolute w-50 rounded-lg shadow-lg overflow-scroll bg-white ${
                isSignupModalDisplayed
                  ? "visible fade-modal-in-short"
                  : "fade-modal-out-short"
              }`}
            >
              <div
                id="outseta-sign-up"
                data-o-auth="1"
                data-widget-mode="register"
                data-plan-uid="rmkkjamg"
                data-plan-payment-term="month"
                data-skip-plan-options="false"
                data-mode="embed"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GpPlus;
