import React, { ReactNode, useRef, useState } from "react";
import { Modal, Button, CloseButton, Form } from "react-bootstrap";
import Image from "next/image";
import { RiMailSendFill } from "react-icons/ri";
import Wave from "react-wavify";
import {
  TUserEmailNewLetterStatus,
  useModalContext,
} from "../../../providers/ModalProvider";
import { BtnWithSpinner } from "../../General/BtnWithSpinner";
import { VALID_ORIGINS } from "../../../shared/constants";
import { updateUser } from "../../../apiServices/user/crudFns";
import useSiteSession from "../../../customHooks/useSiteSession";
import { toast } from "react-toastify";
import { setSessionStorageItem } from "../../../shared/fns";

interface IJoinMailingListTitle {
  emailStatus: TUserEmailNewLetterStatus;
}

const JoinMailingListTitleModalTitle: React.FC<IJoinMailingListTitle> = ({
  emailStatus,
}) => {
  return (
    <h2 className="d-flex bold mb-2 text-center w-100 justify-content-center align-items-center">
      <>
        {emailStatus === "double-opt-sent" ? (
          <>Oops!</>
        ) : (
          <>
            Join Our Mailing List
            <RiMailSendFill
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginRight: "0.5rem",
                marginLeft: "0.5rem",
                marginTop: ".2rem",
              }}
            />
          </>
        )}
      </>
    </h2>
  );
};

interface EmailNewsletterSignUpProps {
  show: boolean;
  onHide?: () => void;
}

interface IUserNotOnMailingListCopyTxt {
  intro: string;
  callToAction: string | ReactNode;
}

const USER_NOT_ON_MAILING_LIST_COPY_TXT: Record<
  TUserEmailNewLetterStatus,
  IUserNotOnMailingListCopyTxt
> = {
  "double-opt-sent": {
    intro: "You signed up for emails, but haven't confirmed your email.",
    callToAction: (
      <>
        To make sure you get all our latest updates and free stuff, check your
        spam for an email or click <i>Resend Invite</i> to receive another
        invitation email.
      </>
    ),
  },
  "not-on-list": {
    intro: "You're missing our latest updates and free stuff!",
    callToAction: (
      <>
        To join our monthly newsletter, click <i>Send Invite</i> to receive an
        invitation email.
      </>
    ),
  },
};

interface IUserNotOnMailingListCopyCompProps {
  userEmailNewsLetterStatus: TUserEmailNewLetterStatus;
}

const UserNotOnMailingListCopyTxt: React.FC<
  IUserNotOnMailingListCopyCompProps
> = ({ userEmailNewsLetterStatus }) => {
  const userNotOnMailingListCopy =
    USER_NOT_ON_MAILING_LIST_COPY_TXT[userEmailNewsLetterStatus];

  if (!userNotOnMailingListCopy) {
    throw new Error(
      `DEVELOPER ERROR: UserNotOnMailingListCopyCompProps: userEmailNewsLetterStatus=${userEmailNewsLetterStatus} is not supported`
    );
  }

  const { callToAction, intro } = userNotOnMailingListCopy;

  return (
    <section className="w-100 d-flex justify-content-center align-items-center flex-column">
      <p
        style={{ textWrap: "pretty", maxWidth: "29em" }}
        className="mt-2 text-muted mb-0 text-center lh-lg"
      >
        {intro}
      </p>
      <p
        style={{ textWrap: "pretty", maxWidth: "29em" }}
        className="text-muted mb-0 text-center lh-lg"
      >
        {callToAction}
      </p>
    </section>
  );
};

