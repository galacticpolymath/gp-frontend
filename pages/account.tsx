/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable semi */
/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import Layout from "../components/Layout";
import LoginUI from "../components/User/Login/LoginUI";
import Button from "../components/General/Button";
import BootstrapBtn from "react-bootstrap/Button";
import React, { useEffect, useRef, useState } from "react";
import { NextRouter, useRouter } from "next/router";
import { useModalContext } from "../providers/ModalProvider";
import axios from "axios";
import { Modal, Spinner } from "react-bootstrap";
import {
  getAllUrlVals,
  getChunks,
  getIsParsable,
  resetUrl,
} from "../globalFns";
import { FaUserAlt } from "react-icons/fa";
import BootstrapButton from "react-bootstrap/Button";
import { useGetAboutUserForm } from "../customHooks/useGetAboutUserForm";
import AboutUserModal from "../components/User/AboutUser/AboutUserModal";
import Image from "next/image";
import {
  getBillingTerm,
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from "../shared/fns";
import { Magic } from "magic-sdk";
import CustomLink from "../components/CustomLink";
import { CONTACT_SUPPORT_EMAIL } from "../globalVars";
import { useGpPlusModalInteraction } from "../customHooks/useGpPlusModalInteraction";
import { useHandleGpPlusLogin } from "../customHooks/useHandleGpPlusLogin";
import ThankYouModal from "../components/GpPlus/ThankYouModal";
import { SELECTED_GP_PLUS_BILLING_TYPE } from "./gp-plus";
import { ILocalStorage } from "../types/global";
import useOutsetaInputValidation from "../customHooks/useOutsetaInputValidation";

export const getUserAccountData = async (
  token: string,
  email: string,
  customProjections: string[] = []
) => {
  try {
    let _customProjections = "";

    if (customProjections.every((val) => typeof val === "string")) {
      _customProjections = customProjections.join(", ");
    }

    const paramsAndHeaders = {
      params: { email: email, customProjections: _customProjections },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const url = `${window.location.origin}/api/get-user-account-data`;
    const response = await axios.get(url, paramsAndHeaders);

    if (response.status !== 200) {
      throw new Error("Received a non 200 response from the server.");
    }

    return response.data;
  } catch (error) {
    console.error("Failed to get the user account data. Reason: ", error);

    return null;
  }
};

const AccountPg: React.FC = () => {
  const router = useRouter();
  const {
    _isAboutMeFormModalDisplayed,
    _notifyModal,
    _isAccountSettingModalOn,
    _isThankYouModalDisplayed,
    _isGpPlusSignUpModalDisplayed,
  } = useModalContext();
  const [, setIsThankYouModalDisplayed] = _isThankYouModalDisplayed;
  const [, setIsAboutMeFormModalDisplayed] = _isAboutMeFormModalDisplayed;
  const [, setIsAccountSettingsModalOn] = _isAccountSettingModalOn;
  const [wasGpPlusBtnClicked, setWasGpPlusBtnClicked] = useState(false);
  const [isGpPlusSignUpModalDisplayed, setIsGpPlusSignUpModalDisplayed] =
    _isGpPlusSignUpModalDisplayed;
  const [gpPlusBillingPeriod, setGpPlusBillingPeriod] = useState<
    "month" | "year"
  >("year");
  const [, setNotifyModal] = _notifyModal;
  const {
    _aboutUserForm,
    status,
    token,
    user,
    _isRetrievingUserData,
    _gpPlusSub,
  } = useGetAboutUserForm();
  const { email, image } = user ?? {};
  const [isRetrievingUserData] = _isRetrievingUserData;
  const [aboutUserForm] = _aboutUserForm;
  const [gpPlusSub] = _gpPlusSub;
  const firstName = aboutUserForm.firstName;
  const lastName = aboutUserForm.lastName;
  const gpPlusAnchorElementRef = useRef<HTMLAnchorElement | null>(null);

  console.log("gpPlus, yo there: ", gpPlusSub);

  useGpPlusModalInteraction(
    gpPlusSub?.BillingRenewalTerm
      ? getBillingTerm(gpPlusSub?.BillingRenewalTerm)
      : undefined
  );
  useHandleGpPlusLogin();
  useOutsetaInputValidation();

  const handleGpPlusAccountBtnClick = async () => {
    let wasGpPlusAccountRetrievalSuccessful = false;

    try {
      const userAccount = getLocalStorageItem("userAccount");
      setWasGpPlusBtnClicked(true);

      console.log(
        "userAccount?.gpPlusSubscription: ",
        userAccount?.gpPlusSubscription
      );

      if (!userAccount?.gpPlusSubscription?.person?.Email) {
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

      if (!idToken) {
        const magic = new Magic(
          process.env.NEXT_PUBLIC_MAGIC_LINK_PK as string
        );
        idToken = await magic.auth.loginWithMagicLink({
          email: userAccount?.gpPlusSubscription?.person?.Email,
          // redirectURI: window.location.href,
        });

        if (idToken) {
          window.Outseta?.setMagicLinkIdToken(idToken);
        }
      }

      wasGpPlusAccountRetrievalSuccessful = true;

      setTimeout(() => {
        setWasGpPlusBtnClicked(false);
        gpPlusAnchorElementRef.current?.click();
      }, 500);
    } catch (error) {
      console.error("Failed to display gp plus account modal: ", error);
    } finally {
      if (!wasGpPlusAccountRetrievalSuccessful) {
        setWasGpPlusBtnClicked(false);
      }
    }
  };

  useEffect(() => {
    const url = new URL(window.location.href);

    if (
      url.searchParams.get("show_gp_plus_account_modal") === "true" &&
      status === "authenticated" &&
      (gpPlusSub?.AccountStageLabel === "Subscribing" ||
        gpPlusSub?.AccountStageLabel === "Cancelling")
    ) {
      console.log("hi there will click the gp plus button...");
      setWasGpPlusBtnClicked(true);

      setTimeout(() => {
        gpPlusAnchorElementRef?.current?.click();
        setWasGpPlusBtnClicked(false);
      }, 500);
      resetUrl(router);
      return;
    }

    if (
      status === "unauthenticated" &&
      router.asPath.includes("?") &&
      getAllUrlVals(router).some((urlParam) =>
        urlParam.includes("duplicate-email")
      )
    ) {
      const paths = getAllUrlVals(router, true) as unknown as string[][];
      const providerUsedForUserEntryArr = paths.find(
        ([urlKey]) => urlKey === "provider-used"
      );
      const providerUsed =
        providerUsedForUserEntryArr?.length === 2
          ? providerUsedForUserEntryArr[1]
          : null;
      const bodyTxt =
        providerUsed?.toLowerCase() === "google"
          ? "Try signing using your email and password."
          : "Try signing in with Google.";

      setTimeout(() => {
        setNotifyModal({
          isDisplayed: true,
          bodyTxt: bodyTxt,
          headerTxt:
            "Sign-in ERROR. There is an email with a different provider in our records.",
          handleOnHide: () => {
            resetUrl(router);
          },
        });
      }, 300);
    }

    const params = new URLSearchParams(window.location.search);
    const didPasswordChange = params.get("password_changed");

    if (status === "unauthenticated" && didPasswordChange === "true") {
      setTimeout(() => {
        setNotifyModal({
          isDisplayed: true,
          bodyTxt: "",
          headerTxt: "Password updated! You can now login.",
          handleOnHide: () => {
            resetUrl(router);
          },
        });
      }, 300);
    }

    if (
      status === "authenticated" &&
      gpPlusSub &&
      params.get("gp_plus_subscription_bought") === "true"
    ) {
      setIsThankYouModalDisplayed(true);
      resetUrl(router);
    }
  }, [status, gpPlusSub]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gpPlusBillingType = params.get(SELECTED_GP_PLUS_BILLING_TYPE);

    console.log("gpPlusBillingType: ", gpPlusBillingType);

    if (status === "authenticated" && gpPlusBillingType) {
      setLocalStorageItem(
        "selectedGpPlusBillingType",
        gpPlusBillingType as ILocalStorage["selectedGpPlusBillingType"]
      );
      setGpPlusBillingPeriod(
        gpPlusBillingType as ILocalStorage["selectedGpPlusBillingType"]
      );
    }

    if (
      status === "authenticated" &&
      params.get("show_about_user_form") === "true"
    ) {
      setTimeout(() => {
        setIsAboutMeFormModalDisplayed(true);
      }, 300);
    } else if (
      status === "authenticated" &&
      params.get("will-open-account-settings-modal") === "true"
    ) {
      setTimeout(() => {
        setIsAccountSettingsModalOn(true);
      }, 300);
    }

    const isOnMailingList =
      localStorage.getItem("isOnMailingList") !== null
        ? JSON.parse(localStorage.getItem("isOnMailingList") as string)
        : false;

    if (isOnMailingList && status === "authenticated") {
      (async () => {
        try {
          const response =
            (await axios.put(
              "/api/update-user",
              {
                email,
                clientUrl: `${window.location.origin}/mailing-list-confirmation`,
                willUpdateMailingListStatusOnly: true,
                willSendEmailListingSubConfirmationEmail: true,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )) ?? {};
          const { status, data } = response;

          console.log("response: ", response);

          if (status !== 200) {
            throw new Error("Failed to add user to email listing.");
          }

          console.log("Added user to mail listing. From server: ", data);

          localStorage.removeItem("isOnMailingList");
        } catch (error) {
          console.error("Failed to add user to mail listing. Reason: ", error);
        }
      })();
    }

    if (
      status === "authenticated" &&
      gpPlusSub?.AccountStageLabel !== "NonMember"
    ) {
      window.Outseta?.on("signup", () => {
        console.log("The user has signed up.");

        const gpPlusFeatureLocation = getLocalStorageItem(
          "gpPlusFeatureLocation"
        );

        console.log("gpPlusFeatureLocation: ", gpPlusFeatureLocation);

        // will redirect to the selected unit so that user can copy it
        if (gpPlusFeatureLocation?.includes("#")) {
          setLocalStorageItem("willShowGpPlusPurchaseThankYouModal", true);

          window.location.href = gpPlusFeatureLocation;

          return false;
        }

        // will redirect to the account page
        if (gpPlusFeatureLocation) {
          console.log("Will redirect the user.");
          window.location.href = `${gpPlusFeatureLocation}?gp_plus_subscription_bought=true`;

          return false;
        }

        const currentUrl = `${window.location.href}?gp_plus_subscription_bought=true`;
        window.location.href = currentUrl;

        return false;
      });
    }
  }, [status]);

  if (status === "loading" || isRetrievingUserData) {
    return (
      <Layout
        className=""
        title="Galactic Polymath Teacher Portal | Login"
        imgSrc="../assets/img/logo.png"
        url="https://teach.galacticpolymath.com/account"
        description="Log in to access the Galactic Polymath Teacher Portal, where you can view and download lesson plans, track student progress, and more. Get started today!"
        imgAlt="Galactic Polymath Logo"
        canonicalLink="https://teach.galacticpolymath.com/account"
        keywords="teacher portal, login, galactic polymath, lesson plans, student progress"
        langLinks={[]}
      >
        <div
          style={{ minHeight: "100vh" }}
          className="container pt-5 mt-5 d-flex flex-column align-items-center"
        >
          <h5>Loading, please wait...</h5>
          <Spinner className="text-dark" />
        </div>
      </Layout>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Layout
        className=""
        title="Galactic Polymath Teacher Portal | Login"
        imgSrc="../assets/img/logo.png"
        url="https://teach.galacticpolymath.com/account"
        description="Log in to access the Galactic Polymath Teacher Portal, where you can view and download lesson plans, track student progress, and more. Get started today!"
        imgAlt="Galactic Polymath Logo"
        canonicalLink="https://teach.galacticpolymath.com/account"
        keywords="teacher portal, login, galactic polymath, lesson plans, student progress"
        langLinks={[]}
      >
        <div
          style={{ minHeight: "100vh", paddingTop: "10px" }}
          className="container pt-4"
        >
          <LoginUI
            className="pt-5"
            headingTitleClassName="text-center text-black my-2"
          />
        </div>
      </Layout>
    );
  }

  const handleViewAboutMeFormBtnClick = () => {
    setIsAboutMeFormModalDisplayed(true);
  };
  const handleAccontSettingsBtnClick = () => {
    setIsAccountSettingsModalOn(true);
  };

  return (
    <Layout
      className=""
      title="Galactic Polymath Teacher Portal | Login"
      imgSrc="../assets/img/logo.png"
      url="https://teach.galacticpolymath.com/account"
      description="Log in to access the Galactic Polymath Teacher Portal, where you can view and download lesson plans, track student progress, and more. Get started today!"
      imgAlt="Galactic Polymath Logo"
      canonicalLink="https://teach.galacticpolymath.com/account"
      keywords="teacher portal, login, galactic polymath, lesson plans, student progress"
      langLinks={[]}
    >
      <div
        style={{ minHeight: "90vh", paddingTop: "10px" }}
        className="container pt-5 pt-sm-4"
      >
        <section className="row border-bottom pb-4">
          <section className="col-12 d-flex justify-content-center align-items-center pt-4">
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
              <FaUserAlt fontSize={35} color="#2C83C3" />
            )}
          </section>
          <section className="col-12 d-flex justify-content-center align-items-center mt-3 flex-column">
            <h5 className="mb-0">
              {firstName} {lastName}
            </h5>
            <span>{email}</span>
          </section>
          <section className="col-12 d-flex justify-content-center align-items-center flex-column mt-1 pt-2">
            {aboutUserForm.isGpPlusMember ? (
              <>
                <BootstrapBtn
                  onClick={handleGpPlusAccountBtnClick}
                  variant="secondary"
                  className="d-flex justify-content-center align-items-center border-0 rounded px-2 py-1"
                  disabled={false}
                  style={{
                    backgroundColor: "#2D69D1",
                    width: "225px",
                    height: "64px",
                  }}
                >
                  {wasGpPlusBtnClicked ? (
                    <Spinner className="text-dark" />
                  ) : (
                    <>
                      <span className="text-white">View</span>
                      <Image
                        src="/imgs/gp-logos/gp_submark.png"
                        alt="gp_plus_logo"
                        width={55}
                        height={55}
                        style={{
                          width: "55px",
                          height: "55px",
                          objectFit: "contain",
                        }}
                        className="mx-1"
                      />
                      <span className="text-white">Account</span>
                    </>
                  )}
                </BootstrapBtn>
                <a
                  ref={gpPlusAnchorElementRef}
                  style={{
                    zIndex: -10,
                    opacity: 0,
                  }}
                  className="no-underline"
                  href="https://galactic-polymath.outseta.com/profile?tab=account#o-authenticated"
                ></a>
              </>
            ) : (
              <BootstrapBtn
                onClick={() => {
                  setLocalStorageItem(
                    "gpPlusFeatureLocation",
                    window.location.href
                  );
                  router.push("/gp-plus");
                }}
                variant="secondary"
                className="d-flex justify-content-center align-items-center border-0 rounded px-2 py-1"
              >
                <span className="text-white">Upgrade To </span>
                <Image
                  src="/imgs/gp-logos/gp_submark.png"
                  alt="gp_plus_logo"
                  width={55}
                  height={55}
                  style={{
                    width: "55px",
                    height: "55px",
                    objectFit: "contain",
                  }}
                  className="ms-1"
                />
              </BootstrapBtn>
            )}
          </section>
          <section className="col-12 d-flex justify-content-center align-items-center flex-column mt-1 pt-2">
            <Button
              defaultStyleObj={{ width: "210px" }}
              handleOnClick={handleViewAboutMeFormBtnClick}
              classNameStr="rounded border shadow mt-2"
            >
              <span style={{ fontWeight: 410 }} className="text-black">
                View {"'"}About Me{"'"} form
              </span>
            </Button>
            <Button
              defaultStyleObj={{ width: "210px" }}
              handleOnClick={handleAccontSettingsBtnClick}
              classNameStr="rounded border shadow mt-2"
            >
              <span style={{ fontWeight: 410 }} className="text-black">
                Account Settings
              </span>
            </Button>
          </section>
        </section>
        <section className="row mt-4">
          <section className="col-12 d-flex flex-column align-items-center justify-center">
            <BootstrapButton
              onClick={() => router.push("/")}
              variant="primary"
              size="sm"
              className="p-1"
              style={{ width: "210px" }}
            >
              <span
                style={{ fontSize: "18px", textTransform: "none" }}
                className=""
              >
                Explore Lessons
              </span>
            </BootstrapButton>
          </section>
        </section>
      </div>
      <AboutUserModal />
      <ThankYouModal />
      <Modal
        show={isGpPlusSignUpModalDisplayed}
        onShow={() => {
          removeLocalStorageItem("selectedGpPlusBillingType");
        }}
        onHide={() => {
          setIsGpPlusSignUpModalDisplayed(false);
        }}
        size="lg"
        centered
        className="rounded"
        keyboard={false}
        style={{
          zIndex: 10000,
        }}
      >
        <div
          id="outseta-sign-up"
          data-o-auth="1"
          data-widget-mode="register"
          data-plan-uid="rmkkjamg"
          data-plan-payment-term={gpPlusBillingPeriod}
          data-skip-plan-options="false"
          data-mode="embed"
        />
      </Modal>
    </Layout>
  );
};

export default AccountPg;
