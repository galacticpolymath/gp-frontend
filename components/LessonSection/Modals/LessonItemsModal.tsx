import React, { RefObject, useEffect, useRef, useState } from "react";
import { Button, Modal, CloseButton } from "react-bootstrap";
import { ILessonItem, useModalContext } from "../../../providers/ModalProvider";
import { TbDownload } from "react-icons/tb";
import { TbExternalLink } from "react-icons/tb";
import { useUserContext } from "../../../providers/UserProvider";
import { useLessonContext } from "../../../providers/LessonProvider";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import {
  Carousel,
  CarouselSlider,
  CarouselCard,
  CarouselButton,
} from "@fluentui/react-carousel";
import { CopyLessonBtnUI } from "../TeachIt/CopyLessonBtn";
import useSiteSession from "../../../customHooks/useSiteSession";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import Dropdown from "react-bootstrap/Dropdown";
import { GiFilmStrip } from "react-icons/gi";
import { IoOpenOutline } from "react-icons/io5";
import ReactMaterialCarousel from 'react-material-ui-carousel';
import { Paper, Button as MaterialUIBtn } from '@mui/material';
import { IItemV2 } from "../../../backend/models/Unit/types/teachingMaterials";
import { Carousel as ReactCarousel } from '@trendyol-js/react-carousel';
import ImageSlider from "../LessonItemsModalCarousel";

const NAV_BTN_DIMENSION = '40px';
export const EXTERNAL_LINK_HELPER_TXT = 'Open/Present';

function CustomCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <ReactCarousel show={1} slide={1}>
      <div key={0}>I am the first div.</div>
      <div key={1}>I am the second div.</div>
      <div key={2}>I am the third div.</div>
    </ReactCarousel>
  );
}


export const LESSON_ITEMS_MODAL_BG_COLOR = "#E2F0FD";

interface ILessonItemCard extends Pick<IItemV2, "itemCat"> {
  previewUrl: string;
  viewUrl: string;
  index: number;
}

function Item(props: any) {
  return (
    <Paper>
      <h2>{props.item.name}</h2>
      <p>{props.item.description}</p>

      <Button className="CheckButton">
        Check it out!
      </Button>
    </Paper>
  )
}

interface INavBtn {
  onClick: Function;
  className: string;
  style: React.CSSProperties;
  next: boolean;
  prev: boolean;
}

const NavBtn = ({ onClick, next, className, style, prev }: {
  onClick: Function;
  className: string;
  style: React.CSSProperties;
  next: boolean;
  prev: boolean;
}) => {
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => onClick()}
    >
      {next ? "Next" : "Previous"}
    </button>
  )
}

