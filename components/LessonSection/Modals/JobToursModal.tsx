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
  unitName: string;
  jobTitles: string[];
}

const JobToursModal: React.FC<GpPlusModalProps> = ({
  _isModalDisplayed,
  url,
  unitName,
  jobTitles,
}) => {
  const [isModalDisplayed, setIsModalDisplayed] = _isModalDisplayed;
  const [isDoneLoading, setIsDoneLoading] = useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

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
          <section id="job-tours-section" className="container py-5">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h3 className="mb-4">
                  Jobs and careers related to the &ldquo;{unitName}&rdquo; unit:
                </h3>
                <ul
                  className="mb-4 d-none d-sm-block"
                  style={{ columnCount: 2, columnGap: "1.3rem" }}
                >
                  {jobTitles.map((jobTitle, index) => {
                    return <li key={index}>{jobTitle}</li>;
                  })}
                </ul>
                <ul className="mb-4 d-block d-sm-none">
                  {jobTitles.map((jobTitle, index) => {
                    return <li key={index}>{jobTitle}</li>;
                  })}
                </ul>
                <div className="d-flex align-items-start">
                  <div className="me-3 mt-1" style={{ fontSize: "2rem" }}>
                    ✏️
                  </div>
                  <div>
                    <p className="mb-2">
                      <strong>Assignment:</strong> Research these jobs and
                      explain <em>with data</em> which you would be most or
                      least interested in.
                    </p>
                    <p
                      className="text-muted mb-3"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Your teacher will provide instructions on how to share
                      your response.
                    </p>
                    <div
                      className="alert alert-info py-2 px-3 mb-0"
                      role="alert"
                      style={{ fontSize: "0.85rem" }}
                    >
                      ℹ️ <strong>Note:</strong> This feature is currently being
                      built and will be available soon.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <section className="mt-2 mt-sm-3 d-flex flex-column-reverse flex-lg-row justify-content-center align-items-center align-items-lg-center w-100 px-2 px-sm-3 job-tours-buttons-container flex-shrink-0">
          <Button
            style={{
              borderRadius: "1em",
              backgroundColor: "#6C757D",
              paddingLeft: "1rem",
              paddingRight: "1rem",
            }}
            onClick={() => {
              handleOnClose();
            }}
            className="job-viz-btn job-viz-btn-close me-lg-2 d-flex justify-content-center align-items-center border mt-2 mt-lg-0 w-100 w-lg-auto"
          >
            <span style={{ fontSize: "0.875rem" }}>CLOSE</span>
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
            className="job-viz-btn job-viz-btn-subscribe ms-lg-2 w-100 w-lg-auto bg-white d-flex justify-content-center align-items-center"
            styles={{
              backgroundColor: "white",
              border: "solid 3px #2339C4",
              borderRadius: "1em",
              textTransform: "none",
              paddingLeft: "1rem",
              paddingRight: "1rem",
            }}
          >
            <span
              className="text-black text-center"
              style={{ fontSize: "0.875rem" }}
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

            .job-viz-btn {
              max-width: none !important;
              height: auto !important;
              min-height: auto !important;
              max-height: none !important;
              padding: 0.75rem 1rem !important;
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

            .job-viz-btn {
              height: 49px !important;
              min-height: 49px !important;
              max-height: 49px !important;
            }

            .job-viz-btn-close {
              max-width: 150px !important;
            }

            .job-viz-btn-subscribe {
              max-width: 420px !important;
            }
          }
        `}
      </style>
    </Modal>
  );
};

export default JobToursModal;
