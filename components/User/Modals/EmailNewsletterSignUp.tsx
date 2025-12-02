import React from "react";
import { Modal, Button, CloseButton } from "react-bootstrap";
import Image from "next/image";
import { RiMailSendFill } from "react-icons/ri";
import Wave from "react-wavify";
import {
  TUserEmailNewLetterStatus,
  useModalContext,
} from "../../../providers/ModalProvider";

interface IJoinMailingListTitle {
  emailStatus: TUserEmailNewLetterStatus;
}

const JoinMailingListTitle: React.FC<IJoinMailingListTitle> = ({
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
  callToAction: string;
}

const USER_NOT_ON_MAILING_LIST_COPY_TXT: Record<
  TUserEmailNewLetterStatus,
  IUserNotOnMailingListCopyTxt
> = {
  "double-opt-sent": {
    intro: "You signed up for emails, but haven't confirmed your email.",
    callToAction:
      "To make sure you get all our latest updates and free stuff, check your spam for an email or click the button below to resend the invite.",
  },
  "not-on-list": {
    intro: "You're missing on our latest updates and free stuff!",
    callToAction: "To join our monthly newsletter, click the button below.",
  },
};

interface IUserNotOnMailingListCopyCompProps {
  userEmailNewsLetterStatus: TUserEmailNewLetterStatus;
}

const UserNotOnMailingListCopy: React.FC<
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

const EmailNewsletterSignUp: React.FC<EmailNewsletterSignUpProps> = ({
  show,
  onHide,
}) => {
  const {
    _emailNewsletterSignUpModal: [
      emailNewsletterSignUpModal,
      setEmailNewsletterSignUpModal,
    ],
  } = useModalContext();
  const { userEmailNewsLetterStatus } = emailNewsletterSignUpModal ?? {};
  const wasDoubleOptEmailSent = userEmailNewsLetterStatus === "double-opt-sent";

  const handleResendClick = () => {
    // Resend logic will go here
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="email-newsletter-modal"
    >
      {/* <Button
        variant="link"
        className="position-absolute text-dark"
        onClick={onHide}
        style={{
          top: "1rem",
          right: "1rem",
          fontSize: "1.5rem",
          textDecoration: "none",
          zIndex: 1002,
        }}
      >
        &times;
      </Button> */}
      <div className="position-relative">
        <CloseButton
          className="position-absolute"
          style={{
            top: "5px",
            right: "5px",
            zIndex: 1001,
          }}
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
                className="img-fluid"
              />
            </div>

            {/* <h2 className="mb-3 fw-bold">Oops!</h2> */}
            <JoinMailingListTitle
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
          <UserNotOnMailingListCopy userEmailNewsLetterStatus="not-on-list" />
          {/* <section className="w-100 d-flex justify-content-center align-items-center flex-column">
          <p
            style={{ textWrap: "pretty", maxWidth: "29em" }}
            className="mt-2 text-muted mb-0 text-center lh-lg"
          >
            You signed up for emails, but haven't confirmed your email.
          </p>
          <p
            style={{ textWrap: "pretty", maxWidth: "29em" }}
            className="text-muted mb-0 text-center lh-lg"
          >
            To make sure you get all our latest updates and free stuff, check
            your spam for an email or click here to resend.
          </p>
        </section> */}

          <Button
            onClick={handleResendClick}
            className="btn btn-primary px-4 py-2 mt-4 btn-scale-on-hover"
            style={{
              backgroundColor: "#007BFF",
              borderColor: "#007BFF",
              borderRadius: "6px",
              fontWeight: "500",
            }}
          >
            {wasDoubleOptEmailSent ? "Resend Invite" : "Send Invite"}
          </Button>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default EmailNewsletterSignUp;
