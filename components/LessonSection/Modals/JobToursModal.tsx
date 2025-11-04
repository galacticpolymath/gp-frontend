/* eslint-disable quotes */

import React, { useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import useSiteSession from "../../../customHooks/useSiteSession";
import { TUseStateReturnVal } from "../../../types/global";
import { GpPlusBtn } from "../../../pages/gp-plus";

interface GpPlusModalProps {
  onClose?: () => void;
  userStatus?: ReturnType<typeof useSiteSession>["status"];
  _isModalDisplayed: TUseStateReturnVal<boolean>;
  url: string;
}

const ICON_COLOR = "#14B1EA";

interface IGpPlusAttribute {
  children: React.ReactNode;
  Icon: React.ReactNode;
}

const ListItem: React.FC<IGpPlusAttribute> = ({ children, Icon }) => {
  return (
    <li className="gp-plus-modal-benefit w-100 d-flex justify-content-center align-items-center">
      <div className="w-100 w-sm-90 w-md-75 justify-content-center align-items-center d-flex px-2">
        <section className="d-flex justify-content-center align-items-center flex-shrink-0">
          {Icon}
        </section>
        <section
          style={{ paddingTop: ".2em" }}
          className="d-flex justify-content-center align-items-center ps-1"
        >
          <span className="text-center text-sm-start">{children}</span>
        </section>
      </div>
    </li>
  );
};

const JobToursModal: React.FC<GpPlusModalProps> = ({
  _isModalDisplayed,
  url,
}) => {
  const [isModalDisplayed, setIsModalDisplayed] = _isModalDisplayed;
  const [isDoneLoading, setIsDoneLoading] = useState(false);

  const handleOnClose = () => {
    setIsModalDisplayed(false);
    setIsDoneLoading(false);
  };

  return (
    <Modal
      show={isModalDisplayed}
      onShow={() => {
        if (!isDoneLoading) {
          setTimeout(
            () => {
              setIsDoneLoading(true);
            },
            process.env.NEXT_PUBLIC_HOST === "localhost" ? 3100 : 1_200
          );
        }
      }}
      onHide={handleOnClose}
      size="lg"
      centered
      dialogClassName="modal-dialog-override d-flex justify-content-center align-items-center job-tours-modal-dialog"
      className="rounded"
      keyboard={false}
      style={{
        zIndex: 10000,
        width: "100vw",
      }}
      contentClassName="gp-plus-tours-modal"
    >
      <div className="gp-plus-modal-content h-100 d-flex flex-column">
        <div className="position-relative d-flex flex-column job-tours-iframe-container">
          <div
            className={`position-absolute bg-white w-100 h-100 rounded d-flex justify-content-center align-items-center ${
              isDoneLoading ? "d-none" : "d-block"
            }`}
          >
            <div className="position-relative bg-white w-100 h-100 rounded d-flex justify-content-center align-items-center">
              <div
                style={{ zIndex: 1000000 }}
                className="d-flex flex-column flex-sm-row justify-content-center align-items-center px-3"
              >
                <Spinner animation="border" variant="primary" color="black" />
                <span
                  className="ms-sm-2 mt-2 mt-sm-0 text-black text-center"
                  style={{ fontSize: "clamp(0.875rem, 3vw, 1rem)" }}
                >
                  Loading, please wait...
                </span>
              </div>
              <div
                style={{ filter: "blur(5px)" }}
                className="w-100 h-100 position-absolute shadow-lg"
              />
            </div>
          </div>
          <iframe
            src={url}
            className={`w-100 rounded ${
              isDoneLoading ? "opacity-100" : "opacity-0"
            }`}
            style={{
              height: "100%",
              transition: "all",
            }}
          />
        </div>
        <section className="mt-2 mt-sm-3 d-flex flex-column-reverse flex-lg-row justify-content-center align-items-stretch align-items-lg-center w-100 px-2 px-sm-3 job-tours-buttons-container flex-shrink-0">
          <Button
            style={{
              borderRadius: "1em",
              backgroundColor: "#6C757D",
              minHeight: "44px",
            }}
            onClick={() => {
              handleOnClose();
            }}
            className="me-lg-2 d-flex justify-content-center align-items-center border mt-2 mt-lg-0 w-100 w-lg-auto"
          >
            <span style={{ fontSize: "clamp(0.875rem, 3vw, 1rem)" }}>
              CLOSE
            </span>
          </Button>
          <GpPlusBtn
            onClick={() => {
              if (typeof window === "undefined") {
                return;
              }

              window.location.href = "/gp-plus";
            }}
            disabled={false}
            isLoading={false}
            className="ms-lg-2 px-3 py-2 w-100 w-lg-auto bg-white d-flex justify-content-center align-items-center"
            styles={{
              backgroundColor: "white",
              border: "solid 3px #2339C4",
              borderRadius: "1em",
              textTransform: "none",
              minHeight: "44px",
            }}
          >
            <span
              className="text-black text-center"
              style={{ fontSize: "clamp(0.75rem, 2.5vw, 1rem)" }}
            >
              Subscribe to create customizable <q>Job Tours</q>
            </span>
          </GpPlusBtn>
        </section>
      </div>
      <style>
        {`
          @media (max-width: 575px) {
            .job-tours-modal-dialog {
              margin: 0 !important;
              max-width: 100vw !important;
              height: 100vh !important;
              max-height: 100vh !important;
            }

            .gp-plus-tours-modal {
              margin: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              max-height: 100vh !important;
              border-radius: 0 !important;
            }

            .gp-plus-modal-content {
              padding: 1rem !important;
              height: 100vh !important;
              max-height: 100vh !important;
              display: flex !important;
              flex-direction: column !important;
            }

            .job-tours-iframe-container {
              flex: 1 1 auto !important;
              min-height: 0 !important;
              overflow: hidden !important;
              height: auto !important;
            }

            .job-tours-buttons-container {
              flex: 0 0 auto !important;
              padding-bottom: 0.5rem !important;
            }
          }

          @media (min-width: 576px) {
            .job-tours-iframe-container {
              height: 86% !important;
              min-height: 250px !important;
            }

            .job-tours-buttons-container {
              height: 14% !important;
              min-height: fit-content !important;
            }
          }
        `}
      </style>
    </Modal>
  );
};

export default JobToursModal;
