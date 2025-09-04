/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable quotes */
/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Spinner,
} from "react-bootstrap";
import { useContext, useRef, useState } from "react";
import {
  ModalContext,
  useModalContext,
} from "../../../providers/ModalProvider";
import { CustomCloseButton } from "../../../ModalsContainer";
import { IoMdClose } from "react-icons/io";
import CheckBox from "../../General/CheckBox";
import Button from "../../General/Button";
import { getIsParsable, resetUrl } from "../../../globalFns";
import {
  deleteUserFromServerCache,
  sendDeleteUserReq,
  updateUser,
} from "../../../apiServices/user/crudFns";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import CustomLink from "../../CustomLink";
import { CONTACT_SUPPORT_EMAIL } from "../../../globalVars";
import Image from "next/image";
import { getLocalStorageItem, setLocalStorageItem } from "../../../shared/fns";
import useSiteSession from "../../../customHooks/useSiteSession";
import { revokeGoogleAuthToken } from "../Login/LoginContainerForNavbar";
import { TUserSchemaForClient } from "../../../backend/models/User/types";
import { useCustomCookies } from "../../../customHooks/useCustomCookies";
import { BtnWithSpinner } from "../../General/BtnWithSpinner";

const AccountSettings = () => {
  const { _isAccountSettingModalOn, _notifyModal } = useModalContext();
  const [isAccountSettingsModalDisplayed, setIsAccountSettingModalDisplayed] =
    _isAccountSettingModalOn;
  const [isSavingChangesSpinnerOn, setIsSavingChangesSpinnerOn] =
    useState(false);
  const [accountForm, setAccountForm] = useState<Partial<TUserSchemaForClient>>(
    {}
  );
  const { token, user, gdriveAccessToken, session } = useSiteSession();
  const { email, name } = user ?? {};
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [didServerErrOccur, setDidServerErrOccur] = useState(false);
  const router = useRouter();
  const [, setNotifyModal] = _notifyModal;
  const modalBodyRef = useRef(null);
  const { clearCookies } = useCustomCookies();

  const handleOnHide = () => {
    setIsAccountSettingModalDisplayed(false);
    setDidServerErrOccur(false);
    setIsDeletingAccount(false);
  };

  const handleOnShow = () => {
    setIsAccountSettingModalDisplayed(true);

    const userAccount = getLocalStorageItem("userAccount");

    if (userAccount) {
      setAccountForm((state) => {
        return {
          ...state,
          isOnMailingList: userAccount?.isOnMailingList ?? false,
        };
      });
    }

    const url = router.asPath;

    if (url.includes("?")) {
      const newUrl = url.split("?")[0];
      router.replace(newUrl);
    }
  };

  const handleDeleteAccountBtnClick = async () => {
    setIsDeletingAccount(true);
    const willDeleteAccount = confirm(
      "Are you sure you want to delete your account? This operation is irreversible."
    );

    if (!willDeleteAccount) {
      setIsDeletingAccount(false);
      return;
    }

    if (!email) {
      alert(
        "An error has occurred. Your email was not found. Please refresh the page and try again."
      );
      return;
    }

    const isUserSignedIntoGpPlus = window?.Outseta
      ? !!(await window.Outseta.getUser())
      : false;
    const { wasSuccessful: didDeleteUserSuccessfully, errType } =
      await sendDeleteUserReq(email, token);
    const wasUserNotFound = errType === "userNotFound";

    if ((didDeleteUserSuccessfully || wasUserNotFound) && gdriveAccessToken) {
      await revokeGoogleAuthToken(gdriveAccessToken);
    }

    console.log("isUserSignedIntoGpPlus: ", isUserSignedIntoGpPlus);

    if (
      (didDeleteUserSuccessfully || wasUserNotFound) &&
      isUserSignedIntoGpPlus
    ) {
      console.log("The user is signed into gp plus");
      localStorage.clear();
      sessionStorage.clear();
      clearCookies();
      setLocalStorageItem("wasUserDeleted", true);
      await deleteUserFromServerCache(token);
      await signOut({ callbackUrl: "/" });
      window.Outseta?.on("logout", async () => {
        console.log("Logging the user out.");
        window.Outseta?.setAccessToken(null);
        window.Outseta?.setMagicLinkIdToken("");
        return false;
      });
      window.Outseta?.logout();
      return;
    }

    if (didDeleteUserSuccessfully || wasUserNotFound) {
      console.log("the user is not signed into gp plus");
      localStorage.clear();
      sessionStorage.clear();
      clearCookies();
      setLocalStorageItem("wasUserDeleted", true);
      await deleteUserFromServerCache(token);
      await signOut({ callbackUrl: "/" });
      return;
    }

    alert("An error has occurred. Please refresh the page and try again.");
  };

  const handleIsOnMailingListBtnToggle = () => {
    setAccountForm((state) => ({
      ...state,
      isOnMailingList: !state.isOnMailingList,
    }));
  };

  const handleSaveBtnClick = async () => {
    setIsSavingChangesSpinnerOn(true);
    setDidServerErrOccur(false);

    const userAccountPrevVals = getLocalStorageItem("userAccount");
    let additionalReqBodyProps = {};

    if (userAccountPrevVals?.isOnMailingList === accountForm.isOnMailingList) {
      alert("Please update your mailing list status to save changes.");
      setTimeout(() => {
        setIsSavingChangesSpinnerOn(false);
      }, 300);
      return;
    }

    if (userAccountPrevVals?.isOnMailingList !== accountForm.isOnMailingList) {
      additionalReqBodyProps = {
        ...additionalReqBodyProps,
        willUpdateMailingListStatusOnly: true,
        willSendEmailListingSubConfirmationEmail: true,
        clientUrl: `${window.location.origin}/mailing-list-confirmation`,
      };
    }

    const responseBody = await updateUser(
      { email: email! },
      {},
      additionalReqBodyProps,
      token
    );

    console.log("responseBody, sup there: ", responseBody);

    if (!responseBody) {
      setTimeout(() => {
        setDidServerErrOccur(true);
        setIsSavingChangesSpinnerOn(false);
      }, 250);
      return;
    }

    setTimeout(() => {
      let bodyTxt = "";

      if (
        !userAccountPrevVals?.isOnMailingList &&
        accountForm.isOnMailingList
      ) {
        bodyTxt =
          "Please check your e-mail inbox to confirm your subscription with GP's mailing list.";
      } else if (
        userAccountPrevVals?.isOnMailingList &&
        !accountForm.isOnMailingList
      ) {
        bodyTxt =
          "You've unscribed from GP's mailing list. You will no longer receive e-mails from us.";
      }

      handleOnHide();

      setNotifyModal({
        isDisplayed: true,
        bodyTxt,
        headerTxt: "Updates saved!",
        handleOnHide: async () => {
          await session.update();
        },
      });
      setIsSavingChangesSpinnerOn(false);
    }, 250);
  };

  return (
    <Modal
      show={isAccountSettingsModalDisplayed}
      onHide={handleOnHide}
      onShow={handleOnShow}
      onBackdropClick={handleOnHide}
      dialogClassName="border-0 selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center"
      contentClassName="account-settings-modal user-modal-color"
    >
      <CustomCloseButton
        className="no-btn-styles position-absolute top-0 end-0 me-sm-2 me-sm-3 mt-1"
        handleOnClick={handleOnHide}
        style={{ zIndex: 10000000 }}
      >
        <IoMdClose color="black" size={28} />
      </CustomCloseButton>
      <ModalHeader
        className="position-relative"
        style={{
          height: "80px",
        }}
      >
        <ModalTitle
          style={{ maxWidth: "1800px" }}
          className="px-2 py-3 txt-color-for-aboutme-modal w-100"
        >
          Account Settings
        </ModalTitle>
      </ModalHeader>
      <ModalBody
        ref={modalBodyRef}
        className="about-me-modal-body w-100 d-flex flex-column pt-0"
      >
        <form className="h-100 px-1 px-sm-4 position-relative d-flex flex-column">
          <section className="d-flex flex-column">
            <section className="row d-flex flex-column flex-lg-row px-sm-3 mt-3">
              <CheckBox
                isChecked={accountForm.isOnMailingList}
                handleOnClick={handleIsOnMailingListBtnToggle}
                checkBoxContainerClassName="d-flex"
                txtClassName="pointer underline-on-hover"
              >
                Subscribe to GP mailing list.
              </CheckBox>
              <span className="ps-3">
                *If you{"'"}re subscribing, please check your email inbox for
                the confirmation email.
              </span>
            </section>
          </section>
          <section style={{ height: "55%" }} className="mt-2 mt-sm-2">
            <h5 style={{ height: "10%" }} className="text-danger px-sm-3">
              <i>Danger Zone</i>
            </h5>
            <section
              style={{ height: "90%" }}
              className="rounded w-100 px-2 py-2 px-sm-3 py-sm-2"
            >
              <div
                style={{ border: "solid 1.75px red" }}
                className="rounded bottom-0 w-100 row d-flex flex-column py-2 h-100"
              >
                <section className="w-100 d-flex flex-sm-row flex-column justify-content-between">
                  <section className="d-flex flex-column">
                    <span style={{ fontWeight: 600 }}>Delete your account</span>
                    <span style={{ wordWrap: "break-word", maxWidth: "450px" }}>
                      You will no longer have access to the {"teacher's"}{" "}
                      materials of a unit if you are a teacher.
                    </span>
                  </section>
                  <section className="d-flex justify-content-sm-center align-items-sm-center pt-sm-0 pt-2">
                    <BtnWithSpinner
                      className="btn bg-danger no-btn-styles rounded px-2 py-2 px-sm-4 py-sm-2 mt-2 mt-sm-0"
                      onClick={handleDeleteAccountBtnClick}
                      wasClicked={isDeletingAccount}
                      style={{ minWidth: "160px" }}
                    >
                      Delete account
                    </BtnWithSpinner>
                  </section>
                </section>
              </div>
            </section>
          </section>
        </form>
      </ModalBody>
      <ModalFooter className="px-4 d-flex flex-column justify-content-start align-items-start">
        <Button
          defaultStyleObj={{
            width: "110px",
          }}
          handleOnClick={handleSaveBtnClick}
          classNameStr="btn bg-primary"
        >
          {isSavingChangesSpinnerOn ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : (
            "Save"
          )}
        </Button>
        <div className="d-inline-block error-txt-container-account-settings text-break">
          {didServerErrOccur && (
            <>
              <span style={{ fontSize: "1.2em" }} className="text-danger">
                *
              </span>
              Failed to save changes. If this error persists, please email and
              describe the problem at{" "}
              <CustomLink
                hrefStr={CONTACT_SUPPORT_EMAIL}
                className="text-primary"
              >
                {CONTACT_SUPPORT_EMAIL}
              </CustomLink>
              .
            </>
          )}
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default AccountSettings;
