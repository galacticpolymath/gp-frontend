import { useEffect, useMemo, useRef, useState } from "react";
import {
  defautlNotifyModalVal,
  useModalContext,
} from "../providers/ModalProvider";
import CustomLink from "../components/CustomLink";
import { CONTACT_SUPPORT_EMAIL } from "../globalVars";
import useSiteSession from "./useSiteSession";
import { getUserPlanDetails, updateUser } from "../apiServices/user/crudFns";
import { SELECTED_OPTION_CLASSNAME } from "./useGpPlusModalInteraction";
import {
  getIsWithinParentElement,
  getLocalStorageItem,
  setLocalStorageItem,
} from "../shared/fns";
import { AiOutlineConsoleSql } from "react-icons/ai";

const getBillingType = () => {
  const selectedGpPlusBillingType = getLocalStorageItem(
    "selectedGpPlusBillingType"
  );

  return selectedGpPlusBillingType === "month" ? "monthly" : "yearly";
};

export const useHandleGpPlusCheckoutSessionModal = () => {
  const { _notifyModal, _isGpPlusSignUpModalDisplayed } = useModalContext();
  const [isSignupModalDisplayed, setIsSignupModalDisplayed] =
    _isGpPlusSignUpModalDisplayed;
  const [, setNotifyModal] = _notifyModal;
  const [getEmailInputRetryCount, setGetEmailInputRetryCount] = useState(1);
  const selectedBillingPeriod = useMemo(() => {
    const selectedGpPlusBillingType = getLocalStorageItem(
      "selectedGpPlusBillingType"
    );

    return selectedGpPlusBillingType === "month" ? "monthly" : "yearly";
  }, []);

  const { user, token, logUserOut, status } = useSiteSession();
  const mutationOberserverRef = useRef<MutationObserver | null>(null);

  const handleOnClickPlanChangeLogic = (event: MouseEvent) => {
    console.log("plan change occurred");
    const _target = event.target as HTMLElement;

    if (_target.className === SELECTED_OPTION_CLASSNAME) {
      console.log("billing option selected");
      return;
    }

    const wasABillingOptSelected = getIsWithinParentElement(
      _target,
      SELECTED_OPTION_CLASSNAME,
      "className",
      "includes"
    );

    console.log("Current GP Plus Billing Term: ", selectedBillingPeriod);

    console.log("wasABillingOptSelected: ", wasABillingOptSelected);

    if (wasABillingOptSelected) {
      const isCurrentBillingPlanOfUser = _target.textContent
        ?.toLowerCase()
        ?.includes(selectedBillingPeriod);
      console.log("isCurrentBillingPlanOfUser: ", isCurrentBillingPlanOfUser);
      const currentPlanTxtElement = document.querySelector<HTMLElement>(
        ".o--Badge--displayMode-light"
      );

      console.log("IS CURRENT PLAN: ", currentPlanTxtElement);

      if (currentPlanTxtElement && isCurrentBillingPlanOfUser) {
        currentPlanTxtElement.classList.add("show-gp-plus-element");
      } else if (currentPlanTxtElement) {
        currentPlanTxtElement.classList.remove("show-gp-plus-element");
      }

      const billingTermsOptsContainer = document.querySelector(
        ".o--HorizontalToggle--displayMode-light"
      );
      // const savingsElement =
      //   document.querySelector<HTMLSpanElement>("#gp-plus-savings");
      const savingsElement =
        billingTermsOptsContainer?.childElementCount === 3 &&
        (billingTermsOptsContainer.lastChild as HTMLElement);

      console.log("savingsElement: ", savingsElement);
      console.log("billingTermsOptsContainer: ", billingTermsOptsContainer);

      if (_target.textContent === "Billed yearly" && savingsElement) {
        savingsElement.classList.add("fw-bolder");
        savingsElement.classList.remove("text-decoration-line-through");
        setLocalStorageItem("selectedGpPlusBillingType", "year");
      } else if (savingsElement) {
        setLocalStorageItem("selectedGpPlusBillingType", "month");
        savingsElement.classList.remove("fw-bolder");
        savingsElement.classList.add("text-decoration-line-through");
      }
    }
  };

  const [billingTypeOptsContainer, setBillingTypeOptsContainer] =
    useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (billingTypeOptsContainer) {
      setBillingTypeOptsContainer(null);
    }
  }, [billingTypeOptsContainer]);

  const handleUserInteractionWithGpPlusModal = async () => {
    const { percentageSaved } = (await getUserPlanDetails(token, false)) ?? {};

    console.log("percentageSaved: ", percentageSaved);

    const mutationOberserver = new MutationObserver((elements) => {
      for (const _ of elements) {
        const wasContinueToCheckoutBtnClicked = getLocalStorageItem(
          "wasContinueToCheckoutBtnClicked"
        );
        const billingTypeOptsContainer = document.querySelector<HTMLDivElement>(
          ".o--HorizontalToggle--horizontalToggle"
        );
        const gpPlusSavingsElement =
          document.querySelector<HTMLSpanElement>("#gp-plus-savings");
        const monthlyOption = billingTypeOptsContainer?.firstChild?.firstChild
          ?.firstChild as HTMLElement | undefined;
        const yearlyOption = billingTypeOptsContainer?.firstChild?.lastChild
          ?.firstChild as HTMLElement | undefined;
        const selectedBillingPeriod = getBillingType();

        // if (
        //   !wasContinueToCheckoutBtnClicked &&
        //   selectedBillingPeriod === "monthly" &&
        //   monthlyOption
        // ) {
        //   monthlyOption.dispatchEvent(new Event("click", { bubbles: true }));
        // } else if (
        //   !wasContinueToCheckoutBtnClicked &&
        //   selectedBillingPeriod === "yearly" &&
        //   yearlyOption
        // ) {
        //   yearlyOption.dispatchEvent(new Event("click", { bubbles: true }));
        // }

        console.log("gpPlusSavingsElement: ", gpPlusSavingsElement);

        if (billingTypeOptsContainer && !gpPlusSavingsElement) {
          const savingsElement = document.createElement("span");
          savingsElement.className = "gp-plus-color text-center ms-2";
          savingsElement.id = "gp-plus-savings";
          savingsElement.textContent = `Save ${percentageSaved ?? 50}%`;
          const gpPlusBillingType = getLocalStorageItem(
            "selectedGpPlusBillingType"
          );
          console.log("gpPlusBillingType, python: ", gpPlusBillingType);
          savingsElement.classList.add(
            gpPlusBillingType === "month"
              ? "text-decoration-line-through"
              : "fw-bolder"
          );
          console.log("billingTypeOptsContainer: ", billingTypeOptsContainer);
          billingTypeOptsContainer.appendChild(savingsElement);
        }
      }
    });

    mutationOberserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
    mutationOberserverRef.current = mutationOberserver;
  };

  useEffect(() => {
    if (status === "authenticated") {
      handleUserInteractionWithGpPlusModal();

      document.addEventListener("click", handleOnClickPlanChangeLogic);

      return () => {
        mutationOberserverRef.current?.disconnect();
      };
    }
  }, [status]);

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

      console.log("emailInput value: ", emailInput);

      if (emailInput) {
        emailInput.value = user.email ?? "";
        emailInput.dispatchEvent(new Event("input", { bubbles: true }));
      }

      // get the saving from the backend
      const continueToCheckoutBtn = document.querySelector<HTMLButtonElement>(
        ".o--Register--nextButton"
      );

      console.log("continueToCheckoutBtn: ", continueToCheckoutBtn);

      setLocalStorageItem("wasContinueToCheckoutBtnClicked", true);

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
