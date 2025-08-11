import { useEffect, useRef, useState } from "react";
import useSiteSession from "./useSiteSession";
import { useUserContext } from "../providers/UserProvider";
import { TGpPlusSubscriptionForClient } from "../backend/models/User/types";
import { getUserPlanDetails, IPlanDetails } from "../apiServices/user/crudFns";
import { getIsWithinParentElement } from "../shared/fns";

const SELECTED_OPTION_CLASSNAME = "o--HorizontalToggle--active";

export const useGpPlusModalInteraction = (
  gpPlusBillingTerm?: NonNullable<
    TGpPlusSubscriptionForClient["BillingRenewalTerm"]
  >
) => {
  const { status, token } = useSiteSession();
  const mutationOberserverRef = useRef<MutationObserver | null>(null);

  const handleOnClickPlanChangeLogic = (
    event: MouseEvent,
    planDetails: IPlanDetails
  ) => {
    console.log("Event, sup there: ", event.target);

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

    console.log("Current GP Plus Billing Term: ", gpPlusBillingTerm);

    console.log("wasABillingOptSelected: ", wasABillingOptSelected);

    if (wasABillingOptSelected && gpPlusBillingTerm) {
      const isCurrentBillingPlanOfUser = _target.textContent
        ?.toLowerCase()
        ?.includes(gpPlusBillingTerm.toLowerCase());
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
      const savingsElement =
        billingTermsOptsContainer?.childElementCount === 3 &&
        (billingTermsOptsContainer.lastChild as HTMLElement);

      console.log("savingsElement: ", savingsElement);
      console.log("billingTermsOptsContainer: ", billingTermsOptsContainer);

      
      if (_target.textContent === "Billed yearly" && savingsElement) {
        savingsElement.classList.add('fw-bolder')
      } else if (savingsElement){
        savingsElement.classList.remove("fw-bolder");
      }
    }

    // if the yearly option was selected, then show the percentage saved
  };

  const handleUserInteractionWithGpPlusModal = async () => {
    const userPlanDetail = await getUserPlanDetails(token);

    const _handleOnClickPlanChangeLogic = (event: MouseEvent) => {
      handleOnClickPlanChangeLogic(event, userPlanDetail!);
    };

    // if the user selects yearly and if they are on the yearly plan, then

    const mutationOberserver = new MutationObserver((elements) => {
      for (const element of elements) {
        console.log("Element, sup bacon: ", element.target);

        
        const isChangePlanUI = element.target.firstChild?.firstChild?.textContent === "Change plan";
        const billingTypeOptsContainer = element.target.lastChild?.firstChild?.firstChild?.firstChild?.firstChild;

        if (isChangePlanUI && billingTypeOptsContainer) {
          const savingsElement = document.createElement('span')
          savingsElement.className = "gp-plus-color text-center ms-2";
          savingsElement.textContent = `Save ${userPlanDetail?.percentageSaved ?? 50}%`

          billingTypeOptsContainer.appendChild(savingsElement);
          
          console.log("Something changed in the plan change UI");
        }

        const gpPlusModal = document.querySelector(".o--Widget--widgetBody");
        const billingOptionsContainer =
          element.target.lastChild?.firstChild?.lastChild?.firstChild
            ?.firstChild?.firstChild;

        if (billingOptionsContainer?.childNodes?.length && gpPlusBillingTerm) {
          const childElements = Array.from(
            billingOptionsContainer.childNodes
          ) as HTMLElement[];
          const selectedOption = childElements.find((element) => {
            return element.className === "o--HorizontalToggle--active";
          });
          const selectionOptionTxt = selectedOption?.textContent?.toLowerCase();
          const isCurrentBillingPlan = selectionOptionTxt?.includes(
            gpPlusBillingTerm?.toLowerCase()
          );

          console.log("isCurrentBillingPlan: ", isCurrentBillingPlan);

          if (isCurrentBillingPlan) {
            const currentPlanTxtElement = document.querySelector<HTMLElement>(
              ".o--Badge--displayMode-light"
            );

            console.log("currentPlanTxtElement: ", currentPlanTxtElement);

            console.log("IS CURRENT PLAN");

            if (currentPlanTxtElement) {
              currentPlanTxtElement.classList.add("show-gp-plus-element");
            }
          }
        }

        if (gpPlusModal && userPlanDetail) {
          document.addEventListener("click", _handleOnClickPlanChangeLogic);
        } else if (!gpPlusModal) {
          document.removeEventListener("click", _handleOnClickPlanChangeLogic);
        }

        const billingTypeElement = document.querySelector(
          ".o--HorizontalToggle--active"
        );

        // const x = Array.from(element.target.lastChild?.firstChild?.firstChild?.firstChild?.firstChild?.firstChild?.childNodes ?? []) as HTMLElement[];

        // console.log("x, sup there: ", x?.[0]?.textContent);

        if (
          (element.target as HTMLElement).className === "o--App--widgetContent"
        ) {
          const h1 = element.target.firstChild
            ?.firstChild as HTMLElement | null;

          if (h1?.textContent === "Profile") {
            h1.textContent = "Email";
          } else if (h1?.textContent === "Account") {
            h1.textContent = "Address";
          }

          if (h1) {
            h1.style.visibility = "visible";
          }

          if (window.innerWidth < 600) {
            console.log("The user is on a mobile device.");
            const gpPlusModalElements = Array.from(
              (element.target as HTMLElement).childNodes
            ) as HTMLElement[];
            const gpPlusModalTabOptionsDropDown = gpPlusModalElements.find(
              (element) => element.className === "o--NavMobile--navMobile"
            );
            const gpPlusModalTabOptions =
              gpPlusModalTabOptionsDropDown?.firstChild?.firstChild?.childNodes;

            if (gpPlusModalTabOptions) {
              const profileOptions = Array.from(
                gpPlusModalTabOptions
              ) as HTMLOptionElement[];

              for (const profileOption of profileOptions) {
                if (profileOption.className === "o--tab-profile") {
                  profileOption.textContent = "Email";
                  profileOption.style.visibility = "visible";
                }
                if (profileOption.className === "o--tab-account") {
                  profileOption.textContent = "Address";
                  profileOption.style.visibility = "visible";
                }
              }
            }
          }
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
    if (status === "authenticated" && gpPlusBillingTerm) {
      handleUserInteractionWithGpPlusModal();

      return () => {
        mutationOberserverRef.current?.disconnect();
      };
    }
  }, [status, gpPlusBillingTerm]);
};
