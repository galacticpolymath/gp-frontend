/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable semi */

import PropTypes from "prop-types";
import Accordion from "../../Accordion";
import RichText from "../../RichText";
import { useState } from "react";
import CopyableTxt from "../../CopyableTxt";
import ClickMeArrow from "../../ClickMeArrow";

const CopyIcon = ({ color = "white" }) => (
  <svg
    style={{ color }}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-copy"
    viewBox="0 0 16 16"
  >
    <path
      fillRule="evenodd"
      d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
    />
  </svg>
);

const formatGrades = (grades, gradesOrYears = "Grades") => {
  if (!grades) {
    return "";
  }

  const parsedGrades = (Array.isArray(grades) ? grades : grades.split(",")).map(
    (x) => x.replace(/^0/, "")
  );

  if (parsedGrades.length === 1) {
    return `${gradesOrYears.slice(0, -1)}: ${parsedGrades[0]}`;
  }

  return `${gradesOrYears}: ${parsedGrades[0]}-${
    parsedGrades[parsedGrades.length - 1]
  }`;
};

export const formatAlignmentNotes = (text) => {
  return text.replace(/•/g, "-").replace(/\^2/g, "²");
};

const StandardsGroup = (props) => {
  console.log("props, sup there, StandardsGroup: ", props);
  const {
    id,
    codes,
    grades,
    GradesOrYears,
    alignmentNotes,
    statements,
    willShowArrow,
    _arrowContainer,
    handleElementVisibility,
  } = props;
  const index = id.split("-").at(-1);
  const _grades = Array.isArray(grades) ? grades.join(",") : grades;
  const [contentId, setContentId] = useState("");
  const [isAccordionContentDisplayed, setIsAccordionContentDisplayed] =
    useState(false);
  const [arrowContainer, setArrowContainer] = _arrowContainer;
  const handleClickToCopyTxt = (event, txt) => {
    event.stopPropagation();
    navigator.clipboard.writeText(txt);
  };

  const handleOnClick = () => {
    setArrowContainer({ isInView: false, canTakeOffDom: true });
    setIsAccordionContentDisplayed((prevState) => !prevState);
  };

  return (
    <div className="border-bottom border-gray">
      <Accordion
        id={id}
        dataBsToggle={{}}
        setContentId={setContentId}
        buttonClassName="w-100 text-start bg-white border-0 p-2 pb-1 default-cursor pb-3 position-relative"
        button={
          <>
            <CopyableTxt
              copyTxtModalDefaultStyleObj={{
                position: "fixed",
                width: "110px",
                backgroundColor: "#212529",
                textAlign: "center",
                zIndex: 150,
              }}
              implementLogicOnClick={(event) =>
                handleClickToCopyTxt(event, `${codes}: ${statements}`)
              }
            >
              <div
                role="button"
                style={{
                  background: "#7F7F7F",
                  border: "none",
                  width: 32,
                  height: 32,
                  right: "5px",
                  top: "45px",
                }}
                className="d-flex justify-content-center align-items-center rounded-circle position-absolute"
              >
                <CopyIcon />
              </div>
            </CopyableTxt>
            <div>
              <div
                role="button"
                onClick={handleOnClick}
                data-bs-toggle="collapse"
                data-bs-target={`#content_${contentId}`}
              >
                <h6
                  className={`text-muted w-100 d-flex ${
                    (Array.isArray(grades) && grades.length > 0) ||
                    (typeof grades === "string" && grades.length > 0)
                      ? "justify-content-between"
                      : "justify-content-end"
                  }`}
                >
                  {formatGrades(_grades, GradesOrYears)}
                  <div className="d-flex justify-content-center flex-column h-100 position-relative">
                    {index == 0 && willShowArrow ? (
                      <ClickMeArrow
                        handleElementVisibility={handleElementVisibility}
                        willShowArrow={arrowContainer.isInView}
                        containerStyle={{
                          zIndex: 1000,
                          bottom: "70px",
                          right: "35px",
                          display: arrowContainer.canTakeOffDom
                            ? "none"
                            : "block",
                        }}
                        arrowTxt="Click for Details"
                      />
                    ) : null}
                    <i
                      color="#7A8489"
                      style={{
                        display: isAccordionContentDisplayed ? "none" : "block",
                      }}
                      className="fs-5 bi-chevron-down"
                    />
                    <i
                      color="#7A8489"
                      style={{
                        display: isAccordionContentDisplayed ? "block" : "none",
                      }}
                      className="fs-5 bi-chevron-up"
                    />
                  </div>
                </h6>
                {[].concat(codes).map((code, i) => {
                  const statement = [].concat(statements)[i];

                  return (
                    <div
                      className="mb-0 inline-block standards-txt-container"
                      key={i}
                    >
                      <strong>{code}:</strong>{" "}
                      <span className="statement-txt-testing">{statement}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        }
      >
        <div className="p-3 selected-standard mx-2">
          <h6 className="my-1 bold pb-1 mb-1">
            How does the lesson address this standard?
          </h6>
          <RichText
            className="alignment-notes-testing"
            content={alignmentNotes ? formatAlignmentNotes(alignmentNotes) : ""}
          />
        </div>
      </Accordion>
    </div>
  );
};

StandardsGroup.propTypes = {
  id: PropTypes.string.isRequired,
  grades: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  codes: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  statements: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  alignmentNotes: PropTypes.string,
};

export default StandardsGroup;
