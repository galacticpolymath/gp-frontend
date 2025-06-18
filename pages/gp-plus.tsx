import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import GpPlusSignUp from "../components/GpPlus/SignUp";
import { Button } from "react-bootstrap";
import Modal from "../components/Modal";

export function injectOutsetaScripts() {
  const existingConfig = document.querySelector(
    'script[data-outseta="config"]'
  );

  if (existingConfig) existingConfig.remove();

  const existingMain = document.querySelector(
    'script[src="https://cdn.outseta.com/outseta.min.js"]'
  );

  if (existingMain) existingMain.remove();

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
      <div className="min-vh-100 min-vw-100 pt-5 ps-5">
        <h1>GP+</h1>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsSignupModalDisplayed(true)}
        >
          SIGN UP
        </Button>
      </div>
      <Modal
        show={isSignupModalDisplayed}
        style={{ opacity: signUpModalOpacity }}
        onHide={handleOnHide}
        onShow={() => {
          injectOutsetaScripts();
          setSignUpModalOpacity(1);
          const outsetaModalContent = document.getElementById(
            "outseta-sign-up-modal-content"
          );
          const outseta = document.getElementById("outseta-container")
            ?.firstChild as HTMLElement | null;

          console.log("outseta, sup there: ", outseta);

          if (!outseta) {
            return;
          }

          outsetaModalContent?.appendChild(outseta);
        }}
        onBackdropClick={handleOnHide}
        className="pt-1 gp-sign-up-modal pb-3"
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
      </Modal>
    </Layout>
  );
};

export default GpPlus;