const EmailNewsletterSignUp: React.FC = () => {
  const {
    _emailNewsletterSignUpModal: [
      emailNewsletterSignUpModal,
      setEmailNewsletterSignUpModal,
    ],
  } = useModalContext();
  const { token, user } = useSiteSession();
  const {
    userEmailNewsLetterStatus,
    isDisplayed,
    handleOnHide: onHide,
  } = emailNewsletterSignUpModal ?? {};
  const wasDoubleOptEmailSent = userEmailNewsLetterStatus === "double-opt-sent";
  const [
    willNotShowEmailNewsLetterSignUpModalAgin,
    setWillNotShowEmailNewsLetterSignUpModalAgain,
  ] = useState(false);
  const wasUserAddedToMailingListRef = useRef(false);
  const [isBtnSpinnerDisplayed, setIsBtnSpinnerDisplayed] = useState(false);

  if (!isDisplayed) {
    return null;
  }

  const handleSendInviteBtnClick = async () => {
    try {
      setIsBtnSpinnerDisplayed(true);

      if (!VALID_ORIGINS.has(window.location.origin)) {
        throw new Error(
          `DEVELOPER ERROR: The origin ${window.location.origin} is not supported`
        );
      }

      const additionalReqBodyProps = {
        willUpdateMailingListStatusOnly: true,
        willSendEmailListingSubConfirmationEmail: true,
        clientUrl: `${window.location.origin}/mailing-list-confirmation`,
      };
      const responseBody = await updateUser(
        undefined,
        {},
        additionalReqBodyProps,
        token
      );

      console.log("Response body, update user: ", responseBody);

      if (!responseBody?.wasSuccessful) {
        throw new Error("Unable to send invite to the target user.");
      }

      wasUserAddedToMailingListRef.current = true;

      setTimeout(() => {
        toast.info(
          <span style={{ fontSize: "14px" }}>
            Invite sent to <i>{user.email}</i>. Please check your inbox.
          </span>,
          {
            position: "top-center",
          }
        );
      }, 250);

      setEmailNewsletterSignUpModal((state) => {
        if (!state) {
          return state;
        }

        return {
          ...state,
          isDisplayed: false,
        };
      });
    } catch (error) {
      console.log("An error has occurred: ", error);

      toast.error(
        <span style={{ fontSize: "14px" }}>
          Failed to send mailing list invite. Please try again or refresh the
          page.
        </span>,
        {
          position: "top-center",
        }
      );
    } finally {
      setIsBtnSpinnerDisplayed(false);
    }
  };

  if (!userEmailNewsLetterStatus) {
    console.error(
      "DEVELOPER ERROR: Unable to find user email newsletter status. Check the 'emailNewsletterSignUpModal' in the modal provider file."
    );
    return null;
  }

  const handleOnClose = async () => {
    if (onHide) {
      onHide();
    }

    console.log(
      "Will not show email newsletter sign up modal again: ",
      willNotShowEmailNewsLetterSignUpModalAgin
    );

    if (willNotShowEmailNewsLetterSignUpModalAgin) {
      setSessionStorageItem("canShowEmailNewsLetterSignUpModal", false);
      const responseBody = await updateUser(
        undefined,
        {
          willNotShowEmailNewsLetterSignUpModal: true,
        },
        {},
        token
      );

      console.log("responseBody, bacon: ", responseBody);

      if (!responseBody?.wasSuccessful) {
        console.error(
          "Unable to set 'willNotShowEmailNewsLetterSignUpModal' as true."
        );
      }
    }

    setEmailNewsletterSignUpModal((state) => {
      if (!state) {
        return state;
      }

      return {
        ...state,
        isDisplayed: false,
      };
    });
  };

  return (
    <Modal
      show={isDisplayed}
      onHide={handleOnClose}
      centered
      size="lg"
      className="email-newsletter-modal"
    >
      <div className="position-relative">
        <CloseButton
          className="position-absolute"
          style={{
            top: "5px",
            right: "5px",
            zIndex: 1001,
          }}
          onClick={handleOnClose}
        />
        <div
          style={{ borderTopLeftRadius: "1em", borderTopRightRadius: "1em" }}
          className="gp-plus-modal-gradient position-relative"
        >
          <div
            style={{
              zIndex: 1000,
              left: "50%",
              transform: "translate(-50%, 0%)",
            }}
            className="position-absolute d-flex flex-column justify-content-center align-items-center pt-2"
          >
            <div className="d-flex justify-content-center mb-2">
              <Image
                src="/GP_bubbleLogo300px.png"
                alt="Galactic Polymath Logo"
                width={120}
                height={120}
                priority
                className="img-fluid"
              />
            </div>
            <JoinMailingListTitleModalTitle
              emailStatus={userEmailNewsLetterStatus ?? "double-opt-sent"}
            />
          </div>
          <Wave
            fill="white"
            paused
            style={{
              display: "flex",
              borderBottom: "solid 1px white",
            }}
            options={{
              height: 60,
              amplitude: 450,
              speed: 0.15,
              points: 2,
            }}
          />
        </div>
        <Modal.Body className="text-center p-4 mt-2 position-relative">
          <UserNotOnMailingListCopyTxt
            userEmailNewsLetterStatus={userEmailNewsLetterStatus}
          />
          <div className="d-flex justify-content-center align-items-center">
            <Form.Check
              type="checkbox"
              id="dont-show-again"
              label="Don't remind me again."
              checked={willNotShowEmailNewsLetterSignUpModalAgin}
              onChange={(event) =>
                setWillNotShowEmailNewsLetterSignUpModalAgain(
                  event.target.checked
                )
              }
              className="mt-3 text-muted"
              style={{ fontSize: "0.9rem", width: "fit-content" }}
            />
          </div>
          <div className="d-flex justify-content-center align-items-center gap-2">
            <Button
              onClick={handleOnClose}
              className="btn btn-primary px-4 py-2 mt-4"
              style={{
                borderRadius: "6px",
                fontWeight: "500",
                borderColor: "gray",
                backgroundColor: "gray",
                textTransform: "none",
              }}
            >
              Close
            </Button>
            <BtnWithSpinner
              wasClicked={isBtnSpinnerDisplayed}
              onClick={handleSendInviteBtnClick}
              className="btn btn-primary px-4 py-2 mt-4 btn-scale-on-hover"
              style={{
                backgroundColor: "#007BFF",
                borderColor: "#007BFF",
                borderRadius: "6px",
                fontWeight: "500",
                minWidth: "190px",
              }}
            >
              {wasDoubleOptEmailSent ? "Resend Invite" : "Send Invite"}
            </BtnWithSpinner>
          </div>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default EmailNewsletterSignUp;
