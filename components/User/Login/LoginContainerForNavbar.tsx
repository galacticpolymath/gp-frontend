/* eslint-disable indent */
/* eslint-disable quotes */

import { FaUserAlt } from "react-icons/fa";
import React, { useEffect, useMemo, useState } from "react";
import { useModalContext } from "../../../providers/ModalProvider";
import Button from "../../General/Button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useCustomCookies } from "../../../customHooks/useCustomCookies";
import { TUseStateReturnVal } from "../../../types/global";
import { useGetAboutUserForm } from "../../../customHooks/useGetAboutUserForm";
import {
  TAboutUserForm,
  TGpPlusSubscriptionForClient,
} from "../../../backend/models/User/types";
import { Spinner } from "react-bootstrap";
import {
  getIsWithinParentElement,
  getLocalStorageItem,
  setLocalStorageItem,
  setSessionStorageItem,
} from "../../../shared/fns";
import {
  deleteUserFromServerCache,
  getIndividualGpPlusSubscription,
} from "../../../apiServices/user/crudFns";
import useSiteSession from "../../../customHooks/useSiteSession";
import { TAccountStageLabel } from "../../../backend/services/outsetaServices";
import axios from "axios";
import { usePathname, useSearchParams } from "next/navigation";
import { useCreateUnitSectionUrl } from "../../../customHooks/useCreateUnitSectionUrl";
import { NAV_DOT_HIGHLIGHTED_CLASS } from "../../LessonSection/NavDots/LiNavDot";

interface IProps {
  _modalAnimation: TUseStateReturnVal<
    "d-none" | "fade-out-quick" | "fade-in-quick"
  >;
}

const USER_ACCOUNT_MODAL_ID = "user-account-modal";

// GP+ membership statuses
const HAS_MEMBERSHIP_STATUSES: Set<TAccountStageLabel> = new Set([
  "Cancelling",
  "Subscribing",
  "Past due",
] as TAccountStageLabel[]);

export const revokeGoogleAuthToken = async (token: string) => {
  try {
    const response = await axios.post(
      "https://oauth2.googleapis.com/revoke",
      null,
      {
        params: {
          token,
        },
      }
    );

    console.log("Response from revoking Google Auth token:", response);

    const { data, status } = response;

    if (!(status >= 200 && status < 300)) {
      throw new Error(`Failed to revoke token: ${data?.error}`);
    }

    return {
      wasSuccessful: true,
    };
  } catch (error) {
    console.error(
      "An error occurred while revoking the Google Auth token:",
      error
    );

    return {
      wasSuccessful: false,
    };
  }
};

