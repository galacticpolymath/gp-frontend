import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useModalContext } from "../providers/ModalProvider";
import { CONTACT_SUPPORT_EMAIL } from "../globalVars";
import { updateUser } from "../apiServices/user/crudFns";
import CustomLink from "../components/CustomLink";
import { resetUrl } from "../globalFns";
import { useRouter } from "next/router";

export const useHandleGpPlusLogin = () => {
  const { status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
      const url = new URL(window.location.href);
      const idToken = url.searchParams.get("magic_credential");
  
      if (idToken){
        (window as any).Outseta.setMagicLinkIdToken(idToken);

        console.log("(window as any).Outseta, hey there: ", (window as any).Outseta);
        
        (window as any).Outseta.profile.open();
        
        resetUrl(router);

      } 
    }, [status]);


  return
};