function Example() {
  var items = [
    {
      name: "Random Name #1",
      description: "Probably the most random thing you have ever seen!"
    },
    {
      name: "Random Name #2",
      description: "Hello World!"
    }
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  console.log(`Active index: ${activeIndex}`);

  return (
    <ReactMaterialCarousel
      animation="slide"
      index={activeIndex}
      // NextIcon={<MdKeyboardArrowRight />}
      // PrevIcon={<MdKeyboardArrowLeft />}
      // onChange={ }
      navButtonsAlwaysVisible
      NavButton={(props: INavBtn) => {
        return (
          <button
            onClick={() => {
              if (props.next) {
                setActiveIndex(activeIndex + 1);
              } else {
                setActiveIndex(activeIndex - 1);
              }
            }}
          >
            {props.next ? "Next" : "Previous"}
          </button>
        )
      }}
    >
      {
        items.map((item, i) => <Item key={i} item={item} />)
      }
    </ReactMaterialCarousel>
  )
}

const LessonItemCard: React.FC<ILessonItemCard> = ({
  previewUrl,
  viewUrl,
  index,
  itemCat
}) => {
  const [isMsgHidden, setIsMsgHidden] = useState(false);

  return (
    <div key={`image-${index}`} className="h-100 position-relative w-100">
      <div
        style={{
          zIndex: 10000,
          backgroundColor: LESSON_ITEMS_MODAL_BG_COLOR,
          height: "10vh",
          minHeight: "65px",
          maxHeight: "75px",
        }}
        className={`top-0 w-100 position-absolute ${isMsgHidden ? "d-none" : "d-block"
          } d-xl-none`}
      >
        <div className="w-100 h-100 px-2 py-1 position-relative d-flex justify-content-center align-items-center">
          <div style={{ maxWidth: "400px" }} className="position-relative">
            <Button
              style={{ top: "-5px" }}
              className="position-absolute end-0 no-btn-styles"
              onClick={() => {
                setIsMsgHidden(true);
              }}
            >
              <i
                className="fa fa-times text-black"
                aria-hidden="true"
                style={{ fontSize: "12px" }}
              />
            </Button>
            <div className="w-100 px-3 py-2 rounded bg-white justify-content-center align-items-center">
              <div className="d-flex">
                <div className="d-flex justify-content-center align-items-center">
                  <GiFilmStrip size={40} />
                </div>
                <span
                  style={{ fontSize: 14, lineHeight: 1.4 }}
                  className="ms-1"
                >
                  <b>Preview</b>. To view slide deck, open on a desktop.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {itemCat === "presentation" ?
        <>
          <div className="w-100 h-100 position-relative d-none d-xl-block">
            <iframe src={viewUrl} className="w-100 h-100" />
          </div>
          <div className="w-100 h-100 position-relative d-xl-none d-block">
            <iframe src={previewUrl} className="w-100 h-100" />
          </div>
        </>
        :
        <div className="w-100 h-100 position-relative d-xl-none d-block">
          <iframe src={previewUrl} className="w-100 h-100" />
        </div>
      }
    </div>
  );
};

const LessonItemDownloadBtnsDropDown: React.FC<{
  lessonItem: ILessonItem;
  isGpPlusMember: boolean;
}> = ({ lessonItem, isGpPlusMember }) => {
  const handleOfficeBtnClick = () => {
    window.open(
      `${lessonItem.gdriveRoot}/export?format=${lessonItem.mimeType}`
    );
  };

  const handleDownloadPdfBtnClick = () => {
    if (lessonItem.mimeType === "pdf") {
      const url = new URL(lessonItem.gdriveRoot as string);
      const itemId = url.pathname.split("/").at(-1);

      if (!itemId) {
        alert("Unable to download pdf. Please refresh the page.");
        return;
      }

      window.open(`https://drive.google.com/uc?export=download&id=${itemId}`);
      return;
    }

    window.open(`${lessonItem.gdriveRoot}/export?format=pdf`);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="success"
        id="dropdown-basic"
        style={{
          fontSize: "18px",
        }}
        className="gp-plus-user-color"
      >
        Download as:
      </Dropdown.Toggle>

      <Dropdown.Menu className="w-100">
        {isGpPlusMember && (
          <Dropdown.Item
            href="#"
            className="d-flex justify-content-center align-items-center"
          >
            <Button
              onClick={handleOfficeBtnClick}
              className="d-flex no-btn-styles flex-row justify-content-center align-items-center"
            >
              <div
                style={{ width: 44, height: 44 }}
                className="bg-white p-1 rounded position-relative"
              >
                <Image
                  alt="office"
                  fill
                  src="/imgs/office.png"
                  className="w-100 h-100 position-absolute"
                  style={{
                    maxWidth: "35px",
                    maxHeight: "35px",
                    objectFit: "contain",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>
              <section className="d-flex justify-content-center align-items-center ms-2">
                <div
                  style={{ height: "fit-content" }}
                  className="mb-0 text-black text-decoration-underline lessons-item-modal-btns-text-container"
                >
                  Office
                </div>
              </section>
            </Button>
          </Dropdown.Item>
        )}
        <Dropdown.Item
          href="#"
          className="d-flex justify-content-center align-items-center"
        >
          <Button
            onClick={handleDownloadPdfBtnClick}
            className="d-flex no-btn-styles flex-row justify-content-center align-items-center"
          >
            <div
              style={{ width: 44, height: 44 }}
              className="bg-white p-1 rounded"
            >
              <TbDownload color="black" size={35} />
            </div>
            <section className="d-flex justify-content-center align-items-center ms-2">
              <div
                style={{ height: "fit-content" }}
                className="mb-0 text-black text-decoration-underline lessons-item-modal-btns-text-container"
              >
                PDF
              </div>
            </section>
          </Button>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

const LessonItemsModal: React.FC = () => {
  const { _lessonItemModal, _isGpPlusModalDisplayed } = useModalContext();
  const { _isGpPlusMember } = useUserContext();
  const { _idsOfLessonsBeingCopied } = useLessonContext();
  const { gdriveAccessToken } = useSiteSession();
  const [idsOfLessonsBeingCopied] = _idsOfLessonsBeingCopied;
  const [lessonItemModal, setLessonItemModal] = _lessonItemModal;
  const rightArrownRef = useRef<HTMLButtonElement>(null);
  const leftArrownRef = useRef<HTMLButtonElement>(null);
  const [isGpPlusModalDisplayed, setIsGpPlusModalDisplayed] =
    _isGpPlusModalDisplayed;
  const [isGpPlusMember] = _isGpPlusMember;
  const {
    currentIndex,
    lessonItems,
    isDisplayed,
    copyLessonBtnRef,
    lessonId,
    userGDriveLessonFolderId,
  } = lessonItemModal;

  const createOnNavLessonItemsClickHandler = (indexChange: -1 | 1) => () => {
    // the user is at the start and clicks on the prev button
    if (indexChange === -1 && currentIndex === 0) {
      setLessonItemModal(state => {
        return {
          ...state,
          currentIndex: lessonItems.length - 1
        }
      });
      return;
    }

    // the user is at the end and clicks on the next button
    if (indexChange === 1 && currentIndex === (lessonItems.length - 1)) {
      setLessonItemModal(state => {
        return {
          ...state,
          currentIndex: 0
        }
      });
      return;
    }

    setLessonItemModal(state => {
      return {
        ...state,
        currentIndex: currentIndex + indexChange
      }
    });
  }

  console.log("lessonItems, hey there; ", lessonItems);

  const currentLessonItem = lessonItems[currentIndex] ?? {};
  console.log("currentLessonItem: ", currentLessonItem);
  const {
    docUrl: currentLessonItemDocUrl,
    itemTitle: currentLessonItemName,
    itemCat,
    itemType,
    externalUrl,
  } = currentLessonItem;

  const handleDownloadPdfBtnClick = () => {
    if (currentLessonItem.mimeType === "pdf") {
      const url = new URL(currentLessonItem.gdriveRoot as string);
      const itemId = url.pathname.split("/").at(-1);

      if (!itemId) {
        alert("Unable to download pdf. Please refresh the page.");
        return;
      }

      window.open(`https://drive.google.com/uc?export=download&id=${itemId}`);
      return;
    }

    window.open(`${currentLessonItem.gdriveRoot}/export?format=pdf`);
  };

  const handleOpenInNewTabBtnClick = () => {
    const url =
      itemCat === "web resource" ? externalUrl : currentLessonItemDocUrl;

    window.open(url);
  };

  const handleGpPlusBtnclick = () => {
    setIsGpPlusModalDisplayed(true);
  };

  const handleOfficeBtnClick = () => {
    window.open(
      `${currentLessonItem.gdriveRoot}/export?format=${currentLessonItem.mimeType}`
    );
  };

  const handlePlayBtnClick = () => {
    window.open(`${currentLessonItem.gdriveRoot}/present`);
  };

  const handleCloseBtnClick = () => {
    setLessonItemModal((state) => {
      return {
        ...state,
        isDisplayed: false,
      };
    });
  };

  const handleCarouselNavBtnClick = (navDirection: "left" | "right") => () => {
    if (navDirection === "right") {
      rightArrownRef.current?.click();
      return;
    }

    leftArrownRef.current?.click();
  };

  const handleCopyLessonBtnClick = () => {
    copyLessonBtnRef?.current?.click();
  };

  const rightBtnRef = useRef<HTMLButtonElement | null>(null);
  const leftBtnRef = useRef<HTMLButtonElement | null>(null);

  const handleKeyDown = (event: KeyboardEvent) => {
    console.log("Key pressed: ", event.key);

    if (event.key === "ArrowRight") {
      console.log("Pressed right arrow key");
      rightBtnRef?.current?.click();
    }

    if (event.key === "ArrowLeft") {
      console.log("Pressed left arrow key");
      leftBtnRef?.current?.click();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    console.log("current lesson item: ", currentLessonItem);
  });

  return (
    <>
      <Modal
        onHide={handleCloseBtnClick}
        backdrop={false}
        dialogClassName="border-0 selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center p-0"
        contentClassName="lesson-item-modal user-modal-color rounded-0 p-0 position-relative"
        show={isDisplayed}
        style={{
          margin: "0px",
          padding: "0px",
          zIndex: 1000,
        }}
      >
        <CloseButton
          onClick={handleCloseBtnClick}
          className={
            isGpPlusMember
              ? "lesson-item-modal-close"
              : "lesson-item-modal-close-web-resource"
          }
          style={{ position: "absolute", width: "1rem", height: "1rem" }}
        />
        <section className="w-100 container-fluid px-0 m-0">
          <div
            style={{ backgroundColor: "#E2F0FD" }}
            className="w-100 h-100 row m-0 ps-0 pe-md-5 py-3 d-flex flex-column flex-sm-row"
          >
            <section
              className={`${isGpPlusMember
                ? "col-12 col-sm-5 col-xxl-3"
                : "col-sm-6 col-md-3 col-xxl-6"
                } d-flex ${isGpPlusMember
                  ? "justify-content-end justify-content-sm-start align-items-stretch"
                  : "justify-content-start align-items-center ps-sm-1"
                }`}
            >
              {isGpPlusMember ? (
                <CopyLessonBtnUI
                  btnRef={null}
                  btnClassName="p-2 py-sm-2 px-md-3 col-12"
                  isLoading={idsOfLessonsBeingCopied.has(lessonId!)}
                  disabled={idsOfLessonsBeingCopied.has(lessonId!)}
                  isCopyingLesson={idsOfLessonsBeingCopied.has(lessonId!)}
                  isGpPlusMember={isGpPlusMember}
                  gdriveAccessToken={gdriveAccessToken}
                  onClick={handleCopyLessonBtnClick}
                  btnWrapperClassName="d-flex justify-content-center align-items-center"
                  childrenClassName="d-flex flex-row flex-md-row align-items-center justify-content-center gap-2"
                  btnStyles={{
                    minHeight: "51px",
                    backgroundColor: "white",
                    border: "solid 3px #2339C4",
                    borderRadius: "2em",
                    textTransform: "none",
                  }}
                >
                  <div
                    style={{ lineHeight: "23px", fontSize: "18px" }}
                    className="d-flex flex-column text-black"
                  >
                    {isGpPlusMember && !gdriveAccessToken && (
                      <>
                        <p className="p-0 m-0 d-none d-md-block">
                          Authenticate w/ Google Drive & Copy lesson
                        </p>
                        <div className="p-0 m-0 d-block d-md-none">
                          Sign in w/ <FcGoogle /> Drive & Copy lesson
                        </div>
                      </>
                    )}
                    {isGpPlusMember &&
                      gdriveAccessToken &&
                      (userGDriveLessonFolderId
                        ? "Bulk copy to my Google Drive again"
                        : "Bulk copy to my Google Drive")}
                    {!isGpPlusMember && (
                      <>Subscribe to copy this lesson to your Google Drive</>
                    )}
                  </div>
                </CopyLessonBtnUI>
              ) : (
                <Button
                  style={{
                    backgroundColor: "#1c28bd",
                    height: "fit-content",
                    width: "50vw",
                  }}
                  className="d-flex justify-content-center align-items-center flex-row-reverse flex-sm-row no-btn-styles px-3 col-9 py-sm-3 py-lg-2 get-gp-plus-btn"
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
              className={` ${isGpPlusMember
                ? "col-12 col-sm-7 col-xxl-9"
                : "col-12 col-sm-6 col-md-9 col-xxl-6 p-0"
                } ${isGpPlusMember ? 'd-flex flex-column flex-md-row' : 'd-flex flex-column flex-lg-row'} ${isGpPlusMember ? 'justify-content-md-end align-items-sm-center' : 'justify-content-md-end align-items-sm-end'} p-sm-0`}
            >
              <section className={`h-100 ${isGpPlusMember ? 'd-flex flex-column flex-md-row' : 'd-flex flex-column flex-lg-row pt-sm-2 pt-md-0 pe-sm-5 pe-md-0'}`}>
                {itemType === "presentation" && (
                  <section className={`d-none d-sm-flex h-100 ${isGpPlusMember ? 'pe-md-3 align-items-sm-center justify-content-sm-center align-items-md-stretch justify-content-md-end' : 'justify-content-center align-items-center justify-content-lg-start align-items-lg-stretch'}`}>
                    <Button
                      style={{
                        backgroundColor: "transparent",
                        transition: "background-color inifinte",
                        width: "fit-content",
                      }}
                      className="mb-1 mb-md-0 d-flex no-btn-styles justify-content-center align-items-center text-black pointer"
                      onClick={handleOpenInNewTabBtnClick}
                    >
                      <section className="w-100 d-none d-sm-flex h-100 pt-1">
                        <h6
                          style={{
                            height: "fit-content",
                            textTransform: "none",
                          }}
                          className="mb-0 text-black d-flex d-md-block justify-content-center align-items-center h-100 text-nowrap me-2"
                        >
                          <span className="d-none d-lg-block underline-on-hover">
                            {EXTERNAL_LINK_HELPER_TXT}:
                          </span>
                          <span className="d-block d-lg-none">New Tab:</span>
                        </h6>
                      </section>
                      <section className="w-100 d-none d-sm-flex h-100">
                        <div
                          style={{ width: 44, height: 44 }}
                          className="bg-white p-1 rounded"
                        >
                          <IoOpenOutline color="black" size={35} />
                        </div>
                      </section>
                    </Button>
                  </section>
                )}
                <section className={`h-100 d-flex flex-column flex-md-row ${isGpPlusMember ? 'justify-content-end align-items-stretch' : 'mt-sm-2 mt-lg-0 justify-content-lg-end align-items-lg-stretch'}`}>
                  {currentLessonItem.itemCat !== "web resource" &&
                    currentLessonItem.isExportable && (
                      <section className={`w-100 d-none d-sm-flex pt-sm-1 ${isGpPlusMember ? 'justify-content-center justify-content-md-end' : 'justify-content-center align-items-center align-items-lg-stretch justify-content-lg-end ms-lg-3'}`}>
                        <h6>Download as: </h6>
                      </section>
                    )}
                  <section
                    className={`d-flex flex-row flex-md-column ${isGpPlusMember
                      ? "justify-content-end align-items-sm-stretch justify-content-sm-center align-items-sm-center"
                      : "justify-content-sm-start ms-2 align-items-sm-stretch"
                      } lessons-item-modal-download mt-3 mt-sm-0`}
                  >
                    {currentLessonItem.isExportable && (
                      <div className="d-flex d-sm-none">
                        {currentLessonItem.itemCat === "presentation" && (
                          <section className="d-flex justify-content-center align-items-center">
                            <button
                              style={{ height: "60px" }}
                              onClick={handleOpenInNewTabBtnClick}
                              className="py-2 px-3 bg-white rounded-2 no-btn-styles me-2"
                            >
                              <TbExternalLink size={35} />
                            </button>
                          </section>
                        )}
                        <section className="d-flex justify-content-center align-items-center">
                          <LessonItemDownloadBtnsDropDown
                            lessonItem={currentLessonItem}
                            isGpPlusMember={isGpPlusMember}
                          />
                        </section>
                      </div>
                    )}
                    {currentLessonItem.isExportable && isGpPlusMember && (
                      <div className="d-none d-sm-block">
                        <Button
                          style={{
                            backgroundColor: "transparent",
                            transition: "background-color inifinte",
                          }}
                          className="d-flex no-btn-styles flex-row justify-content-center align-items-center"
                          onClick={handleOfficeBtnClick}
                        >
                          <div
                            style={{ width: 44, height: 44 }}
                            className="bg-white p-1 rounded position-relative"
                          >
                            <Image
                              alt="office"
                              fill
                              src="/imgs/office.png"
                              className="w-100 h-100 position-absolute"
                              style={{
                                maxWidth: "35px",
                                maxHeight: "35px",
                                objectFit: "contain",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                              }}
                            />
                          </div>
                          <section className="d-flex justify-content-center align-items-center ms-2">
                            <div
                              style={{ height: "fit-content" }}
                              className="mb-0 text-black text-decoration-underline lessons-item-modal-btns-text-container"
                            >
                              Office
                            </div>
                          </section>
                        </Button>
                      </div>
                    )}
                    {currentLessonItem.isExportable && (
                      <div className={`${isGpPlusMember ? "ms-2 mt-md-2 ms-md-0 d-none d-sm-flex" : "d-none d-sm-flex w-100 justify-content-center align-items-center justify-content-lg-start align-items-lg-stretch"}`}>
                        <Button
                          style={{
                            backgroundColor: "transparent",
                            transition: "background-color inifinte",
                          }}
                          className={`d-flex no-btn-styles flex-row ${isGpPlusMember ? 'justify-content-center align-items-center' : ''}`}
                          onClick={handleDownloadPdfBtnClick}
                        >
                          <div
                            style={{ width: 44, height: 44 }}
                            className="bg-white p-1 rounded"
                          >
                            <TbDownload color="black" size={35} />
                          </div>
                          <section className={`d-flex justify-content-center align-items-center ${isGpPlusMember ? 'ms-2' : 'ms-2 ms-md-0'}`} >
                            <div
                              style={{ height: "fit-content" }}
                              className="mb-0 text-black text-decoration-underline lessons-item-modal-btns-text-container"
                            >
                              PDF
                            </div>
                          </section>
                        </Button>
                      </div>
                    )}
                    {currentLessonItem.itemCat === "web resource" && (
                      <Button
                        style={{
                          backgroundColor: "white",
                          width: "95%",
                          maxWidth: "405px",
                        }}
                        className="d-flex no-btn-styles flex-row justify-content-center align-items-center ms-1 ms-sm-0 ps-sm-2 pe-sm-2 py-1"
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
                          <p className="mb-0 text-black">{EXTERNAL_LINK_HELPER_TXT}</p>
                        </section>
                      </Button>
                    )}
                  </section>
                </section>
              </section>
            </section>
          </div>
        </section>
        {/* <ReactCarousel
          show={1}
          slide={1}
          rightArrow={<button style={{ zIndex: -9999 }} className="position-fixed opacity-0" onClick={createOnNavLessonItemsClickHandler(1)} ref={rightArrownRef} />}
          leftArrow={<button style={{ zIndex: -9999 }} className="position-fixed opacity-0" ref={leftArrownRef} onClick={createOnNavLessonItemsClickHandler(-1)} />}
        >
          {lessonItems.map((lessonItem, index) => {
            const url =
              lessonItem.itemCat === "web resource"
                ? lessonItem.externalUrl
                : lessonItem.docUrl;

            if (lessonItem.itemType === "presentation") {
              const viewUrl = `${lessonItem.gdriveRoot}/view`;
              const previewUrl = `${lessonItem.gdriveRoot}/preview`;

              return (
                <LessonItemCard
                  key={index}
                  index={index}
                  previewUrl={previewUrl}
                  viewUrl={viewUrl}
                  itemCat={lessonItem.itemCat}
                />
              );
            }

            return (
              <div key={`image-${index}`} className="h-100 w-100">
                <div className="w-100 h-100 position-relative">
                  <iframe src={url} className="w-100 h-100" />
                </div>
              </div>
            );
          })}
        </ReactCarousel> */}
        <div style={{ height: '72%' }} className="">
          <ImageSlider items={lessonItems} currentIndex={currentIndex} />
        </div>
        <div
          style={{ backgroundColor: LESSON_ITEMS_MODAL_BG_COLOR }}
          className="px-2 pt-2 px-sm-0 d-flex justify-content-center align-items-center flex-row w-100"
        >
          <button
            ref={leftBtnRef}
            onClick={createOnNavLessonItemsClickHandler(-1)}
            style={{
              width: NAV_BTN_DIMENSION,
              height: NAV_BTN_DIMENSION,
            }}
            className="nav-btn-lesson-items-modal nav-btn-lesson-items-modal me-1 no-btn-styles rounded-circle d-flex justify-content-center align-items-center" name="prev"
          >
            <FaChevronLeft />
          </button>
          <div
            style={{
              minWidth: "60vw",
              maxWidth: "550px"
            }}
            className="h-100 p-0 col-10"
          >
            <div
              style={{ borderRadius: ".2em" }}
              className="h-100 d-flex justify-content-center align-items-center flex-column border border-2 px-1 px-sm-2 py-1"
            >
              <div className="text-black fw-normal text-center">
                {currentLessonItemName}
              </div>
              <div>
                {currentIndex + 1}/{lessonItems.length}
              </div>
            </div>
          </div>
          <button
            ref={rightBtnRef}
            style={{
              width: NAV_BTN_DIMENSION,
              height: NAV_BTN_DIMENSION,
            }}
            className="nav-btn-lesson-items-modal nav-btn-lesson-items-modal ms-1 no-btn-styles rounded-circle d-flex justify-content-center align-items-center"
            onClick={createOnNavLessonItemsClickHandler(1)}
            name="next"
          >
            <FaChevronRight />
          </button>
        </div>
      </Modal>
    </>
  );
};

export default LessonItemsModal;
