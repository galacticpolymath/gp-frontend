import React, { useEffect, useRef, useState } from "react";
import { Button, Image, Modal, Spinner } from "react-bootstrap";
import { useModalContext } from "../../../providers/ModalProvider";
import Iframe from "react-iframe";
import { has } from "cypress/types/lodash";

const GpPlusBanner: React.FC = () => {
  return (
    <div style={{ backgroundColor: "#F0F4FF" }} className="w-100 h-100"></div>
  );
};

const LessonItemModal: React.FC = () => {
  const { _lessonItemModal } = useModalContext();
  const [lessonItemModal, setLessonItemModal] = _lessonItemModal;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [willDisplayLoadingUI, setWillLoadingUI] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  return (
    <Modal
      onHide={() => {
        setTimeout(() => {
          setHasLoaded(false);
        }, 200);
        setLessonItemModal((state) => {
          return {
            ...state,
            isDisplayed: false,
          };
        });
      }}
      dialogClassName="border-0 selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center p-0"
      contentClassName="lesson-item-modal user-modal-color rounded-0 p-0 position-relative"
      show={lessonItemModal.isDisplayed}
      style={{
        margin: "0px",
        padding: "0px",
      }}
    >
      {!hasLoaded && (
        <div
          style={{ zIndex: 1000 }}
          className={`w-100 h-100 bg-white flex-column position-absolute`}
        >
          <div className="w-100 h-100 d-flex justify-content-center align-items-center flex-column">
            <h6 style={{ fontSize: "1.5rem" }} className="fw-bold">
              Loading, please wait...
            </h6>
            <Spinner className="mt-2" />
          </div>
        </div>
      )}
      <section
        style={{ height: "15%" }}
        className="w-100 container-fluid p-0 m-0"
      >
        <div
          style={{ backgroundColor: "#E2F0FD" }}
          className="w-100 h-100 row m-0 p-0"
        >
          <section className="col-6 d-flex justify-content-center align-items-center">
            <Button
              style={{ backgroundColor: "#1c28bd" }}
              className="d-flex no-btn-styles px-3 py-2"
            >
              <section className="d-flex justify-content-center align-items-center h-100">
                <Image
                  src="/plus/plus.png"
                  alt="gp_plus_logo"
                  width={50}
                  height={50}
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "contain",
                  }}
                />
              </section>
              <section
                style={{ height: "50px" }}
                className="d-flex justify-content-center align-items-center ms-2"
              >
                <p className="mb-0 text-white">
                  Get GP+ for editable files
                </p>
              </section>
            </Button>
          </section>
          <section className="col-6"></section>
        </div>
      </section>
      <section style={{ height: "85%" }} className="w-100">
        <iframe
          ref={iframeRef}
          loading="lazy"
          src={lessonItemModal.docUrl as string}
          width="100%"
          height="100%"
          style={{
            width: "100%",
            height: "100%",
          }}
          onLoad={() => {
            setHasLoaded(true);
          }}
          allow="autoplay"
        />
      </section>
    </Modal>
  );
};

export default LessonItemModal;
