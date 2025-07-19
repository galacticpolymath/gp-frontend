import { useEffect, useState } from "react";
import useSiteSession from "./useSiteSession";
import { TUseStateReturnVal } from "../types/global";
import { TAboutUserFormForUI, useUserContext } from "../providers/UserProvider";

export const useGpPlusModalInteraction = () => {
  const { status } = useSiteSession();
  const { _aboutUserForm } = useUserContext();
  const [aboutUserForm, ] = _aboutUserForm;

  useEffect(() => {
    if (status && aboutUserForm.isGpPlusMember) {
        const mutationOberserver = new MutationObserver((mutationList) => {
            console.log("mutationList, gp plus modal: ", mutationList);
        })

        mutationOberserver.observe(document.body, {
          childList: true,
          subtree: true,
        });
    }
  }, [status, aboutUserForm]);
};
