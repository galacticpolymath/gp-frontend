/* eslint-disable quotes */

import React, { Fragment, useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Button } from "react-bootstrap";
import Modal from "../components/Modal";
import magic from "magic-sdk";
import Image from "next/image";
import Logo from "../assets/img/logo.ico";
import useSiteSession from "../customHooks/useSiteSession";
import { getIndividualGpPlusSubscription } from "../apiServices/user/crudFns";

const ICON_DIMENSION = 125;

export const injectOutsetaScripts = () => {
  const existingConfig = document.querySelector(
    'script[data-outseta="config"]'
  );

  if (existingConfig) {
    existingConfig.remove();
  }

  const existingMain = document.querySelector(
    'script[src="https://cdn.outseta.com/outseta.min.js"]'
  );

  if (existingMain) {
    existingMain.remove();
  }

  const configScript = document.createElement("script");
  configScript.type = "text/javascript";
  configScript.setAttribute("data-outseta", "config");
  configScript.text = `
    var currentOrigin = window.location.origin;
    var o_options = {
      domain: 'galactic-polymath.outseta.com',
      load: 'auth,customForm,emailList,leadCapture,nocode,profile,support',
      auth: {
        authenticationCallbackUrl: currentOrigin + '/gp-sign-up-result',
        registrationConfirmationUrl: currentOrigin + '/gp-plus-set-password',
      }
    };
  `;
  document.body.appendChild(configScript);

  const mainScript = document.createElement("script");
  mainScript.src = "https://cdn.outseta.com/outseta.min.js";
  mainScript.setAttribute("data-options", "o_options");
  mainScript.async = true;

  document.body.appendChild(mainScript);
};

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
  const [isSignupModalDisplayed, setIsSignupModalDisplayed] = useState(false);
  const [signUpModalOpacity, setSignUpModalOpacity] = useState(1);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const { token, status } = useSiteSession();

  const handleToggle = () => {
    setBillingPeriod((prev) => (prev === "monthly" ? "yearly" : "monthly"));
  };
  const handleOnHide = () => {
    setSignUpModalOpacity(0);

    setTimeout(() => {
      const outsetaModalContent = document.getElementById(
        "outseta-sign-up-modal-content"
      );
      const _outsetaSignUp =
        outsetaModalContent?.firstChild as HTMLElement | null;
      const outsetaContainer = document.getElementById(
        "outseta-container"
      ) as HTMLElement | null;

      if (_outsetaSignUp) {
        _outsetaSignUp.remove();

        injectOutsetaScripts();

        const outsetaSignUp = document.createElement("div");

        outsetaSignUp.setAttribute("data-o-auth", "1");
        outsetaSignUp.setAttribute("data-widget-mode", "register");
        outsetaSignUp.setAttribute("data-plan-uid", "rmkkjamg");
        outsetaSignUp.setAttribute("data-plan-payment-term", "month");
        outsetaSignUp.setAttribute("data-skip-plan-options", "false");
        outsetaSignUp.setAttribute("data-mode", "embed");
        outsetaSignUp.style.display = "block";
        outsetaSignUp.style.pointerEvents = "none";

        outsetaContainer?.appendChild(outsetaSignUp);
      }

      setIsSignupModalDisplayed(false);
    }, 200);
  };
  const handleSignUpBtnClick = () => {
    // GOAL: check if the user has an outseta account when the user clicks on this button
    setIsSignupModalDisplayed(true);
  };
  const getGpPlusMembership = async () => {
    const gpPlusSubscription = await getIndividualGpPlusSubscription(token);

    console.log("gpPlusSubscription: ", gpPlusSubscription);
  };

  useEffect(() => {
    const outsetaModalContent = document.getElementById(
      "outseta-sign-up-modal-content"
    );

    console.log("outsetaModalContent: ", outsetaModalContent);

    const outseta = document.getElementById("outseta-sign-up");

    console.log("outseta: ", outseta);

    if (outseta) {
      outsetaModalContent?.appendChild(outseta);
    }

    injectOutsetaScripts();
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      getGpPlusMembership();
      // TODO:
      // CASE: the user is not signed in
      // GOAL: show the log in button for the user to sign in the user clicks on the sign up button
      // CASE: the user is signed in, but is not a gp plus member
      // GOAL: present the sign up modal
      // GOAL: make a request to the outseta to determine if the user has an outseta account
    }
  }, [status]);

  return (
    <Layout
      title="GP+ - Galactic Polymath"
      description="GP+ - Galactic Polymath. Gain access to exclusive feature for GP Plus members."
      langLinks={[]}
      imgSrc="/assets/img/galactic_polymath_logo.png"
      imgAlt="Galactic Polymath Logo"
      url="/gp-plus"
    >
      <div style={{ height: "fit-content" }} className="">
        <div className="gpplus-pricing-section">
          <h1>GP+</h1>
          <div className="gpplus-toggle-row">
            <span className={billingPeriod === "monthly" ? "active" : ""}>
              Monthly
            </span>
            <label className="gpplus-switch">
              <input
                type="checkbox"
                checked={billingPeriod === "yearly"}
                onChange={handleToggle}
              />
              <span className="gpplus-slider" />
            </label>
            <span className={billingPeriod === "yearly" ? "active" : ""}>
              Yearly
            </span>
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
                  style={{ height: "155px" }}
                  className="w-100 d-flex justify-content-center align-items-center mt-2"
                >
                  <div className="position-absolute bottom-0 mb-4 w-75">
                    <div>
                      <div className="gpplus-price d-flex justify-content-center align-items-center">
                        $0 <span className="ms-1 mt-1">/ {billingPeriod}</span>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={handleSignUpBtnClick}
                        className="gpplus-signup-btn lite"
                      >
                        Sign up free
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
                    <li>+ 1 user</li>
                    <li>+ 15 STEM units</li>
                    <li>+ 50 STEM lessons</li>
                    <li>+ Access to future lessons</li>
                    <li>+ Bulk GDrive export of entire units</li>
                    <li>+ Editable lessons</li>
                    <li>+ Autograding</li>
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
                    <li className="gpplus-bonus d-flex justify-content-center align-items-center">
                      <LiContentWithImg txt="Classroom Activator" />
                    </li>
                  </ul>
                </div>
                <div
                  style={{ height: "155px" }}
                  className="w-100 d-flex justify-content-center align-items-center mt-2"
                >
                  <div className="position-absolute bottom-0 mb-4 w-75">
                    <div>
                      <div className="gpplus-price d-flex justify-content-center align-items-center">
                        {billingPeriod === "monthly" ? "$10" : "$60"}{" "}
                        <span className="ms-1 mt-1">
                          / {billingPeriod === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <button
                        className="gpplus-signup-btn plus"
                        onClick={handleSignUpBtnClick}
                      >
                        Sign up
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
                  <div className="gpplus-card-header">Group</div>
                </div>
                <div>
                  <div className="gpplus-card-subheader mt-2 text-center">
                    SCHOOL & DISTRICT
                  </div>
                </div>
                <div>
                  <ul className="gpplus-features">
                    <li>+ 10 users</li>
                    <li>+ 15 STEM units</li>
                    <li>+ 50 STEM lessons</li>
                    <li>+ Access to future lessons</li>
                    <li>+ Bulk GDrive export of entire units</li>
                    <li>+ Fully editable lessons</li>
                    <li>+ Autograding</li>
                  </ul>
                </div>
                <div
                  style={{ height: "155px" }}
                  className="w-100 d-flex justify-content-center align-items-center mt-2"
                >
                  <div className="position-absolute bottom-0 mb-4 w-75">
                    <button className="gpplus-signup-btn group">
                      Request a quote
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
