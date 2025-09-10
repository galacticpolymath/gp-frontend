/* eslint-disable quotes */

import React from "react";
import { useRouter } from "next/router";
import CustomLink from "../components/CustomLink";
import { CONTACT_SUPPORT_EMAIL } from "../globalVars";
import Layout from "../components/Layout";
import { useSession } from "next-auth/react";
import { getLocalStorageItem } from "../shared/fns";

const GpSignUpResult: React.FC = () => {
  const { status } = useSession();
  const router = useRouter();
  const { access_token } = router.query;
  let resultJsx = (
    <>
      <p>Unable to determine if GP Plus sign up was successful.</p>
      <p className="mt-1">Please contact our support team: </p>
      <CustomLink
        hrefStr={CONTACT_SUPPORT_EMAIL}
        className="ms-1 mt-2 text-break"
      >
        feedback@galacticpolymath.com
      </CustomLink>
      .
    </>
  );
  const gpPlusFeatureLocation = getLocalStorageItem("gpPlusFeatureLocation");

  if (status === "authenticated" && access_token) {
    console.log("gpPlusFeatureLocation, yo there: ", gpPlusFeatureLocation);

    resultJsx = (
      <>
        <p className="mt-2 text-center">
          Congratulations! You have successfully subscribed to GP Plus.
        </p>
        <p className="mt-2 text-center">Thank you!</p>
        {gpPlusFeatureLocation && (
          <p className="mt-2 text-center">
            Click{" "}
            <a
              href={gpPlusFeatureLocation}
              className="text-primary underline-on-hover"
            >
              here
            </a>{" "}
            to use it.
          </p>
        )}
      </>
    );
  }

  if (status === "unauthenticated" && access_token) {
    resultJsx = (
      <>
        <p className="mt-2 text-center">
          Congratulations! You have successfully subscribed to GP Plus.
        </p>
        <p className="mt-2 text-center">
          Please <p>login</p> to use your GP Plus account.
        </p>
      </>
    );
  }

  return (
    <Layout
      title="GP Plus Sign Up Result"
      description="GP Plus sign up result page."
      url="/gp-sign-up-result"
      imgSrc="/assets/img/galactic_polymath_logo.png"
      imgAlt="Galactic Polymath Logo"
      langLinks={[]}
    >
      <div className="mt-5 min-vh-100 min-vw-100 ps-5">{resultJsx}</div>
    </Layout>
  );
};

export default GpSignUpResult;
