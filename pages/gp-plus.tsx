/* eslint-disable quotes */
/* eslint-disable indent */

import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
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
import {
  calculatePercentSaved,
  getLocalStorageItem,
  setLocalStorageItem,
} from "../shared/fns";
import ThankYouModal from "../components/GpPlus/ThankYouModal";
import { connectToMongodb } from "../backend/utils/connection";
import {
  filterInShowableUnits,
  retrieveUnits,
} from "../backend/services/unitServices";
import {
  getPlans,
  TAccountStageLabel,
} from "../backend/services/outsetaServices";

interface IProps {
  liveUnitsTotal?: number;
  plusPlanPercentSaved?: number;
  errType?: string;
  errObj?: object;
}

export const SELECTED_GP_PLUS_BILLING_TYPE =
  "selected_gp_plus_billing_type" as const;
const DEFAULT_LIVE_UNITS_TOTAL = 17;
const ICON_DIMENSION = 70;
const BTN_HEIGHT = "42px";
const HAS_MEMBERSHIP_STATUSES: Set<TAccountStageLabel> = new Set([
  "Cancelling",
  "Subscribing",
  "Past due",
] as TAccountStageLabel[]);

const LiContentWithImg: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <div className="d-flex">
        <div className="d-flex justify-content-center align-items-center">
          <Image
            src="/imgs/gp-logos/gp_submark.png"
            alt="gp_plus_logo"
            width={32}
            height={32}
            style={{ width: "32px", height: "32px", objectFit: "contain" }}
          />
        </div>
        <div className="d-flex justify-content-center align-items-center ms-1">
          {children}
        </div>
      </div>
    </>
  );
};

const CardTitle: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="pt-3 pb-1">
      <div className="gpplus-card-header">{children}</div>
    </div>
  );
};

