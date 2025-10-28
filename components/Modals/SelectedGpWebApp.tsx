/* eslint-disable quotes */
 
/* eslint-disable indent */
 
import Modal from "react-bootstrap/Modal";
import { GiCancel } from "react-icons/gi";
import Button from "../General/Button";
import { useEffect, useState } from "react";
import CustomLink from "../CustomLink";
import ForLessonTxt from "../LessonsPg/ForLessonTxt";
import ForLessonTxtWrapper from "../LessonsPg/ForLessonTxtWrapper";
import { UNITS_URL_PATH } from "../../shared/constants";
import { TUseStateReturnVal } from "../../types/global";
import { TWebAppForUI } from "../../backend/models/WebApp";

const { Title } = Modal;

interface IProps {
  _selectedGpWebApp: TUseStateReturnVal<TWebAppForUI | null>;
  _isModalShown: TUseStateReturnVal<boolean>;
}

const SelectedGpWebApp = ({ _selectedGpWebApp, _isModalShown }: IProps) => {
  const [isModalShown, setIsModalShown] = _isModalShown;
  const [isOverImg, setIsOverImg] = useState(false);
  const [selectedGpWebApp, setSelectedGpWebApp] = _selectedGpWebApp;

  const handleOnHide = () => {
    setIsModalShown(false);
  };

  const handleOnMouseOver = () => {
    setIsOverImg(true);
  };

  const handleOnMouseLeave = () => {
    setIsOverImg(false);
  };

  useEffect(() => {
    if (!isModalShown) {
      setTimeout(() => {
        setSelectedGpWebApp(null);
      }, 250);
    }
  }, [isModalShown]);

  useEffect(() => {
    const handleEscKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleOnHide();
      }
    };

    return () => {
      window.removeEventListener("keyup", handleEscKeyPress);
    };
  }, []);

  return (
    <Modal
      show={isModalShown}
      onHide={handleOnHide}
      dialogClassName="selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center"
      contentClassName="selected-gp-web-app-content"
    >
      <div className="modal-content-wrapper-gp-web-app">
        <div className="modal-content-sub-wrapper-gp-web-app position-relative">
          <div
            className="d-flex justify-content-end pe-1"
            style={{ height: "28px", paddingBottom: "1.8em" }}
          >
            <Button
              handleOnClick={handleOnHide}
              classNameStr="no-btn-styles close-gp-vid-modal-btn"
            >
              <GiCancel color="grey" className="close-gp-video-modal-icon" />
            </Button>
          </div>
          <div
            className="position-relative web-app-img-container w-100"
            onMouseOver={handleOnMouseOver}
            onMouseLeave={handleOnMouseLeave}
          >
            <div className="position-relative h-100">
              <img
                src={selectedGpWebApp?.pathToFile ?? ""}
                alt="Image of GP web-app."
                style={{ objectFit: "contain" }}
                className="h-100 w-100 position-absolute"
              />
              {isOverImg && (
                <div className="h-100 w-100 position-relative d-flex justify-content-center align-items-center">
                  <CustomLink
                    hrefStr={selectedGpWebApp?.webAppLink}
                    className="no-link-decoration w-100 h-100 position-absolute pointer d-flex justify-content-center align-items-center"
                    color="white"
                    targetLinkStr="_blank"
                    fontSize={24}
                    style={{ backgroundColor: "black", opacity: 0.4 }}
                  />
                  <CustomLink
                    hrefStr={selectedGpWebApp?.webAppLink}
                    style={{
                      width: "fit-content",
                      zIndex: 100,
                      textDecorationColor: "white",
                      color: "white",
                    }}
                    className="mt-2 no-link-decoration txt-underline-on-hover-white"
                    color="#75757D"
                    targetLinkStr="_blank"
                  >
                    <span
                      className="text-white"
                      style={{ textDecorationColor: "white" }}
                    >
                      Open in new window
                    </span>
                  </CustomLink>
                </div>
              )}
            </div>
          </div>
          <div
            style={{ borderTop: "solid 1.5px rgb(222, 226, 230)" }}
            className="px-3 px-sm-5 pt-3 d-flex flex-column pb-5 position-relative"
          >
            <Title id="selected-gp-web-app-modal-title">
              {selectedGpWebApp?.title}
            </Title>
            <span className="mt-2">{selectedGpWebApp?.description}</span>
            <CustomLink
              hrefStr={selectedGpWebApp?.webAppLink}
              style={{ width: "fit-content" }}
              className="mt-2 no-link-decoration underline-on-hover"
              color="#75757D"
              targetLinkStr="_blank"
            >
              Open in new window
            </CustomLink>
            {selectedGpWebApp?.aboutWebAppLinkType === "unit" &&
              selectedGpWebApp?.lessonIdStr &&
              selectedGpWebApp?.unitTitle && (
                <CustomLink
                  style={{ width: "fit-content" }}
                  hrefStr={`/${UNITS_URL_PATH}/en-US/${selectedGpWebApp?.unitNumID}`}
                  className="mt-2 no-link-decoration underline-on-hover d-flex"
                  color="#75757D"
                >
                  <ForLessonTxtWrapper>
                    <ForLessonTxt
                      lessonNumId={selectedGpWebApp?.lessonIdStr}
                      unitTitle={selectedGpWebApp?.unitTitle}
                    />
                  </ForLessonTxtWrapper>
                </CustomLink>
              )}
            {selectedGpWebApp?.aboutWebAppLinkType === "blog" &&
              selectedGpWebApp?.blogPostTitle && (
                <span
                  style={{ color: "#75757D", whiteSpace: "nowrap" }}
                  className="mt-2"
                >
                  View blog post:&nbsp;
                  <CustomLink
                    style={{ width: "fit-content", color: "#75757D" }}
                    hrefStr={selectedGpWebApp.aboutWebAppLink ?? "#"}
                    targetLinkStr="_blank"
                    className="d-inline mt-2 no-link-decoration underline-on-hover"
                  >
                    <em>{selectedGpWebApp.blogPostTitle}</em>
                  </CustomLink>
                </span>
              )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SelectedGpWebApp;
