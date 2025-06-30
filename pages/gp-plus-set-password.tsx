import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CustomLink from "../components/CustomLink";
import { CONTACT_SUPPORT_EMAIL } from "../globalVars";
import Layout from "../components/Layout";
import { useModalContext } from "../providers/ModalProvider";
import { nanoid } from "nanoid";
import CreatingMembership from "../components/GpPlus/CreatingMembership";

export const getSubmitBtn = () => {
  const resetPasswordSec = document.querySelector(".state-ResetPassword");

  if (
    resetPasswordSec &&
    resetPasswordSec?.lastChild &&
    resetPasswordSec?.lastChild?.lastChild?.firstChild &&
    resetPasswordSec?.lastChild?.lastChild?.firstChild?.nodeName === "BUTTON"
  ) {
    return resetPasswordSec?.lastChild?.lastChild
      ?.firstChild as HTMLButtonElement;
  }

  return null;
};

const GpSignUpResult: React.FC = () => {
  const { _isCreatingGpPlusAccount } = useModalContext();
  const router = useRouter();
  const { confirmationToken } = router.query;
  const [isCreatingGpPlusAccount, setIsCreatingGpPlusAccount] = useState(true);
  const [, setIsCreatingGpPlusAccountModalDisplayed] = _isCreatingGpPlusAccount;
  const [canSubmitPasswordForm, setCanSubmitPasswordForm] = useState(false);
  const [passwordInput, setPasswordInput] = useState<Node | null>(null);

  useEffect(() => {
    const observer = new MutationObserver((element) => {
      console.log("element, yo there: ", element[0]);

      const outsetaModal = document.querySelector(".o--App--authWidget");

      if (outsetaModal) {
        (outsetaModal as HTMLElement).style.visibility = "hidden";
      }

      const inputOAuthPasswordInput =
        document.getElementById("o-auth-password");
      const passwordSubmitBtn = getSubmitBtn();

      if (inputOAuthPasswordInput && passwordSubmitBtn) {
        const inputOAuthPasswordInputClone =
          inputOAuthPasswordInput.cloneNode();
        (inputOAuthPasswordInputClone as HTMLInputElement).autocomplete =
          "current-password";
        (inputOAuthPasswordInputClone as HTMLInputElement).type = "text";
        const outsetaPassword = nanoid();
        setCanSubmitPasswordForm(true);
        (inputOAuthPasswordInput as HTMLInputElement).value = outsetaPassword;
        (inputOAuthPasswordInputClone as HTMLInputElement).disabled = true;
        passwordSubmitBtn.disabled = false;
        setPasswordInput(inputOAuthPasswordInputClone);
      }

      console.log(
        "inputOAuthPasswordInput, value: ",
        (inputOAuthPasswordInput as HTMLInputElement)?.value
      );
    });

    setTimeout(() => {
      const outsetaModal = document.querySelector(".o--App--authWidget");
      if (!outsetaModal) {
        console.log("The outseta modal is not displayed.");
        setIsCreatingGpPlusAccount(false);
      } else {
        console.log("The outseta modal is displayed.");
      }
    }, 2_000);
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

  useEffect(() => {
    console.log("passwordInput element: ", passwordInput);
    if (passwordInput) {
      const passwordInputContainer = document.querySelector(
        ".o--NewPasswordInput--NewPasswordInput"
      );
      console.log("passwordInputContainer: ", passwordInputContainer);
      // passwordInputContainer?.prepend(passwordInput);
      // setPasswordInput(null);
    }
  }, [passwordInput]);

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
        <div className="mt-5 min-vh-100 min-vw-100 ps-5 input-read-only">
          {isCreatingGpPlusAccount ? (
            <>
              <p>We are creating your GP Plus membership, please wait.</p>
              <p>
                If the loading indicator is not showing, please refresh the page
                or check the link sent to your email inbox.
              </p>
              <div className="d-flex">
                <p>If there is no pop-up showing, please email: </p>
                <CustomLink
                  hrefStr={CONTACT_SUPPORT_EMAIL}
                  className="ms-1 text-break"
                >
                  feedback@galacticpolymath.com
                </CustomLink>
                .
              </div>
            </>
          ) : (
            <>
              <p>
                Unable to determine if GP Plus sign up was successful. Please
                check the link sent to your email inbox.
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
      <CreatingMembership canSubmitPasswordForm={canSubmitPasswordForm} />
    </>
  );
};

export default GpSignUpResult;
