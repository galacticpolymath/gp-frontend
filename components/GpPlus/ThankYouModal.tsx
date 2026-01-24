 

import React from "react";
import { Button, Modal } from "react-bootstrap";
import Image from "next/image";
import Wave from "react-wavify";
import { FaCheckCircle, FaRocket, FaUsers } from "react-icons/fa";
import Link from "next/link";
import { useModalContext } from "../../providers/ModalProvider";

interface ThankYouModalProps {
  onClose?: () => void;
}

const ICON_COLOR = "#14B1EA";

const ThankYouModal: React.FC<ThankYouModalProps> = ({ onClose }) => {
  const { _isThankYouModalDisplayed } = useModalContext();
  const [isThankYouModalDisplayed, setIsThankYouModalDisplayed] =
    _isThankYouModalDisplayed;

  const handleOnClose = () => {
    if (onClose) {
      onClose();
    }

    setIsThankYouModalDisplayed(false);
  };

  return (
    <Modal
      show={isThankYouModalDisplayed}
      onHide={handleOnClose}
      size="lg"
      centered
      className="rounded"
      keyboard={false}
      style={{
        zIndex: 10000,
      }}
    >
      <div>
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
            className="position-absolute d-flex flex-column justify-content-center align-items-center"
          >
            <Image
              src="/imgs/gp-logos/gp_submark.png"
              alt="GP Plus Logo"
              width={110}
              height={110}
              style={{
                objectFit: "contain",
              }}
            />
            <h2 className="gp-plus-modal-title">Welcome to GP+!</h2>
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
      </div>
      <div className="gp-plus-modal-content">
        <p className="gp-plus-modal-description mt-4 mt-sm-0">
          Thank you for signing up to GP+! You now have access to our premium
          features and resources.
        </p>

        <ul className="d-flex flex-column jusitfy-content-center align-items-center list-unstyled">
          <li className="gp-plus-modal-benefit w-100 d-flex justify-content-center align-items-center">
            <div className="w-75 justify-content-center align-items-center d-flex">
              <section className="d-flex justify-content-center align-items-center">
                <FaCheckCircle color={ICON_COLOR} />
              </section>
              <section
                style={{ paddingTop: ".2em" }}
                className="ps-1 d-flex justify-content-center align-items-center"
              >
                <span className="text-center">
                  Access to 100+ premium STEM lessons
                </span>
              </section>
            </div>
          </li>
          <li className="gp-plus-modal-benefit w-100 d-flex justify-content-center align-items-center">
            <div className="w-75 justify-content-center align-items-center d-flex">
              <section className="d-flex justify-content-center align-items-center">
                <FaRocket color={ICON_COLOR} />
              </section>
              <section
                style={{ paddingTop: ".2em" }}
                className="ps-1 d-flex justify-content-center align-items-center"
              >
                <span>
                  Bulk lesson downloads for easy classroom preparation
                </span>
              </section>
            </div>
          </li>
        </ul>

        <section className="d-block d-sm-flex justify-content-sm-center align-items-sm-center w-100">
          <div className="no-link-decoration text-decoration-underline gp-plus-modal-cta px-1 py-2">
            <Button
              onClick={() => {
                window.location.href = window.location.origin;
                handleOnClose();
              }}
              style={{ borderRadius: "1em", backgroundColor: "#1c28bd" }}
              className="w-100 underline-on-hover"
            >
              Start Exploring Lessons
            </Button>
          </div>
        </section>
      </div>
    </Modal>
  );
};

export default ThankYouModal;