const GpPlus: React.FC<IProps> = ({
  liveUnitsTotal,
  errObj,
  errType,
  plusPlanPercentSaved,
}) => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const { _notifyModal } = useModalContext();
  const [, setNotifyModal] = _notifyModal;
  const siteSession = useSiteSession();
  const { token, status, user, logUserOut } = siteSession;
  const [wasGpLiteBtnClicked, setWasGpLiteBtnClicked] = useState(false);
  const [isSignupModalDisplayed, setIsSignupModalDisplayed] = useState(false);
  const [wasGpPlusSubRetrieved, setWasGpPlusSubRetrieved] = useState(false);
  const {
    _wasGpPlusBtnClicked,
    handleGpPlusAccountBtnClick,
    anchorElement,
    gpPlusSubscription,
    isFetching,
  } = useHandleOpeningGpPlusAccount(true, setWasGpPlusSubRetrieved);
  const [wasGpPlusBtnClicked, setWasGpPlusBtnClicked] = _wasGpPlusBtnClicked;
  const router = useRouter();

  useGpPlusModalInteraction(gpPlusSubscription?.membership?.BillingRenewalTerm);
  useOutsetaInputValidation();

  const [didUserSignUp, setDidUserSignUp] = useState(false);
  const monthlyPrice = 10;
  const yearlyPrice = 60;
  const monthlyEquivalent = yearlyPrice / 12; // $5/month when paid yearly
  const gpPlusBtnTxt: "Manage account" | "Sign up" = useMemo(() => {
    console.log("gpPlusSubscription, sup there: ", gpPlusSubscription);
    const hasMemeberhsip =
      gpPlusSubscription?.membership?.AccountStageLabel &&
      HAS_MEMBERSHIP_STATUSES.has(
        gpPlusSubscription?.membership?.AccountStageLabel
      );

    if (hasMemeberhsip) {
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

  useEffect(() => {
    console.log("gpPlusSubscription, sup there: ", gpPlusSubscription);
    console.log("gpPlusBtnTxt, yo there: ", gpPlusBtnTxt);
    console.log("wasGpPlusSubRetrieved, yo there: ", wasGpPlusSubRetrieved);
  });

  const handleToggle = () => {
    setBillingPeriod((prev) => (prev === "monthly" ? "yearly" : "monthly"));
  };

  const handleSignUpGpPlusBtnClick = async () => {
    if (
      gpPlusSubscription?.membership?.AccountStageLabel &&
      HAS_MEMBERSHIP_STATUSES.has(
        gpPlusSubscription?.membership?.AccountStageLabel
      )
    ) {
      await handleGpPlusAccountBtnClick();
      return;
    }

    setWasGpPlusBtnClicked(true);

    if (status === "unauthenticated") {
      setTimeout(() => {
        setWasGpPlusBtnClicked(false);
        router.push(
          `/sign-up?${SELECTED_GP_PLUS_BILLING_TYPE}=${
            billingPeriod === "yearly" ? "year" : "month"
          }`
        );
      }, 200);
      return;
    }

    setTimeout(() => {
      setIsSignupModalDisplayed(true);
      setWasGpPlusBtnClicked(false);
    }, 200);
  };

  const handleSignUpLiteBtnClick = async () => {
    setWasGpLiteBtnClicked(true);

    setTimeout(() => {
      router.push("/sign-up");
      setWasGpLiteBtnClicked(false);
    }, 300);
  };

  useEffect(() => {
    const emailInput =
      status === "authenticated"
        ? (document.querySelector(
            '[name="Person.Email"]'
          ) as HTMLInputElement | null)
        : null;

    console.log("siteSession: ", siteSession);
    console.log("emailInput, yo there: ", emailInput);

    if (status === "authenticated" && emailInput) {
      emailInput.value = user?.email || "";
      emailInput.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (status === "authenticated") {
      console.error(
        "An error occurred: Email input could not be found despite user being authenticated."
      );
    }

    if (status === "authenticated") {
      window.Outseta?.on("signup", () => {
        console.log("The user has signed up.");
        const gpPlusFeatureLocation = getLocalStorageItem(
          "gpPlusFeatureLocation"
        );

        console.log("gpPlusFeatureLocation: ", gpPlusFeatureLocation);

        // will redirect to the selected unit so that user can copy it
        if (gpPlusFeatureLocation?.includes("#")) {
          setLocalStorageItem("willShowGpPlusPurchaseThankYouModal", true);

          window.location.href = gpPlusFeatureLocation;

          return false;
        }

        // will redirect to the account page
        if (gpPlusFeatureLocation) {
          console.log("Will redirect the user.");
          window.location.href = `${gpPlusFeatureLocation}?gp_plus_subscription_bought=true`;

          return false;
        }

        const currentUrl = window.location.href;
        window.location.href = currentUrl;

        return false;
      });
    }
  }, [status, isSignupModalDisplayed]);

  const outsetaEmbeddedRef = useRef<HTMLDivElement | null>(null);
  const outsetaEmbeddedCallback = () => {
    const stateRegisterConfirmation = document.querySelector(
      ".state-registerConfirmation"
    );

    if (stateRegisterConfirmation) {
      setDidUserSignUp(true);
    }
  };

  useEffect(() => {
    if (
      status === "authenticated" &&
      gpPlusSubscription?.membership?.AccountStageLabel &&
      HAS_MEMBERSHIP_STATUSES.has(
        gpPlusSubscription?.membership?.AccountStageLabel
      ) &&
      outsetaEmbeddedRef.current
    ) {
      const oberserver = new MutationObserver(outsetaEmbeddedCallback);

      oberserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        oberserver.disconnect();
      };
    }
  }, [status, gpPlusSubscription]);

  useEffect(() => {
    if (isSignupModalDisplayed) {
      console.log("sign up modal displayed");

      const continueToCheckoutBtn = document.querySelector(
        ".o--Register--nextButton"
      ) as HTMLButtonElement | null;
      const payPeriodToggle = document.querySelector(
        ".o--HorizontalToggle--horizontalToggle"
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

        const emailInput = document.querySelector(
          '[name="Person.Email"]'
        ) as HTMLInputElement | null;
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
          { outsetaAccountEmail: outsetaEmail },
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

    if (idToken) {
      console.log("GP+ page loaded with idToken: ", idToken);
      (window as any).Outseta.setMagicLinkIdToken(idToken);
      resetUrl(router);
    }
  }, []);

  const isGpLiteBtnDisabled = !wasGpPlusSubRetrieved || wasGpLiteBtnClicked;

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
          <div className="container-fluid pt-md-0 pt-sm-4">
            <div className="row justify-content-center mt-sm-3 mt-md-0">
              <div className="position-relative mt-1 col-sm-11 col-md-12 gp-plus-logo-container d-flex justify-content-center align-items-center">
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
          <div className="d-flex justify-content-center align-items-center mt-3 mt-sm-2 mb-0">
            <p
              style={{ fontSize: "1rem" }}
              className="text-center text-md-start"
            >
              <i>
                Help keep this site live & support the free tier by subscribing
                to GP+
              </i>
            </p>
          </div>
          <div className="gpplus-toggle-row w-100 d-flex justify-content-center align-items-center pb-1">
            <div className="d-flex flex-column flex-sm-row w-75 justify-content-center align-items-center">
              <div className="px-3 mb-sm-0 mb-1">
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
              <div className="d-flex px-3 mt-sm-0 mt-1">
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
                  &nbsp;(Save {plusPlanPercentSaved || 50}%)
                </span>
              </div>
            </div>
          </div>
          <div
            style={{ height: "fit-content" }}
            className="gpplus-cards-wrapper"
          >
            <div className="gpplus-card lite position-relative">
              <div className="d-flex flex-column align-items-center bg-white">
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
                <CardTitle>Free</CardTitle>
                <div>
                  <div className="gpplus-card-subheader mt-2 text-center">
                    INDIVIDUAL
                  </div>
                </div>
                <div>
                  <ul className="gpplus-features">
                    <li>+ 1 user</li>
                    <li>+ ALL {liveUnitsTotal} STEM units</li>
                    <li>+ Over 100 lessons and videos</li>
                    <li>+ Access to future lessons</li>
                    <li>
                      + <i>View-Only</i> teaching materials
                    </li>
                  </ul>
                </div>
                <div
                  style={{ height: "195px" }}
                  className="w-100 d-flex justify-content-center align-items-center"
                >
                  <div className="position-absolute bottom-0 mb-3 w-75">
                    <div>
                      <div className="gpplus-price mb-2 d-flex justify-content-center align-items-center">
                        $0 <span className="mt-1 ms-1">/{billingPeriod}</span>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={handleSignUpLiteBtnClick}
                        disabled={
                          isGpLiteBtnDisabled || status === "authenticated"
                        }
                        className={`gpplus-signup-btn d-flex justify-content-center align-items-center lite ${
                          isGpLiteBtnDisabled || status === "authenticated"
                            ? "opacity-25"
                            : ""
                        }`}
                        style={{
                          height: BTN_HEIGHT,
                          cursor:
                            isGpLiteBtnDisabled || status === "authenticated"
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {isGpLiteBtnDisabled ? <Spinner /> : gpLiteBtnTxt}
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
                <CardTitle>Plus</CardTitle>
                <div>
                  <div className="gpplus-card-subheader mt-2 text-center">
                    INDIVIDUAL
                  </div>
                </div>
                <div>
                  <ul className="gpplus-features">
                    <li>
                      + Everything in <b>Free</b>
                    </li>
                    <li>+ Bulk copy entire units to your GDrive</li>
                    <li>
                      + <i>Editable</i> teaching materials
                    </li>
                  </ul>
                </div>
                <div>
                  <div
                    style={{ color: "#FF4EFF" }}
                    className="bonus-content w-100 text-center"
                  >
                    (Coming Soon){" "}
                  </div>
                  <div className="bonus-content w-100 text-center text-decoration-underline">
                    BONUS ACCESS TO:{" "}
                  </div>
                  <ul className="gpplus-features pt-2">
                    <li className="gpplus-bonus d-flex justify-content-center align-items-center">
                      <LiContentWithImg>JobViz App</LiContentWithImg>
                    </li>
                    <li className="gpplus-bonus d-flex justify-content-center align-items-center">
                      <LiContentWithImg>Classroom Activator</LiContentWithImg>
                    </li>
                  </ul>
                </div>
                <div
                  style={{ height: "180px" }}
                  className="w-100 d-flex justify-content-center align-items-center mt-2"
                >
                  <div className="position-absolute bottom-0 mb-3 w-75">
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
                            style={{ fontSize: "1.15rem" }}
                            className="text-muted text-decoration-line-through"
                          >
                            ${monthlyPrice * 12}
                          </span>
                        ) : null}
                        &nbsp;
                        {billingPeriod === "monthly"
                          ? `$${monthlyPrice}`
                          : `$${yearlyPrice}`}
                        <span className="mt-1 ms-1">
                          /{billingPeriod === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                      {billingPeriod === "yearly" && (
                        <>
                          <div className="d-flex justify-content-center align-items-center text-muted">
                            OR
                          </div>
                          <div className="gpplus-price d-flex justify-content-center align-items-center">
                            <span
                              style={{ fontSize: "1.15rem" }}
                              className="text-muted text-decoration-line-through"
                            >
                              ${monthlyPrice}
                            </span>
                            &nbsp;${monthlyEquivalent}
                            <span className="mt-1 ms-1">/month</span>
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
                          height: BTN_HEIGHT,
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
                <CardTitle>Group</CardTitle>
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
                    <li>+ Discounts for 10 users</li>
                  </ul>
                </div>
                <div
                  style={{ height: "195px" }}
                  className="w-100 d-flex justify-content-center align-items-center mt-2"
                >
                  <div className="position-absolute bottom-0 mb-3 w-75">
                    <button
                      className="gpplus-signup-btn group"
                      style={{
                        height: BTN_HEIGHT,
                      }}
                      onClick={() => {
                        window.open(
                          "https://www.galacticpolymath.com/gp-group-pricing",
                          "_blank"
                        )?.focus();
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
        {gpPlusSubscription?.membership?.AccountStageLabel &&
        HAS_MEMBERSHIP_STATUSES.has(
          gpPlusSubscription?.membership?.AccountStageLabel
        )
          ? anchorElement
          : null}
        {gpPlusBtnTxt === "Sign up" && (
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

                  console.log("didUserSignUp: ", didUserSignUp);

                  if (didUserSignUp) {
                    setWasGpPlusBtnClicked(true);
                    setWasGpLiteBtnClicked(true);
                    setTimeout(() => {
                      window.location.reload();
                    }, 300);
                  }
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
                className={`position-absolute gp-plus-signup-modal rounded-lg shadow-lg overflow-scroll bg-white ${
                  isSignupModalDisplayed
                    ? "visible fade-modal-in-short"
                    : "fade-modal-out-short"
                }`}
              >
                <div
                  ref={outsetaEmbeddedRef}
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
        )}
      </div>
      <ThankYouModal />
    </Layout>
  );
};

export const getStaticProps = async () => {
  try {
    await connectToMongodb(15_000, 0, true);

    const { wasSuccessful, data: units } = await retrieveUnits({}, {});

    if (!wasSuccessful || !units) {
      return {
        props: {
          errType: "unitsRetrievalErr",
        },
      };
    }

    const liveUnits = filterInShowableUnits(units, new Date().getTime(), false);
    const plans = await getPlans();
    const plusPlan = plans
      ? plans.find((plan) => plan.Name === "Galactic Polymath Plus")
      : undefined;
    let plusPlanPercentSaved: number | undefined;

    if (plans?.length && plusPlan) {
      const monthlyRateForYearlyPlan = Math.ceil(plusPlan.AnnualRate / 12);
      plusPlanPercentSaved = calculatePercentSaved(
        plusPlan.MonthlyRate,
        monthlyRateForYearlyPlan
      );
    }

    return {
      props: {
        liveUnitsTotal: liveUnits?.length || DEFAULT_LIVE_UNITS_TOTAL,
        plusPlanPercentSaved,
      },
      revalidate: 30,
    };
  } catch (error) {
    console.error(
      "An error has occurred in getting the available paths for the selected lesson page. Error message: ",
      error
    );

    return {
      props: {
        errType: "unitsRetrievalErr",
        errObj: error,
      },
      revalidate: 30,
    };
  }
};

export default GpPlus;
