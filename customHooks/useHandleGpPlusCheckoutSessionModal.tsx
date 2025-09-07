import { useEffect, useState } from "react";
import {
  defautlNotifyModalVal,
  useModalContext,
} from "../providers/ModalProvider";
import CustomLink from "../components/CustomLink";
import { CONTACT_SUPPORT_EMAIL } from "../globalVars";
import useSiteSession from "./useSiteSession";
import { getUserPlanDetails, updateUser } from "../apiServices/user/crudFns";

export const useHandleGpPlusCheckoutSessionModal = (
  billingPeriod: "monthly" | "yearly"
) => {
  const { _notifyModal, _isGpPlusSignUpModalDisplayed } = useModalContext();
  const [isSignupModalDisplayed, setIsSignupModalDisplayed] =
    _isGpPlusSignUpModalDisplayed;
  const [, setNotifyModal] = _notifyModal;
  const { user, token, logUserOut, status } = useSiteSession();
  const [getEmailInputRetryCount, setGetEmailInputRetryCount] = useState(0);

  useEffect(() => {
    if (isSignupModalDisplayed && status === "authenticated") {
      console.log("sign up modal displayed");

      const emailInput = document.querySelector<HTMLInputElement>(
        '[name="Person.Email"]'
      );

      if (!emailInput) {
        setTimeout(() => {
          setGetEmailInputRetryCount((state) => state + 1);
        }, 200);
        return;
      }

      // get the saving from the backend
      (async () => {
        const { percentageSaved } = await getUserPlanDetails(token, false) ?? {};
      })();
      const continueToCheckoutBtn = document.querySelector<HTMLButtonElement>(
        ".o--Register--nextButton"
      );
      const payPeriodToggle = document.querySelector<HTMLButtonElement>(
        ".o--HorizontalToggle--horizontalToggle"
      );
      const monthlyOption = payPeriodToggle?.firstChild?.firstChild
        ?.firstChild as HTMLElement | undefined;
      const yearlyOption = payPeriodToggle?.firstChild?.lastChild
        ?.firstChild as HTMLElement | undefined;

      console.log("emailInput value: ", emailInput);

      if (emailInput) {
        emailInput.value = user.email ?? "";
      }
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
  }, [isSignupModalDisplayed, status, getEmailInputRetryCount]);
};
