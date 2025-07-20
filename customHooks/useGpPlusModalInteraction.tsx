import { useEffect } from "react";
import useSiteSession from "./useSiteSession";
import { useUserContext } from "../providers/UserProvider";

export const useGpPlusModalInteraction = () => {
  const { status } = useSiteSession();
  const { _aboutUserForm } = useUserContext();
  const [aboutUserForm] = _aboutUserForm;

  useEffect(() => {
    if (status === "authenticated" && aboutUserForm.isGpPlusMember) {
      const mutationOberserver = new MutationObserver((elements) => {
        for (const element of elements) {
          console.log("Element: ", element);

          if (
            (element.target as HTMLElement).className ===
            "o--App--widgetContent"
          ) {
            const h1 = element.target.firstChild?.firstChild as HTMLElement | null;

            if (h1?.textContent === "Profile") {
              h1.textContent = "Email";
              h1.style.visibility = "visible";
            } else if (h1){
              h1.style.visibility = "visible";
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
  }, [status, aboutUserForm]);
};
