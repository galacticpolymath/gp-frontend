import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CustomLink from "../components/CustomLink";
import { CONTACT_SUPPORT_EMAIL } from "../globalVars";
import Layout from "../components/Layout";
import AboutUserModal from "../components/User/AboutUser/AboutUserModal";
import { useModalContext } from "../providers/ModalProvider";
import { nanoid } from "nanoid";
import CreatingMembership from "../components/GpPlus/CreatingMembership";

const GpSignUpResult: React.FC = () => {
  const { _isCreatingGpPlusAccount } = useModalContext();
  const router = useRouter();
  const { confirmationToken } = router.query;
  const [isCreatingGpPlusAccount, setIsCreatingGpPlusAccount] = useState(true);
  const [, setIsCreatingGpPlusAccountModalDisplayed] = _isCreatingGpPlusAccount;
  const [outsetaPassword, setOutsetaPassword] = useState("");

  useEffect(() => {
    const observer = new MutationObserver((element) => {
      console.log("element, yo there: ", element[0]);
      const outsetaModal = document.querySelector(".o--App--authWidget");

      if (outsetaModal) {
        (outsetaModal as HTMLElement).style.visibility = "hidden";
      }

      const inputOAuthPasswordInput =
        document.getElementById("o-auth-password");

      if (inputOAuthPasswordInput) {
        const outsetaPassword = nanoid();
        setOutsetaPassword(outsetaPassword);
        (inputOAuthPasswordInput as HTMLInputElement).value = outsetaPassword;
      }

      console.log(
        "inputOAuthPasswordInput, value: ",
        (inputOAuthPasswordInput as HTMLInputElement)?.value
      );
    });

    setTimeout(() => {
      const outsetaModal = document.querySelector(".o--App--authWidget");

      if (!outsetaModal) {
        setIsCreatingGpPlusAccount(false);
      }
    }, 3_000);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setIsCreatingGpPlusAccountModalDisplayed(true);

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <>
      <Layout
        title="GP Plus Sign Up Set password"
        description="GP Plus set password page."
        url="/gp-sign-up-result"
        imgSrc="/assets/img/galactic_polymath_logo.png"
        imgAlt="Galactic Polymath Logo"
        langLinks={[]}
      >
        <div className="mt-5 min-vh-100 min-vw-100 ps-5">
          {confirmationToken ? (
            <>
              <p>
                Please enter your password in the pop-up dialog that has opened.
              </p>
              <p>
                If the pop-up does not display, please refresh the page or check
                the link sent to your email inbox.
              </p>
              <p>If there is no pop-up showing, please email: </p>
              <CustomLink
                hrefStr={CONTACT_SUPPORT_EMAIL}
                className="ms-1 mt-2 text-break"
              >
                feedback@galacticpolymath.com
              </CustomLink>
              .
            </>
          ) : (
            <>
              <p>
                No confirmation token found. Please check the link sent to your
                email inbox.
              </p>
              <div className="d-flex">
                <p>If you think this is an error, please email:</p>
                <CustomLink
                  hrefStr={CONTACT_SUPPORT_EMAIL}
                  className="ms-1 text-break"
                >
                  feedback@galacticpolymath.com
                </CustomLink>
                .
              </div>
            </>
          )}
        </div>
      </Layout>
      <CreatingMembership outsetaPassword={outsetaPassword} />
    </>
  );
};

export default GpSignUpResult;
