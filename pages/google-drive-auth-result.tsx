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
import { createGDriveAuthUrl, getLocalStorageItem } from "../shared/fns";
import { Button, Spinner } from "react-bootstrap";
import { authenticateUserWithGDrive } from "../apiServices/user/crudFns";
import CustomLink from "../components/CustomLink";
import { CONTACT_SUPPORT_EMAIL } from "../globalVars";
import { useRef } from "react";

const GoogleDriveAuthResult = () => {
  const { status } = useSiteSession();
  const { setAppCookie } = useCustomCookies();
  const gpPlusFeatureLocation = getLocalStorageItem("gpPlusFeatureLocation");
  const didRetrieveToken = useRef(false);
  const { isError, isFetching } = useQuery({
    retry: 1,
    refetchOnWindowFocus: false,
    queryKey: ["authToken"],
    queryFn: async () => {
      if (status !== "authenticated") {
        throw new Error("userUnauthenticated");
      }

      if (didRetrieveToken.current) {
        return true;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) {
        throw new Error("codeNotFound");
      }

      const responseBody = await authenticateUserWithGDrive(code);

      console.log("responseBody, sup there, meng: ", responseBody);

      if (
        !responseBody ||
        !responseBody.access_token ||
        !responseBody.refresh_token ||
        !responseBody.expires_at
      ) {
        throw new Error(
          "No response body found or the tokens weren't found. Please try again."
        );
      }

      if ("errType" in responseBody) {
        console.error(`errType: ${responseBody?.errType}`);

        throw new Error("Authorization has failed.");
      }

      setAppCookie("gdriveAccessToken", responseBody.access_token, {
        expires: new Date(responseBody.expires_at),
        httpOnly: true,
        sameSite: true,
        secure: true,
      });
      setAppCookie("gdriveRefreshToken", responseBody.refresh_token, {
        expires: new Date(new Date().getTime() + 1_000 * 60 * 60 * 24 * 180),
        httpOnly: true,
        sameSite: true,
        secure: true,
      });
      setAppCookie("gdriveAccessTokenExp", responseBody.expires_at, {
        expires: new Date(new Date().getTime() + 1_000 * 60 * 60 * 24 * 180),
        httpOnly: true,
        sameSite: true,
        secure: true,
      });

      didRetrieveToken.current = true;

      return true;
    },
  });

  if (isFetching) {
    return (
      <Layout>
        <div className="min-vh-100 pt-5 ps-2 pe-2 pe-sm-0 ps-sm-5 d-flex flex-column w-sm-25">
          <span className="text-center text-sm-start">
            Authenticating with Google Drive...
          </span>
          <div className="d-flex justify-content-center mt-2">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
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
          <span>We failed to authenticated you with Google Drive</span>
          <span className="mt-2">
            Click
            <CustomLink hrefStr={authUrl} className="ms-1 mt-2 text-break">
              here
            </CustomLink>{" "}
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
