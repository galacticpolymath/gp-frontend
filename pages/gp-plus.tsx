import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import GpPlusSignUp from "../components/GpPlus/SignUp";
import { Button } from "react-bootstrap";
import Modal, {
  closeButtonStyles,
  modalContentStyles,
  modalStyles,
} from "../components/Modal";

const GpPlus: React.FC = () => {
  // make a request to the backend, within getServerSideProps to determine if the user is GpPlusMember
  const [isSignupModalDisplayed, setIsSignupModalDisplayed] = useState(false);

  useEffect(() => {
    const widgetEl = document.createElement("div");

    widgetEl.setAttribute("data-o-auth", "1");
    widgetEl.setAttribute("data-widget-mode", "register");
    widgetEl.setAttribute("data-plan-uid", "rmkkjamg");
    widgetEl.setAttribute("data-plan-payment-term", "month");
    widgetEl.setAttribute("data-skip-plan-options", "true");
    widgetEl.setAttribute("data-mode", "embed");

    const parent = document.getElementById("outseta-sign-up");

    parent?.appendChild(widgetEl);
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
      {/* <div id="outseta-sign-up"></div> */}
      <GpPlusSignUp
        _isSignupModalDisplayed={[
          isSignupModalDisplayed,
          setIsSignupModalDisplayed,
        ]}
      />
    </Layout>
  );
};

export default GpPlus;
