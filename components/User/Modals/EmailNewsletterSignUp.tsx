import React from "react";
import { Modal, Button } from "react-bootstrap";
import Image from "next/image";
import { RiMailSendFill } from "react-icons/ri";

const JoinMailingListTitle: React.FC = () => {
  return (
    <h2 className="d-flex bold mb-3 text-center w-100 bg-danger justify-content-center align-items-center">
      <RiMailSendFill />
      Join Our Mailing List!
    </h2>
  );
};

interface EmailNewsletterSignUpProps {
  show: boolean;
  onHide?: () => void;
}

const EmailNewsletterSignUp: React.FC<EmailNewsletterSignUpProps> = ({
  show,
  onHide,
}) => {
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
      <Modal.Body className="text-center p-4">
        <div className="d-flex justify-content-center mb-3">
          <Image
            src="/GP_bubbleLogo300px.png"
            alt="Galactic Polymath Logo"
            width={120}
            height={120}
            className="img-fluid"
          />
        </div>

        {/* <h2 className="mb-3 fw-bold">Oops!</h2> */}
        <JoinMailingListTitle />

        <section className="w-100 d-flex justify-content-center align-items-center flex-column">
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
        </section>

        <Button
          onClick={handleResendClick}
          className="btn btn-primary px-4 py-2 mt-3"
          style={{
            backgroundColor: "#007BFF",
            borderColor: "#007BFF",
            borderRadius: "6px",
            fontWeight: "500",
          }}
        >
          Resend
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default EmailNewsletterSignUp;
