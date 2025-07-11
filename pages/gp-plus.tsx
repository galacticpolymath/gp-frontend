/* eslint-disable quotes */

import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Button } from "react-bootstrap";
import Modal from "../components/Modal";
import magic from "magic-sdk";

export function injectOutsetaScripts() {
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
}

const GpPlus: React.FC = () => {
  const [isSignupModalDisplayed, setIsSignupModalDisplayed] = useState(false);
  const [signUpModalOpacity, setSignUpModalOpacity] = useState(1);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );

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

    // TODO:
    // CASE: the user is not signed in
    // GOAL: show the log in button for the user to sign in the user clicks on the sign up button

    // CASE: the user is signed in, but is not a gp plus member
    // GOAL: present the sign up modal

    // GOAL: make a request to the outseta to determine if the user has an outseta account
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
        <div className="gpplus-cards-wrapper">
          <div className="gpplus-card lite">
            <div className="gpplus-card-header">Lite</div>
            <div className="gpplus-card-subheader">INDIVIDUAL</div>
            <ul className="gpplus-features">
              <li>+ 1 user</li>
              <li>+ 15 STEM units</li>
              <li>+ 50 STEM lessons</li>
              <li>+ Access to future lessons</li>
              <li>+ View-Only access</li>
            </ul>
            <div className="gpplus-price">
              $0 <span>/ {billingPeriod}</span>
            </div>
            <button className="gpplus-signup-btn lite">Sign up free</button>
          </div>
          <div className="gpplus-card plus highlighted">
            <div className="gpplus-card-header">Plus</div>
            <div className="gpplus-card-subheader">INDIVIDUAL</div>
            <ul className="gpplus-features">
              <li>+ 1 user</li>
              <li>+ 15 STEM units</li>
              <li>+ 50 STEM lessons</li>
              <li>+ Access to future lessons</li>
              <li>+ Bulk GDrive export of entire units</li>
              <li>+ Editable lessons</li>
              <li>+ Autograding</li>
            </ul>
            <div className="bonus-content w-100">Bonus access to: </div>
            <ul className="gpplus-features pt-1 ps-2">
              <li className="gpplus-bonus">+ JobViz App</li>
              <li className="gpplus-bonus">+ Classroom Activator</li>
              <li className="gpplus-bonus">+ STEM Vocabulary Flashcards</li>
            </ul>
            <div className="gpplus-price">
              {billingPeriod === "monthly" ? "$10" : "$60"}{" "}
              <span>/ {billingPeriod === "monthly" ? "month" : "year"}</span>
            </div>
            <button
              className="gpplus-signup-btn plus"
              onClick={handleSignUpBtnClick}
            >
              Sign up
            </button>
          </div>
          <div className="gpplus-card group">
            <div className="gpplus-card-header">Group</div>
            <div className="gpplus-card-subheader">SCHOOL & DISTRICT</div>
            <ul className="gpplus-features">
              <li>+ 10 users</li>
              <li>+ 15 STEM units</li>
              <li>+ 50 STEM lessons</li>
              <li>+ Access to future lessons</li>
              <li>+ Bulk GDrive export of entire units</li>
              <li>+ Fully editable lessons</li>
              <li>+ Autograding</li>
            </ul>
            <div className="gpplus-price">Request a quote</div>
            <button className="gpplus-signup-btn group">Request a quote</button>
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
    </Layout>
  );
};

export default GpPlus;