const LoginContainerForNavbar: React.FC<IProps> = ({ _modalAnimation }) => {
  const router = useRouter();
  const { _isAccountModalMobileOn } = useModalContext();
  const { _aboutUserForm, _isRetrievingUserData } = useGetAboutUserForm(
    router.asPath !== "/account"
  );
  const [aboutUserForm] = _aboutUserForm;
  const [isRetrievingUserData] = _isRetrievingUserData;
  const pathName = usePathname();
  const { status, user, token, gdriveAccessToken, gdriveRefreshToken } =
    useSiteSession();
  const userAccountSaved = useMemo(() => {
    if (status === "authenticated") {
      return (
        typeof localStorage !== "undefined"
          ? getLocalStorageItem("userAccount") ?? {}
          : {}
      ) as TAboutUserForm;
    }

    return null;
  }, [status]);
  const [modalAnimation, setModalAnimation] = _modalAnimation;
  const { image } = user ?? {};
  const [, setIsAccountModalMobileOn] = _isAccountModalMobileOn;
  const [isSigningUserOut, setIsSigningUserOut] = useState(false);
  const { clearCookies, removeAppCookies } = useCustomCookies();
  const [gpPlusSubscription, setGpPlusSubscription] =
    useState<TGpPlusSubscriptionForClient | null>(null);
  const [wasUIDataLoaded, setWasUIDataLoaded] = useState(false);
  const { createUnitSectionUrl } = useCreateUnitSectionUrl();

  useEffect(() => {
    if (status === "authenticated" && !wasUIDataLoaded) {
      (async () => {
        const gpPlusSub =
          (await getIndividualGpPlusSubscription(token))?.membership ?? null;
        setGpPlusSubscription(gpPlusSub);
        setWasUIDataLoaded(true);
      })();
    } else if (status === "unauthenticated") {
      setWasUIDataLoaded(true);
    }
  }, [status]);

  const isGpPlusMember =
    gpPlusSubscription?.AccountStageLabel &&
    HAS_MEMBERSHIP_STATUSES.has(gpPlusSubscription.AccountStageLabel);
  const firstName =
    userAccountSaved?.firstName ??
    aboutUserForm?.firstName ??
    aboutUserForm?.name?.first ??
    "";
  const lastName =
    userAccountSaved?.lastName ??
    aboutUserForm?.lastName ??
    aboutUserForm?.name?.last ??
    "";

  const handleSignOutBtnClick = async () => {
    setIsSigningUserOut(true);

    if (gdriveAccessToken) {
      await revokeGoogleAuthToken(gdriveAccessToken);
    }

    removeAppCookies([
      "gdriveAccessToken",
      "gdriveAccessTokenExp",
      "gdriveRefreshToken",
    ]);

    await deleteUserFromServerCache(token);
    await signOut({ redirect: false });

    localStorage.clear();
    sessionStorage.clear();
    clearCookies();

    const isUserSignedIn = !!(window.Outseta as any)?.getAccessToken();

    if (!isUserSignedIn) {
      window.location.reload();
      return;
    }

    window.Outseta?.on("logout", async () => {
      console.log("Logging the user out.");
      window.Outseta?.setAccessToken(null);
      window.Outseta?.setMagicLinkIdToken("");
      return false;
    });
  };

  const closeModal = () => {
    setModalAnimation((modalAnimation) => {
      if (modalAnimation === "fade-out-quick" || modalAnimation === "d-none") {
        return "fade-in-quick";
      }

      if (modalAnimation === "fade-in-quick") {
        return "fade-out-quick";
      }

      return modalAnimation;
    });
  };

  const handleAccountBtnClick = () => {
    if (
      document.documentElement.clientWidth <= 767 &&
      status === "authenticated"
    ) {
      setIsAccountModalMobileOn((state) => !state);
      return;
    }

    if (status === "authenticated") {
      closeModal();
      return;
    }

    if (pathName.includes("units")) {
      const sectionTitleLiNavDot = document.querySelector(
        `.${NAV_DOT_HIGHLIGHTED_CLASS}`
      );
      const sectionTitle = sectionTitleLiNavDot?.getAttribute("name");
      const userEntryRedirectUrl =
        sectionTitle === "Overview"
          ? createUnitSectionUrl()
          : createUnitSectionUrl(sectionTitle!);

      setSessionStorageItem("userEntryRedirectUrl", userEntryRedirectUrl);
      router.push("/account");
      return;
    }

    if (pathName.includes("sign-up")) {
      setSessionStorageItem(
        "userEntryRedirectUrl",
        `${window.location.origin}/account`
      );
      router.push("/account");
      return;
    }

    setSessionStorageItem("userEntryRedirectUrl", window.location.href);
    router.push("/account");
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOnClickAwayCloseModal = (event: MouseEvent) => {
    const isWithinModal = getIsWithinParentElement(
      event.target as HTMLElement,
      USER_ACCOUNT_MODAL_ID,
      "id",
      "strictEquals"
    );

    console.log("Will close the modal: ", isWithinModal);

    if (isWithinModal) {
      closeModal();
    }
  };

  useEffect(() => {
    if (modalAnimation === "fade-in-quick") {
      document.addEventListener("click", handleOnClickAwayCloseModal);
    } else if (modalAnimation === "fade-out-quick") {
      document.removeEventListener("click", handleOnClickAwayCloseModal);
    }

    return () => {
      document.removeEventListener("click", handleOnClickAwayCloseModal);
    };
  }, [modalAnimation]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="login-container position-relative">
      <Button
        handleOnClick={handleAccountBtnClick}
        classNameStr="rounded px-2 py-2 border-0 d-flex justify-content-center align-items-center"
        isDisabled={status === "loading"}
        backgroundColor="#333438"
        defaultStyleObj={{
          width: "125px",
          opacity: status === "loading" ? 0.3 : 1,
          height: "44px",
        }}
      >
        {status === "unauthenticated" && (
          <span style={{ color: "white", fontWeight: 410 }}>LOGIN</span>
        )}
        {!wasUIDataLoaded && <Spinner color="white" />}
        {status === "authenticated" && wasUIDataLoaded && (
          <div className="position-relative d-flex align-items-center">
            {image ? (
              <div
                className={`avatar-ring ${
                  isGpPlusMember ? "gp-plus-user-color" : "free-user-color"
                }`}
              >
                <img
                  src={image}
                  alt="user_img"
                  style={{ objectFit: "contain" }}
                  className="rounded-circle w-100 h-100"
                />
              </div>
            ) : (
              <div
                className={`avatar-ring ${
                  isGpPlusMember ? "gp-plus-user-color" : "free-user-color"
                }`}
              >
                <FaUserAlt color="#2C83C3" />
              </div>
            )}
          </div>
        )}
      </Button>
      <div
        id={USER_ACCOUNT_MODAL_ID}
        style={{
          display: modalAnimation === "fade-out-quick" ? "none" : "block",
          zIndex: modalAnimation === "fade-out-quick" ? -1000 : 100000,
          pointerEvents: modalAnimation === "fade-out-quick" ? "none" : "auto",
          border: ".5px solid grey",
        }}
        className={`bg-white account-sm-modal py-2 rounded ${modalAnimation}`}
      >
        <section
          style={{ borderBottom: ".5px solid grey" }}
          className="d-flex flex-column justify-content-center align-items-center pb-2"
        >
          {isRetrievingUserData &&
          !firstName &&
          !lastName &&
          !isSigningUserOut ? (
            <Spinner color="white" />
          ) : (
            <h5 className="text-black my-3">
              {firstName} {lastName}
            </h5>
          )}
        </section>
        <section className="d-flex flex-column">
          <Button
            handleOnClick={() => {
              setModalAnimation("fade-out-quick");
              router.push("/account");
            }}
            classNameStr="no-btn-styles text-black txt-underline-on-hover py-2"
          >
            View Account
          </Button>
          <Button
            handleOnClick={async () => await handleSignOutBtnClick()}
            classNameStr="no-btn-styles  hover txt-underline-on-hover py-2"
          >
            {isSigningUserOut ? (
              <div
                className="spinner-border spinner-border-sm text-dark"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <span>SIGN OUT</span>
            )}
          </Button>
        </section>
      </div>
    </div>
  );
};

export default LoginContainerForNavbar;
