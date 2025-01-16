/* eslint-disable no-console */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
import { useEffect, useMemo, useState } from "react";
import CustomLink from "../components/CustomLink";
import Layout from "../components/Layout";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRef } from "react";
import { Spinner } from "react-bootstrap";
import { useCustomCookies } from "../customHooks/useCustomCookies";

const OnEmailListingCheckResultUI = ({
  resultTxt = "You are on the mailing list.",
  actionTxt = "to sign in.",
  href = "/account?open_sign_in_modal=true",
}) => {
  return (
    <span className="mt-2">
      {resultTxt}
      <br />
      <span className="mt-4">
        Click{" "}
        <CustomLink hrefStr={href} className="color-primary underline-on-hover">
          here
        </CustomLink>{" "}
        {actionTxt}
      </span>
    </span>
  );
};

const getConfirmationMailListingId = () => {
  const paramsStr = window.location.search.replace(/\?/, "");
  const urlParams = paramsStr.split("=");

  console.log("urlParams: ", urlParams);

  if (
    urlParams.length !== 2 ||
    (urlParams.length === 2 && urlParams[0] !== "confirmation-id")
  ) {
    return null;
  }

  return urlParams[1];
};

const MailingListConfirmation = () => {
  const session = useSession();
  const { status, data } = session;
  const { token } = data ?? {};
  const confirmationMaliingListId = useMemo(() => {
    return typeof window === "undefined"
      ? null
      : getConfirmationMailListingId();
  }, []);
  const mailListConfirmationIdKey = confirmationMaliingListId ?? "";
  const { setCookie, cookies } = useCustomCookies([mailListConfirmationIdKey]);
  const [
    isRetrievingUserMailingListStatus,
    setIsRetrievingUserMailingListStatus,
  ] = useState(true);
  const [userMailingListStatusResultUI, setUserMailingListStatusResultUI] =
    useState(
      <span className="mt-2">
        Unable to perform mailing list verification. This link is either
        expired, invalid, or was already used.
        <br />
        <span className="mt-4">
          Please{" "}
          <CustomLink
            hrefStr="/account"
            className="color-primary underline-on-hover"
          >
            sign in
          </CustomLink>{" "}
          to check if you are on the mailing list.
        </span>
      </span>
    );
  const wasStatusRetrievalCompleted = useRef(false);

  const getUserMailingListStatus = async (path = "/api/get-brevo-status") => {
    let isOnMailingList = false;

    if (
      typeof confirmationMaliingListId === "string" &&
      cookies[confirmationMaliingListId]
    ) {
      const actionTxt =
        status === "unauthenticated"
          ? "to sign in."
          : "to return to your account.";
      setUserMailingListStatusResultUI(
        <OnEmailListingCheckResultUI
          resultTxt="You are on the mailing list."
          actionTxt={actionTxt}
          href={"/account"}
        />
      );
      setIsRetrievingUserMailingListStatus(false);
      wasStatusRetrievalCompleted.current = true;
      isOnMailingList = true;
      return;
    } else if (
      typeof confirmationMaliingListId === "string" &&
      confirmationMaliingListId in cookies
    ) {
      let actionTxt;

      if (status === "unauthenticated") {
        actionTxt = "to log in and sign up.";
      } else {
        actionTxt = "to return to your account and sign up.";
      }

      setUserMailingListStatusResultUI(
        <OnEmailListingCheckResultUI
          resultTxt={"You are not on the mailing list."}
          actionTxt={actionTxt}
          href={"/account"}
        />
      );
      setIsRetrievingUserMailingListStatus(false);
      wasStatusRetrievalCompleted.current = true;
      isOnMailingList = false;
      return;
    }

    try {
      let headers = {};
      let params = { mailingListConfirmationId: confirmationMaliingListId };

      if (path === "/api/get-signed-in-user-brevo-status") {
        headers = {
          Authorization: `Bearer ${token}`,
        };
        params = {};
      }

      const origin = window.location.origin;
      const url = `${origin}${path}`;
      const response = await axios.get(url, {
        params,
        headers,
      });
      const { status: resStatus, data } = response ?? {};

      if (resStatus !== 200) {
        throw new Error(
          "Failed to retrieve the brevo status for the target user."
        );
      }

      let actionTxt;

      if (status === "unauthenticated") {
        actionTxt = data.isOnMailingList
          ? "to sign in."
          : "to log in and sign up.";
      } else {
        actionTxt = data.isOnMailingList
          ? "to return to your account."
          : "to return to your account and sign up.";
      }

      const resultTxt = data.isOnMailingList
        ? "You are on the mailing list."
        : "You are not on the mailing list. This link may have expired or been used.";
      setUserMailingListStatusResultUI(
        <OnEmailListingCheckResultUI
          resultTxt={resultTxt}
          actionTxt={actionTxt}
          href={"/account"}
        />
      );
      isOnMailingList = data.isOnMailingList;

      console.log("data: ", data);
    } catch (error) {
      const { msg, errType } = error?.response?.data ?? {};
      console.error(
        "Failed to get mailing list status for the target user. Reason: ",
        msg ?? error
      );

      console.error("Error type: ", errType);

      let actionTxt;

      if (status === "unauthenticated") {
        actionTxt = "to log in and sign up.";
      } else {
        actionTxt = "to return to your account and sign up.";
      }

      const resultTxt = "You are not on the mailing list.";
      setUserMailingListStatusResultUI(
        <OnEmailListingCheckResultUI
          resultTxt={resultTxt}
          actionTxt={actionTxt}
          href={"/account"}
        />
      );
      isOnMailingList = false;
    } finally {
      setIsRetrievingUserMailingListStatus(false);
      wasStatusRetrievalCompleted.current = true;
      setCookie(confirmationMaliingListId, isOnMailingList);
    }
  };

  useEffect(() => {
    (async () => {
      console.log("yo there bacon: status: ", status);
      if (
        status === "unauthenticated" &&
        wasStatusRetrievalCompleted.current === false
      ) {
        await getUserMailingListStatus();
      } else if (
        status === "authenticated" &&
        wasStatusRetrievalCompleted.current === false
      ) {
        console.log("will get status for signed in user....");
        await getUserMailingListStatus("/api/get-signed-in-user-brevo-status");
      }
    })();
  }, [status]);

  if (isRetrievingUserMailingListStatus) {
    return (
      <Layout>
        <div className="lessonDetailsContainer min-vh-100 pt-5 ps-3 ps-xxl-5 pt-xxl-4 d-flex flex-column">
          <div className="d-flex justify-content-center flex-column col-sm-2 align-items-center">
            <span className="pt-3 text-center">Loading, please wait...</span>
            <Spinner size="sm" className="text-dark mt-2" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="lessonDetailsContainer min-vh-100 pt-5 ps-3 ps-xxl-5 pt-xxl-4 d-flex flex-column">
        {userMailingListStatusResultUI}
      </div>
    </Layout>
  );
};

export default MailingListConfirmation;
