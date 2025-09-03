// @ts-nocheck
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable semi */
/* eslint-disable indent */
import Layout from "../components/Layout";
import { useQuery } from "@tanstack/react-query";
import { useCustomCookies } from "../customHooks/useCustomCookies";
import useSiteSession from "../customHooks/useSiteSession";
import {
  createGDriveAuthUrl,
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from "../shared/fns";
import { Spinner } from "react-bootstrap";
import { authenticateUserWithGDrive } from "../apiServices/user/crudFns";
import CustomLink from "../components/CustomLink";
import { CONTACT_SUPPORT_EMAIL } from "../globalVars";
import { useEffect, useState } from "react";
import { BtnWithSpinner } from "../components/General/BtnWithSpinner";
import { useModalContext } from "../providers/ModalProvider";

export const EXPIRATION_DATE_TIME = new Date(
  new Date().getTime() + 1_000 * 60 * 60 * 24 * 180
);

const GoogleDriveAuthResult = () => {
  const { status } = useSiteSession();
  const { setAppCookie, cookies } = useCustomCookies();
  const { token } = useSiteSession();
  const { _isLoginModalDisplayed } = useModalContext();
  const gpPlusFeatureLocation = getLocalStorageItem("gpPlusFeatureLocation");
  const [willRedirectUser, setWillRedirectUser] = useState(false);
  const [, setIsLoginModalDisplayed] = _isLoginModalDisplayed;
  const [wasLoginBtnClicked, setWasLoginBtnClicked] = useState(false);
  const didAttemptToRetrieveAuthTokens =
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(`${window.location.search}`)
      : null;

  const handleLoginBtnClick = () => {
    setWasLoginBtnClicked(true);
    setIsLoginModalDisplayed(true);
    setTimeout(() => {
      setWasLoginBtnClicked(false);
    }, 250);
  };

  useEffect(() => {
    const gpPlusFeatureLocation = getLocalStorageItem("gpPlusFeatureLocation");

    console.log("gpPlusFeatureLocation, yo there: ", gpPlusFeatureLocation);

    if (willRedirectUser && gpPlusFeatureLocation) {
      setTimeout(() => {
        removeLocalStorageItem("didGpSignInAttemptOccur");
        window.location.href = gpPlusFeatureLocation;
      }, 1000);
      setWillRedirectUser(false);
    }
  }, [willRedirectUser]);

  const { isError, isFetching } = useQuery({
    retry: 1,
    refetchOnWindowFocus: false,
    queryKey: [status],
    queryFn: async () => {
      if (status !== "authenticated") {
        console.log("The user is unauthenticated. Please log in first.");

        return false;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      console.log("The code from the url: ", code);

      if (!code) {
        return false;
      }

      console.log("Yo there, will authenticate the user with google drive...");

      const responseBody = await authenticateUserWithGDrive(code, token);

      console.log("Authentication, responseBody: ", responseBody);

      if (
        !responseBody ||
        !responseBody.access_token ||
        !responseBody.refresh_token ||
        !responseBody.email ||
        !responseBody.expires_at
      ) {
        throw new Error("AUTH FAILED");
      }

      if ("errType" in responseBody) {
        console.error(`errType: ${responseBody?.errType}`);

        return false;
      }

      setAppCookie("isSignedInAsGpPlusUser", true, {
        expires: new Date(new Date().getTime() + 1_000 * 60 * 60 * 24 * 180),
        secure: true,
        path: "/",
      });
      setAppCookie("gdriveAccessToken", responseBody.access_token, {
        expires: new Date(new Date().getTime() + 1_000 * 60 * 60 * 24 * 180),
        secure: true,
        path: "/",
      });
      setAppCookie("gdriveEmail", responseBody.email, {
        expires: new Date(new Date().getTime() + 1_000 * 60 * 60 * 24 * 180),
        secure: true,
        path: "/",
      });
      setAppCookie("gdriveRefreshToken", responseBody.refresh_token, {
        expires: new Date(new Date().getTime() + 1_000 * 60 * 60 * 24 * 180),
        secure: true,
        path: "/",
      });
      setAppCookie("gdriveAccessTokenExp", responseBody.expires_at, {
        expires: new Date(new Date().getTime() + 1_000 * 60 * 60 * 24 * 180),
        secure: true,
        path: "/",
      });

      console.log("COOKIES, sup there: ", Object.entries(cookies));

      if (gpPlusFeatureLocation) {
        setWillRedirectUser(true);
      }

      setLocalStorageItem("didGpSignInAttemptOccur", true);

      return true;
    },
  });

  if (status === "unauthenticated") {
    return (
      <Layout>
        <div className="min-vh-100 pt-5 ps-2 pe-2 pe-sm-0 ps-sm-5 d-flex flex-column w-sm-25">
          <span className="text-center text-sm-start">
            Please sign in to authenticate with Google Drive if you are a GP
            Plus member.
          </span>
          <div className="">
            <BtnWithSpinner
              wasClicked={wasLoginBtnClicked}
              onClick={handleLoginBtnClick}
            >
              <span>Login</span>
            </BtnWithSpinner>
          </div>
        </div>
      </Layout>
    );
  }

  if (isFetching) {
    return (
      <Layout>
        <div className="min-vh-100 pt-5 ps-2 pe-2 pe-sm-0 ps-sm-5 d-flex flex-column">
          <div className="text-center text-sm-start d-flex flex-column">
            <span
              style={{ width: "fit-content" }}
              className="text-center text-sm-start d-inline-flex flex-column justify-center"
            >
              {status === "authenticated"
                ? "Authenticating with Google Drive..."
                : "Loading, please wait..."}
              <span className="d-inline-flex align-items-center justify-content-center">
                <Spinner animation="border" role="status" className="mt-2">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </span>
            </span>
          </div>
        </div>
      </Layout>
    );
  }

  const authUrl = createGDriveAuthUrl();

  if (isError) {
    return (
      <Layout>
        <div className="min-vh-100 pt-5 ps-2 pe-2 pe-sm-0 ps-sm-5 d-flex flex-column w-sm-25">
          <span>We failed to authenticated you with Google Drive.</span>
          <span className="mt-2">
            Click
            <a href={authUrl} className="ms-1 mt-2 text-break">
              here
            </a>{" "}
            to try again. If this error persist, please contact{" "}
            <CustomLink
              hrefStr={CONTACT_SUPPORT_EMAIL}
              className="ms-1 mt-2 text-break"
            >
              support
            </CustomLink>
            .
          </span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-vh-100 pt-5 ps-2 pe-2 pe-sm-0 ps-sm-5 d-flex flex-column w-sm-25">
        <span>GP now has access to your google drive!</span>
        {gpPlusFeatureLocation && (
          <div
            style={{ width: "fit-content" }}
            className="d-flex justify-content-center d-flex flex-column mt-2"
          >
            <span>We are now redirecting you, please wait...</span>
            <div className="w-100 d-flex justify-content-center mt-1">
              <Spinner size="sm" className="text-black" />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GoogleDriveAuthResult;
