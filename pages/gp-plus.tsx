import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import GpPlusSignUp from "../components/GpPlus/SignUp";
import { Button, Modal } from "react-bootstrap";

const GpPlus: React.FC = () => {
  const [signUpElement, setSignUpElement] = useState<HTMLElement | null>(null);
  const [isSignupModalDisplayed, setIsSignupModalDisplayed] = useState(false);
  const [signUpModalOpacity, setSignUpModalOpacity] = useState(1);

  const handleOnHide = () => {
    setSignUpModalOpacity(0);

    setTimeout(() => {
      const outsetaModalContent = document.getElementById(
        "outseta-sign-up-modal-content"
      );
      const outsetaSignUp =
        outsetaModalContent?.firstChild as HTMLElement | null;
      const outsetaContainer = document.getElementById("outseta-container");

      if (outsetaSignUp) {
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
      <div id="outseta-container">
        <div
          id="outseta-sign-up"
          style={{
            display: "none",
            pointerEvents: "none",
          }}
          data-o-auth="1"
          data-widget-mode="register"
          data-plan-uid="rmkkjamg"
          data-plan-payment-term="month"
          data-skip-plan-options="false"
          data-mode="embed"
        />
      </div>
      <Modal
        show={isSignupModalDisplayed}
        style={{ opacity: signUpModalOpacity }}
        onHide={handleOnHide}
        onShow={() => {
          setSignUpModalOpacity(1);
          const outsetaModalContent = document.getElementById(
            "outseta-sign-up-modal-content"
          );
          const outseta = document.getElementById("outseta-container")
            ?.firstChild as HTMLElement | null;

          if (!outseta) {
            return;
          }

          outseta.style.display = "block";
          outseta.style.pointerEvents = "auto";
          outsetaModalContent?.appendChild(outseta);
        }}
        onBackdropClick={handleOnHide}
        dialogClassName="selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center"
        contentClassName="create-account-ui-modal pt-2 box-shadow-login-ui-modal"
      >
        <div id="outseta-sign-up-modal-content" />
      </Modal>
    </Layout>
  );
};

export default GpPlus;
