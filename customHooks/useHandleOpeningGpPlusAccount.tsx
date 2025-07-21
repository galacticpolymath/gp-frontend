import { Magic } from "magic-sdk";
import { getLocalStorageItem } from "../shared/fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { useModalContext } from "../providers/ModalProvider";
import { CONTACT_SUPPORT_EMAIL } from "../globalVars";
import CustomLink from "../components/CustomLink";
import { useQuery } from "@tanstack/react-query";
import { getIndividualGpPlusSubscription } from "../apiServices/user/crudFns";
import useSiteSession from "./useSiteSession";

const useHandleOpeningGpPlusAccount = (willGetGpPlusMembership: boolean) => {
  const { token, status } = useSiteSession();
  const [wasGpPlusSubRetrieved, setWasGpPlusSubRetrieved] = useState(false);
  const { isFetching, data: gpPlusSubscription } = useQuery({
    retry: 1,
    refetchOnWindowFocus: false,
    queryKey: [status, token],
    queryFn: async () => {
      if (willGetGpPlusMembership && status === "authenticated") {
        const gpPlusSub = await getIndividualGpPlusSubscription(token);

        setWasGpPlusSubRetrieved(true);

        return gpPlusSub;
      }

      if (status === "loading") {
        return null;
      }

      setWasGpPlusSubRetrieved(true);

      return null;
    },
  });

  const [wasGpPlusBtnClicked, setWasGpPlusBtnClicked] = useState(false);
  const { _notifyModal } = useModalContext();
  const [, setNotifyModal] = _notifyModal;
  const outsetaAnchorElement = useRef<HTMLAnchorElement | null>(null);
  const anchorElement = (
    <a
      ref={outsetaAnchorElement}
      style={{
        zIndex: -10,
        opacity: 0,
      }}
      className="no-underline"
      href="https://galactic-polymath.outseta.com/profile?tab=account#o-authenticated"
    ></a>
  );

  const handleGpPlusAccountBtnClick = useCallback(async () => {
    let wasGpPlusAccountRetrievalSuccessful = false;

    try {
      const userAccount = gpPlusSubscription
        ? { gpPlusSubscription: gpPlusSubscription.membership }
        : getLocalStorageItem("userAccount");

      setWasGpPlusBtnClicked(true);

      if (
        userAccount?.gpPlusSubscription &&
        "email" in userAccount?.gpPlusSubscription &&
        !userAccount?.gpPlusSubscription?.email
      ) {
        setNotifyModal({
          isDisplayed: true,
          headerTxt: "GP Plus data retrieval error",
          bodyTxt: (
            <>
              Unable to retrieve your GP Plus email. If this error persists,
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
          handleOnHide: () => {
            setNotifyModal((state) => ({
              ...state,
              isDisplayed: false,
            }));
          },
        });
        setWasGpPlusBtnClicked(false);
        return;
      }

      if (!("Outseta" in window)) {
        setNotifyModal({
          isDisplayed: true,
          headerTxt: "GP Plus data retrieval error",
          bodyTxt: (
            <>
              An error in loading your GP Plus data. Please refresh the page. If
              this error persists, please contact{" "}
              <CustomLink
                hrefStr={CONTACT_SUPPORT_EMAIL}
                className="ms-1 mt-2 text-break"
              >
                feedback@galacticpolymath.com
              </CustomLink>
              .
            </>
          ),
          handleOnHide: () => {
            setNotifyModal((state) => ({
              ...state,
              isDisplayed: false,
            }));
          },
        });
        setWasGpPlusBtnClicked(false);
        return;
      }

      const outseta = (window as any).Outseta;
      let idToken = outseta.getAccessToken() as string | null;

      console.log(
        "userAccount?.gpPlusSubscription, sup there: ",
        userAccount?.gpPlusSubscription
      );

      if (
        !idToken &&
        userAccount &&
        userAccount.gpPlusSubscription &&
        "person" in userAccount?.gpPlusSubscription &&
        userAccount?.gpPlusSubscription.person?.Email
      ) {
        const magic = new Magic(
          process.env.NEXT_PUBLIC_MAGIC_LINK_PK as string
        );
        idToken = await magic.auth.loginWithMagicLink({
          email: userAccount?.gpPlusSubscription.person?.Email,
          redirectURI: window.location.href,
        });

        if (idToken){
          window.Outseta?.setMagicLinkIdToken(idToken);
        } 
      }

      wasGpPlusAccountRetrievalSuccessful = true;

      setTimeout(() => {
        outsetaAnchorElement?.current?.click();
        setWasGpPlusBtnClicked(false);
      }, 500);
    } catch (error) {
      console.log("Failed to open GP Plus account: ", error);
    } finally {
      if (!wasGpPlusAccountRetrievalSuccessful) {
        setWasGpPlusBtnClicked(false);
      }
    }
  }, [isFetching]);

  useEffect(() => {
    const url = new URL(window.location.href);

    console.log("status: ", status);
    console.log("url searchParams: ", url.searchParams.toString());
    console.log(
      "gpPlusSubscription AccountStageLabel: ",
      gpPlusSubscription?.membership?.AccountStageLabel
    );

    if (
      url.searchParams.get("show_gp_plus_account_modal") === "true" &&
      status === "authenticated" &&
      (gpPlusSubscription?.membership?.AccountStageLabel === "Subscribing" ||
        gpPlusSubscription?.membership?.AccountStageLabel === "Cancelling")
    ) {
      console.log("hi there will click the gp plus button...");
      setWasGpPlusBtnClicked(true);

      setTimeout(() => {
        outsetaAnchorElement?.current?.click();
        setWasGpPlusBtnClicked(false);
      }, 500);
    }
  }, [status]);

  return {
    handleGpPlusAccountBtnClick,
    _wasGpPlusBtnClicked: [wasGpPlusBtnClicked, setWasGpPlusBtnClicked],
    anchorElement,
    gpPlusSubscription,
    isFetching,
    _wasGpPlusSubRetrieved: [wasGpPlusSubRetrieved, setWasGpPlusSubRetrieved],
  } as const;
};

export default useHandleOpeningGpPlusAccount;
