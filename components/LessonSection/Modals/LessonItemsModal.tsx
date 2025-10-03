/* eslint-disable quotes */
/* eslint-disable indent */
import { Carousel } from "react-responsive-carousel";
import React, { useState } from "react";
import { Button, Modal, CloseButton } from "react-bootstrap";
import { useModalContext } from "../../../providers/ModalProvider";
import { TbDownload } from "react-icons/tb";
import { TbExternalLink } from "react-icons/tb";
import { useUserContext } from "../../../providers/UserProvider";
import { useLessonContext } from "../../../providers/LessonProvider";

interface ICarouselItemNavBtn {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  arrowType: "left" | "right";
}

const CarouselItemNavBtn: React.FC<ICarouselItemNavBtn> = ({
  onClick,
  arrowType,
}) => {
  return (
    <button onClick={onClick} className="btn bg-transparent m-0 p-1">
      <i
        className={`fs-1 text-black bi-arrow-${arrowType}-circle-fill lh-1 d-block`}
      ></i>
    </button>
  );
};

const LessonItemsModal: React.FC = () => {
  const { _lessonItemModal, _isGpPlusModalDisplayed } = useModalContext();
  const { _isGpPlusMember } = useUserContext();
  const { _selectedLessonItems } = useLessonContext();
  const [selectedLessonItems, setSelectedLessonItems] = _selectedLessonItems;
  const [lessonItemModal, setLessonItemModal] = _lessonItemModal;
  const [isGpPlusModalDisplayed, setIsGpPlusModalDisplayed] =
    _isGpPlusModalDisplayed;
  const [isGpPlusMember] = _isGpPlusMember;
  const iframeSrc =
    lessonItemModal.itemCat === "web resource"
      ? lessonItemModal.externalUrl
      : lessonItemModal.docUrl;
  const [test, setTest] = useState(
    Array.from({ length: 4 }).map(
      () =>
        "https://docs.google.com/presentation/d/1IUeirLBIrdqzX8s-UjPttbIn_GJfwxqBGbv9SVDvnTk/view"
    )
  );
  const [testIndex, setTestIndex] = useState(0);

  console.log("isGpPlusMember: ", isGpPlusMember);

  const getCarouselItemNavBtnClickHandler =
    (indexAdjustment: 1 | -1) => (event: React.MouseEvent) => {
      setTestIndex((state) => state + indexAdjustment);
      // setSelectedLessonItems(state => {
      //   if(!state){
      //     return state
      //   }
      //   return {
      //     ...state,
      //     index: state.index + in
      //   }
      // })
    };

  const LessonItemCarousel: React.FC = () => {
    return (
      <div className="shadow rounded p-0 display-flex flex-column justify-content-center carouselContainer w-100">
        <section className="row mt-0">
          <section style={{ height: "fit-content" }} className="col-12 mt-0">
            <div
              className="autoCarouselSlider mt-0"
              style={{ transform: `translate3d(${-testIndex * 100}%, 0, 0)` }}
            >
              {test?.length &&
                test.map((lessonDocument, index) => {
                  return (
                    <div
                      className="autoCarouselItem"
                      style={{
                        border:
                          index === 0 ? "solid 1px pink" : "solid 1px green",
                      }}
                    >
                      {/* <div className="mediaItemContainer"> */}
                      {index} {lessonDocument}
                      {/* </div> */}
                    </div>
                  );
                })}
            </div>
          </section>
        </section>
      </div>
    );
  };

  const handleDownloadPdfBtnClick = () => {
    if (lessonItemModal.mimeType === "pdf") {
      const url = new URL(lessonItemModal.gdriveRoot as string);
      const itemId = url.pathname.split("/").at(-1);

      if (!itemId) {
        alert("Unable to download pdf. Please refresh the page.");
        return;
      }

      window.open(`https://drive.google.com/uc?export=download&id=${itemId}`);
      return;
    }

    window.open(`${lessonItemModal.gdriveRoot}/export?format=pdf`);
  };
  const handleOpenInNewTabBtnClick = () => {
    window.open(iframeSrc);
  };
  const handleGpPlusBtnclick = () => {
    setIsGpPlusModalDisplayed(true);
  };
  const handleOfficeBtnClick = () => {
    window.open(
      `${lessonItemModal.gdriveRoot}/export?format=${lessonItemModal.mimeType}`
    );
  };
  const handleCloseBtnClick = () => {
    setLessonItemModal((state) => {
      return {
        ...state,
        isDisplayed: false,
      };
    });
  };

  return (
    <>
      <Modal
        onHide={handleCloseBtnClick}
        dialogClassName="border-0 selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center p-0"
        contentClassName="lesson-item-modal user-modal-color rounded-0 p-0 position-relative"
        show={lessonItemModal.isDisplayed}
        style={{
          margin: "0px",
          padding: "0px",
          zIndex: isGpPlusModalDisplayed ? 100 : 10000,
        }}
      >
        <CloseButton
          onClick={handleCloseBtnClick}
          className="lesson-item-modal-close"
          style={{ position: "absolute", width: "1rem", height: "1rem" }}
        />
        <section className="w-100 container-fluid px-0 m-0">
          <div
            style={{ backgroundColor: "#E2F0FD" }}
            className="w-100 h-100 row m-0 ps-0 pe-md-5 py-3"
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
                  className="d-flex flex-row-reverse flex-sm-row no-btn-styles px-3 py-2 get-gp-plus-btn"
                  onClick={handleGpPlusBtnclick}
                >
                  <section className="d-flex justify-content-center align-items-center h-100">
                    <img
                      src="/plus/plus.png"
                      alt="gp_plus_logo"
                      className="gp-plus-logo-btn ms-2 ms-sm-0 mt-sm-0 mt-1"
                    />
                  </section>
                  <section
                    style={{ height: "50px" }}
                    className="d-flex justify-content-center align-items-center ms-sm-2 me-sm-0 flex-column flex-sm-row"
                  >
                    <p className="mb-0 text-white d-none d-sm-block">
                      Get GP+ for editable files
                    </p>
                    <p className="mb-0 text-white d-block d-sm-none text-center">
                      Get
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
                {lessonItemModal.itemCat !== "web resource" && (
                  <section className="w-100 d-md-none d-flex justify-content-center align-items-center justify-content-sm-center align-items-sm-center">
                    <h6>Download as: </h6>
                  </section>
                )}
                <section className="w-100 d-flex justify-content-center align-items-center justify-content-md-end justify-content-sm-center align-items-sm-center">
                  {lessonItemModal.isExportable &&
                    isGpPlusMember &&
                    lessonItemModal.itemType !== "presentation" && (
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
                  {lessonItemModal.itemType !== "presentation" &&
                    lessonItemModal.isExportable && (
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
                          <p className="mb-0 text-black d-block d-md-none">
                            PDF
                          </p>
                        </section>
                      </Button>
                    )}
                  {lessonItemModal.itemType === "presentation" && (
                    <Button
                      style={{ backgroundColor: "white" }}
                      className="d-flex no-btn-styles px-2 px-sm-3 py-1 py-sm-2 me-sm-3 flex-column flex-sm-row"
                      onClick={handleOpenInNewTabBtnClick}
                    >
                      <section className="d-flex justify-content-center align-items-center h-100">
                        <TbExternalLink
                          className="gp-plus-btn-icons-lesson-item-modal"
                          style={{
                            color: "#4699CC",
                          }}
                        />
                      </section>
                      <section className="justify-content-center align-items-center ms-sm-2 d-flex py-2 py-sm-0">
                        <p className="mb-0 text-black">Open in New Tab</p>
                      </section>
                    </Button>
                  )}
                </section>
              </section>
            </section>
          </div>
        </section>
        <section
          style={{
            height: "85%",
          }}
          className="w-100 h-100"
        >
          <LessonItemCarousel />
        </section>
        <section className="d-flex justify-content-center align-items-center m-0">
          <button
            onClick={getCarouselItemNavBtnClickHandler(-1)}
            className={`noBtnStyles me-2 p-0 ${
              0 === testIndex ? "btn-disabled" : ""
            }`}
            disabled={testIndex === 0}
          >
            <i className="fs-1 text-black bi-arrow-left-circle-fill lh-1 d-block" />
          </button>
          <button
            onClick={getCarouselItemNavBtnClickHandler(1)}
            className={`noBtnStyles p-0 ${
              test?.length - 1 === testIndex ? "btn-disabled" : ""
            }`}
            disabled={test?.length - 1 === testIndex}
          >
            <i className="fs-1 text-black bi-arrow-right-circle-fill lh-1 d-block" />
          </button>
        </section>
      </Modal>
    </>
  );
};

export default LessonItemsModal;
