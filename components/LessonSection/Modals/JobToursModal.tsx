import React, { useMemo, useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import useSiteSession from "../../../customHooks/useSiteSession";
import { TUseStateReturnVal } from "../../../types/global";
import { GpPlusBtn } from "../../../pages/gp-plus";
import { useModalContext } from "../../../providers/ModalProvider";
import { useRouter } from "next/navigation";
import {
  SOC_CODES_PARAM_NAME,
  UNIT_NAME_PARAM_NAME,
} from "../JobVizConnections";

interface GpPlusModalProps {
  onClose?: () => void;
  userStatus?: ReturnType<typeof useSiteSession>["status"];
  _isModalDisplayed: TUseStateReturnVal<boolean>;
  url: string;
  unitName: string;
  jobTitleAndSocCodePairs: [string, string][];
}

const SOC_CODES_FOR_JOB_TOURS_DEMO = [
  "11-9121",
  "29-2033",
  "15-2051",
  "15-1243",
  "29-1211",
  "29-1071",
  "15-2011",
  "23-1012",
].join(",");
const JOBS_TOURS_DEMO_UNIT_NAME =
  "Demo Unit Showcasing a Diversity of Lesser Known Careers";

const JobToursModal: React.FC<GpPlusModalProps> = ({ _isModalDisplayed }) => {
  const {
    _jobToursModalCssProps: [jobToursModalCssProps, setJobToursModalCssProps],
  } = useModalContext();
  const [isModalDisplayed, setIsModalDisplayed] = _isModalDisplayed;
  const [isDoneLoading, setIsDoneLoading] = useState(false);
  const [isMouseOverDemoGif, setIsMouseOverDemoGif] = useState(false);
  const router = useRouter();

  const createDemoGifMouseEventHandler = (isMouseOver: boolean) => () => {
    setIsMouseOverDemoGif(isMouseOver);
  };

  const handleOnClose = () => {
    setIsModalDisplayed(false);
    setIsDoneLoading(false);
  };

  const handleInteractiveDemoBtnClick = () => {
    router.push(
      `/jobviz?${SOC_CODES_PARAM_NAME}=${SOC_CODES_FOR_JOB_TOURS_DEMO}&${UNIT_NAME_PARAM_NAME}=${JOBS_TOURS_DEMO_UNIT_NAME}`
    );
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
        ...jobToursModalCssProps,
        width: "100vw",
      }}
      contentClassName="gp-plus-tours-modal"
    >
      <div className="gp-plus-modal-content h-100 d-flex flex-column">
        <h2 className="job-tours-title text-center">Job Tours Demo</h2>
        <div className="position-relative d-flex flex-column job-tours-iframe-container">
          {isMouseOverDemoGif && (
            <span
              className="demo-overlay-text no-btn-styles"
              style={{ textTransform: "none" }}
            >
              Click to view <i>Interactive Demo Career Tour Assignment</i>
            </span>
          )}
          <img
            src="/imgs/jobViz/jobviz_demo.gif"
            alt="Job Viz Demo"
            onClick={handleInteractiveDemoBtnClick}
            onMouseOver={createDemoGifMouseEventHandler(true)}
            onMouseLeave={createDemoGifMouseEventHandler(false)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
        <section className="mt-2 mt-sm-3 w-100 px-2 px-sm-3 job-tours-buttons-container flex-shrink-0">
          <section className="d-flex justify-content-center align-items-center mt-2">
            <Button
              style={{
                borderRadius: "1em",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                maxWidth: "500px",
                width: "fit-content",
              }}
              onClick={handleInteractiveDemoBtnClick}
              className="d-flex justify-content-center align-items-center border mt-2 mt-lg-0"
            >
              <span style={{ fontSize: "0.875rem" }}>
                Interactive Demo Career Tour Assignment
              </span>
            </Button>
          </section>
          <section className="mt-3 d-flex flex-column-reverse flex-lg-row justify-content-center align-items-center align-items-lg-center">
            <Button
              style={{
                borderRadius: "1em",
                backgroundColor: "#6C757D",
                paddingLeft: "1rem",
                paddingRight: "1rem",
              }}
              onClick={handleOnClose}
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
                Subscribe to GP+ to share this Career Tour
              </span>
            </GpPlusBtn>
          </section>
        </section>
      </div>
      <style>
        {`
          .job-tours-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 1rem;
            flex-shrink: 0;
          }

          .demo-overlay-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.85);
            color: #ffffff;
            padding: 1.25rem 1.75rem;
            border-radius: 0.5rem;
            font-size: 1.125rem;
            font-weight: 500;
            text-align: center;
            z-index: 10;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(4px);
            transition: opacity 0.2s ease-in-out;
            max-width: 90%;
            line-height: 1.5;
          }

          .demo-overlay-text i {
            font-style: italic;
            // color: #ffd700;
          }

          .job-tours-iframe-container {
            cursor: pointer;
          }

          .job-tours-iframe-container img {
            border-radius: 0.5rem;
            transition: filter 0.2s ease-in-out;
          }

          .job-tours-iframe-container:hover img {
            filter: brightness(0.7);
          }

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

            .job-tours-title {
              font-size: 1.1rem;
              margin-bottom: 0.75rem;
            }

            .job-tours-iframe-container {
              flex: 1 1 auto !important;
              min-height: 0 !important;
              overflow: hidden !important;
              height: auto !important;
            }

            .job-tours-iframe-container img {
              border-radius: 0.5rem;
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

            .demo-overlay-text {
              font-size: 0.875rem;
              padding: 0.875rem 1.25rem;
            }
          }

          @media (min-width: 576px) and (max-width: 767px) {
            .job-tours-title {
              font-size: 1.35rem;
              margin-bottom: 1rem;
            }

            .job-tours-iframe-container {
              height: 80% !important;
              min-height: 250px !important;
            }

            .job-tours-iframe-container img {
              border-radius: 0.75rem;
            }

            .job-tours-buttons-container {
              height: auto !important;
              min-height: fit-content !important;
            }

            .job-viz-btn {
              height: 45px !important;
              min-height: 45px !important;
              max-height: 45px !important;
            }

            .job-viz-btn-close {
              max-width: 150px !important;
            }

            .job-viz-btn-subscribe {
              max-width: 100% !important;
            }

            .demo-overlay-text {
              font-size: 1rem;
              padding: 1rem 1.5rem;
            }
          }

          @media (min-width: 768px) and (max-width: 991px) {
            .job-tours-title {
              font-size: 1.5rem;
              margin-bottom: 1.25rem;
            }

            .job-tours-iframe-container {
              height: 82% !important;
              min-height: 300px !important;
            }

            .job-tours-iframe-container img {
              border-radius: 1rem;
            }

            .job-tours-buttons-container {
              height: auto !important;
              min-height: fit-content !important;
            }

            .job-viz-btn {
              height: 48px !important;
              min-height: 48px !important;
              max-height: 48px !important;
            }

            .job-viz-btn-close {
              max-width: 150px !important;
            }

            .job-viz-btn-subscribe {
              max-width: 380px !important;
            }
          }

          @media (min-width: 992px) {
            .job-tours-title {
              font-size: 1.75rem;
              margin-bottom: 1.5rem;
            }

            .job-tours-iframe-container {
              height: 73% !important;
              min-height: 350px !important;
            }

            .job-tours-iframe-container img {
              border-radius: 1rem;
            }

            .job-tours-buttons-container {
              height: auto !important;
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
