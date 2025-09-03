import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { resetUrl } from "../globalFns";
import { useRouter } from "next/router";

export const useHandleGpPlusLogin = () => {
  const { status } = useSession();
  const router = useRouter();
  const [checkForOutsetaPropCount, setCheckForOutsetaPropCount] = useState(0);

  useEffect(() => {
    const url = new URL(window.location.href);
    const idToken = url.searchParams.get("magic_credential");

    console.log("(window as any).Outseta: ", (window as any).Outseta);

    if (
      idToken &&
      status === "authenticated" &&
      typeof (window as any)?.Outseta?.setMagicLinkIdToken !== "function" &&
      checkForOutsetaPropCount <= 5
    ) {
      setTimeout(() => {
        setCheckForOutsetaPropCount((state) => state + 1);
      }, 1_000);
    } else if (idToken && status === "authenticated") {
      try {
        console.log("will set id token");

        (window as any).Outseta.setMagicLinkIdToken(idToken);

        const accessToken = (window as any).Outseta?.getAccessToken();

        console.log("accessToken: ", accessToken);

        const outsetaUser = (window as any).Outseta?.getUser();

        console.log("outsetaUser: ", outsetaUser);

        (window as any).Outseta.profile.open();

        resetUrl(router);
      } catch (error) {
        console.error("an error occurred: ", error);
      }
    }
  }, [status, checkForOutsetaPropCount]);

  return;
};
