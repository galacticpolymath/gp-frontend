/* eslint-disable quotes */

import React, { useEffect, useRef, useState } from "react";
import { Button, Image, Modal, Spinner } from "react-bootstrap";
import { useModalContext } from "../../../providers/ModalProvider";
import { TbDownload } from "react-icons/tb";
import { useUserContext } from "../../../providers/UserProvider";

const GpPlusBanner: React.FC = () => {
  return (
    <div style={{ backgroundColor: "#F0F4FF" }} className="w-100 h-100"></div>
  );
};

const LessonItemModal: React.FC = () => {
  const { _lessonItemModal, _isGpPlusModalDisplayed } = useModalContext();
  const { _isGpPlusMember } = useUserContext();
  const [lessonItemModal, setLessonItemModal] = _lessonItemModal;
  const [isGpPlusModalDisplayed, setIsGpPlusModalDisplayed] =
    _isGpPlusModalDisplayed;
  let [isGpPlusMember] = _isGpPlusMember;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const handleDownloadPdfBtnClick = () => {
    window.open(`${lessonItemModal.gdriveRoot}/export?format=pdf`);
  };

  const handleGpPlusBtnclick = () => {
    setIsGpPlusModalDisplayed(true);
  };

  const handleOfficeBtnClick = () => {
    window.open(
      `${lessonItemModal.gdriveRoot}/export?format=${lessonItemModal.mimeType}`
    );
  };

  useEffect(() => {
    console.log("lessonItemModal: ", lessonItemModal);
  });

  return (
    <>
      <Modal
        onHide={() => {
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
          zIndex: isGpPlusModalDisplayed ? 100 : 10000,
        }}
      >
        <section className="w-100 container-fluid px-0 m-0">
          <div
            style={{ backgroundColor: "#E2F0FD" }}
            className="w-100 h-100 row m-0 px-0 py-3"
          >
            <section
              className={`${
                isGpPlusMember ? "col-3" : "col-6"
              } col-sm-6 col-md-3 col-xxl-6 d-flex ${
                isGpPlusMember
                  ? "justify-content-start align-items-center align-items-sm-stretch"
                  : "justify-content-start align-items-center ps-1"
              }`}
            >
              {isGpPlusMember ? (
                <img
                  src="/imgs/gp-logos/gp_submark.png"
                  alt="gp_plus_logo"
                  style={{
                    objectFit: "contain",
                  }}
                  className="gp-plus-logo-lesson-item-modal"
                />
              ) : (
                <Button
                  style={{ backgroundColor: "#1c28bd" }}
                  className="d-flex flex-row no-btn-styles px-3 py-2 get-gp-plus-btn"
                  onClick={handleGpPlusBtnclick}
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
                    <p className="mb-0 text-white d-none d-sm-block">
                      Get GP+ for editable files
                    </p>
                    <p className="mb-0 text-white d-block d-sm-none text-center">
                      Get GP+
                    </p>
                  </section>
                </Button>
              )}
            </section>
            <section
              className={` ${
                isGpPlusMember ? "col-9" : "col-6"
              } col-sm-6 col-md-9 col-xxl-6 d-flex flex-column flex-md-row justify-content-md-end justify-content-xxl-center align-items-center`}
            >
              <section className="w-100 d-flex flex-column justify-content-end flex-md-row justify-content-md-end justify-content-xxl-center align-items-stretch lesson-item-modal-btns-container">
                <section className="w-100 d-md-none d-flex justify-content-end align-items-end justify-content-sm-center align-items-sm-center">
                  <h6>Download as: </h6>
                </section>
                <section className="w-100 d-flex justify-content-end align-items-end justify-content-md-end justify-content-sm-center align-items-sm-center">
                  {isGpPlusMember && (
                    <Button
                      style={{ backgroundColor: "white" }}
                      className="d-flex no-btn-styles px-2 px-sm-3 py-1 py-sm-2 me-3 flex-column flex-sm-row"
                      onClick={handleOfficeBtnClick}
                    >
                      <section className="d-flex justify-content-center align-items-center h-100">
                        <img
                          src="/imgs/office.png"
                          className="gp-plus-btn-icons-lesson-item-modal"
                        />
                      </section>
                      <section className="justify-content-center align-items-center ms-sm-2 d-flex py-2 py-sm-0">
                        <p className="mb-0 text-black d-none d-md-block">
                          Download as Office
                        </p>
                        <p className="mb-0 text-black d-block d-md-none">
                          Office
                        </p>
                      </section>
                    </Button>
                  )}
                  <Button
                    style={{ backgroundColor: "white" }}
                    className="d-flex no-btn-styles px-2 px-sm-3 py-1 py-sm-2 me-sm-3 flex-column flex-sm-row"
                    onClick={handleDownloadPdfBtnClick}
                  >
                    <section className="d-flex justify-content-center align-items-center h-100">
                      <TbDownload
                        className="gp-plus-btn-icons-lesson-item-modal"
                        color="black"
                      />
                    </section>
                    <section className="justify-content-center align-items-center ms-sm-2 d-flex py-2 py-sm-0">
                      <p className="mb-0 text-black d-none d-md-block">
                        Download PDF
                      </p>
                      <p className="mb-0 text-black d-block d-md-none">PDF</p>
                    </section>
                  </Button>
                </section>
              </section>
            </section>
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
            allow="autoplay"
          />
        </section>
      </Modal>
    </>
  );
};

export default LessonItemModal;
