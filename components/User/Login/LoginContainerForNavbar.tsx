/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */

import { FaUserAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useModalContext } from "../../../providers/ModalProvider";
import Button from "../../General/Button";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCustomCookies } from "../../../customHooks/useCustomCookies";
import { TUseStateReturnVal } from "../../../types/global";
import { useGetAboutUserForm } from "../../../customHooks/useGetAboutUserForm";
import { TAboutUserForm } from "../../../backend/models/User/types";
import { Spinner } from "react-bootstrap";
import { getIsWithinParentElement } from "../../../shared/fns";
import { deleteUserFromServerCache } from "../../../apiServices/user/crudFns";
import useSiteSession from "../../../customHooks/useSiteSession";
import useHandleOpeningGpPlusAccount from "../../../customHooks/useHandleOpeningGpPlusAccount";
import { TAccountStageLabel } from "../../../backend/services/outsetaServices";
import Image from "next/image";

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

const LoginContainerForNavbar = ({ _modalAnimation }: IProps) => {
  const router = useRouter();
  const { _isLoginModalDisplayed, _isAccountModalMobileOn } = useModalContext();
  const { _aboutUserForm, _isRetrievingUserData } = useGetAboutUserForm(
    router.asPath !== "/account"
  );
  const [aboutUserForm] = _aboutUserForm;
  const [isRetrievingUserData] = _isRetrievingUserData;
  const userAccountSaved = (
    typeof localStorage !== "undefined" && localStorage.getItem("userAccount")
      ? JSON.parse(localStorage.getItem("userAccount") ?? "{}")
      : {}
  ) as TAboutUserForm;
  const [modalAnimation, setModalAnimation] = _modalAnimation;
  const { status, user, token } = useSiteSession();
  const { image } = user ?? {};
  const [, setIsAccountModalMobileOn] = _isAccountModalMobileOn;
  const [isSigningUserOut, setIsSigningUserOut] = useState(false);
  const { clearCookies } = useCustomCookies();

  // GP+ subscription check
  const { gpPlusSubscription } = useHandleOpeningGpPlusAccount(true);
  const isGpPlusMember =
    gpPlusSubscription?.membership?.AccountStageLabel &&
    HAS_MEMBERSHIP_STATUSES.has(
      gpPlusSubscription.membership.AccountStageLabel
    );
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
    // TODO: determine if the user is logged into their gp plus account as well
    // -if not, then call the signout function only and clear the cookies and the local storage

    await deleteUserFromServerCache(token);
    await signOut({ redirect: false });
    setIsSigningUserOut(true);
    localStorage.clear();
    sessionStorage.clear();
    clearCookies();

    window.Outseta?.on("logout", async () => {
      console.log("Logging the user out.");
      window.Outseta?.setAccessToken(null);
      window.Outseta?.setMagicLinkIdToken("");
      return false;
    });

    window.Outseta?.on("redirect", async () => {
      console.log("the user is being redirected");
      const currentUrl = window.location.href;
      window.location.href = currentUrl;
      return false;
    });

    window.Outseta?.logout();
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
        {status === "loading" && <Spinner color="white" />}
        {status === "authenticated" && (
          <div className="position-relative d-flex align-items-center">
            {image ? (
              <img
                src={image}
                alt="user_img"
                width={35}
                height={35}
                style={{ objectFit: "contain" }}
                className="rounded-circle"
              />
            ) : (
              <FaUserAlt color="#2C83C3" />
            )}
            {isGpPlusMember && (
              <Image
                src="/imgs/gp-logos/gp_submark.png"
                alt="gp_plus_logo"
                width={30}
                height={30}
                style={{
                  objectFit: "contain",
                  position: "absolute",
                  right: "-8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
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
            <Spinner className="text-black" />
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
