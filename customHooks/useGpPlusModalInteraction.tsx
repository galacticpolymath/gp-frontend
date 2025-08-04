import { useEffect } from "react";
import useSiteSession from "./useSiteSession";
import { useUserContext } from "../providers/UserProvider";
import { TGpPlusSubscriptionForClient, TUserSchemaForClient } from "../backend/models/User/types";
import { getUserPlanDetails } from "../apiServices/user/crudFns";

export const useGpPlusModalInteraction = (
  gpPlusBillingTerm?: NonNullable<TGpPlusSubscriptionForClient["BillingRenewalTerm"]>,
) => {
  const { status, token } = useSiteSession();

  useEffect(() => {
    if (status === "authenticated" && gpPlusBillingTerm) {
      // console.log("gpPlusBillingTerm, yo there: ", gpPlusBillingTerm);
      
      const mutationOberserver = new MutationObserver((elements) => {
        for (const element of elements) {
          console.log("Element: ", element);

          if (
            (element.target as HTMLElement).className ===
            "o--App--widgetContent"
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
                gpPlusModalTabOptionsDropDown?.firstChild?.firstChild
                  ?.childNodes;

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

      return () => {
        mutationOberserver.disconnect();
      };
    }
  }, [status, gpPlusBillingTerm]);
};
