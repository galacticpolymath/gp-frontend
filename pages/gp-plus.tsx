import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import GpPlusSignUp from "../components/GpPlus/SignUp";
import { Button } from "react-bootstrap";

const GpPlus: React.FC = () => {
  // make a request to the backend, within getServerSideProps to determine if the user is GpPlusMember
  const [isSignupModalDisplayed, setIsSignupModalDisplayed] = useState(false);

  useEffect(() => {
    // Wait until Outseta is loaded, then render widgets
    if (
      window &&
      typeof window === "object" &&
      "Outseta" in window &&
      typeof window.Outseta === "object" &&
      window.Outseta &&
      "renderWidgets" in window.Outseta &&
      typeof window.Outseta.renderWidgets === "function"
    ) {
      console.log("will execute renderWidgets");
      window.Outseta.renderWidgets();
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
      <div
        data-o-auth="1"
        data-widget-mode="register"
        data-plan-uid="rmkkjamg"
        data-plan-payment-term="month"
        data-skip-plan-options="true"
        data-mode="embed"
      ></div>

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
