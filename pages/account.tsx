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
import { useEffect } from "react";
import { NextRouter, useRouter } from "next/router";
import { useModalContext } from "../providers/ModalProvider";
import axios from "axios";
import { Spinner } from "react-bootstrap";
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
    console.log("url: ", url);
    const response = await axios.get(url, paramsAndHeaders);

    // print the response
    console.log("response.data: ", response.data);

    if (response.status !== 200) {
      throw new Error("Received a non 200 response from the server.");
    }

    return response.data;
  } catch (error) {
    console.error("Failed to get the user account data. Reason: ", error);

    return null;
  }
};

export const getUrlVal = (router: NextRouter, urlField: string) => {
  const paths = router.asPath?.split("?");
  const urlKeyAndVal = paths?.[1]?.split("=");

  if (urlKeyAndVal?.length && urlKeyAndVal?.[0] === urlField) {
    return paths[1].split("=")?.[1];
  }

  return null;
};

const AccountPg = () => {
  const router = useRouter();
  const {
    _isAboutMeFormModalDisplayed,
    _notifyModal,
    _isAccountSettingModalOn,
  } = useModalContext();
  const [, setIsAboutMeFormModalDisplayed] = _isAboutMeFormModalDisplayed;
  const [, setIsAccountSettingsModalOn] = _isAccountSettingModalOn;
  /**
   * @type {[import('../providers/UserProvider').TUserAccount, import('react').Dispatch<import('react').SetStateAction<import('../providers/UserProvider').TUserAccount>>]} */
  const [, setNotifyModal] = _notifyModal;
  const occupation =
    typeof localStorage === "undefined"
      ? null
      : JSON.parse(localStorage.getItem("userAccount") ?? "{}").occupation;
  const { _aboutUserForm, status, token, user, _isRetrievingUserData } =
    useGetAboutUserForm();
  const { email, image } = user ?? {};
  const [isRetrievingUserData] = _isRetrievingUserData;
  const [aboutUserForm] = _aboutUserForm;
  const firstName = aboutUserForm.firstName;
  const lastName = aboutUserForm.lastName;

  useEffect(() => {
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

    const urlVals = getAllUrlVals(router)?.flatMap((urlVal) =>
      urlVal.split("=")
    ) as unknown as string[][];
    const urlValsChunks = urlVals?.length ? getChunks(urlVals, 2) : [];
    const didPasswordChange =
      urlValsChunks.find(([key, val]) => {
        if (key === "password_changed" && getIsParsable(val)) {
          return JSON.parse(val);
        }

        return false;
      }) !== undefined;

    if (status === "unauthenticated" && didPasswordChange) {
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
  }, [status]);

  useEffect(() => {
    const urlVals = getAllUrlVals(router, true) as unknown as string[][];
    const urlVal = urlVals?.length
      ? urlVals.find(([urlKey]) => urlKey === "show_about_user_form")
      : null;
    const accountSettingsModalOnUrlVals = urlVals?.length
      ? urlVals.find(([urlKey]) => urlKey === "will-open-account-setting-modal")
      : null;

    if (
      status === "authenticated" &&
      urlVal?.length === 2 &&
      getIsParsable(urlVal[1]) &&
      JSON.parse(urlVal[1])
    ) {
      setTimeout(() => {
        setIsAboutMeFormModalDisplayed(true);
      }, 300);

      // the second value in 'accountSettingsModalOnUrlVals is a boolean
    } else if (
      status === "authenticated" &&
      accountSettingsModalOnUrlVals?.length === 2 &&
      getIsParsable(accountSettingsModalOnUrlVals[1]) &&
      JSON.parse(accountSettingsModalOnUrlVals[1])
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

    const urlValsChunks = urlVals?.length ? getChunks(urlVals.flat(), 2) : [];
    const willOpenAccountSettingsModal =
      urlValsChunks.find(([key, val]) => {
        if (key === "will-open-account-settings-modal" && getIsParsable(val)) {
          return JSON.parse(val);
        }

        return false;
      }) !== undefined;

    // if the user is authenticated, if there is action parameter that contains 'open-account-settings-modal', then open the account setting modal
    if (status === "authenticated" && willOpenAccountSettingsModal) {
      setIsAccountSettingsModalOn(true);
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
            <span className="d-inline-flex justify-content-center align-tiems-center">
              Occupation:{" "}
            </span>
            <span
              style={{ fontStyle: "italic" }}
              className="d-inline-flex justify-content-center align-tiems-center "
            >
              {occupation ?? "UNANSWERED"}
            </span>
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
    </Layout>
  );
};

export default AccountPg;
