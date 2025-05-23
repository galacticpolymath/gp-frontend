/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-console */
import PropTypes from "prop-types";
import Accordion from "../../Accordion";
import StandardsGroup from "./StandardsGroup";
import ClickMeArrow from "../../ClickMeArrow";
import { useArrowContainer } from "../../../customHooks/useArrowContainer";

const Subject = ({
  accordionId,
  sets,
  subject,
  GradesOrYears,
  initiallyExpanded,
  areThereTargetStandards,
  handleSubjectAccordionBtnClick = () => {
    console.warn(
      "Default function was executed for 'handleSubjectAccordionBtnClick.'"
    );
  },
  handleSubjectElementVisibility = () => { },
  arrowContainer,
}) => {
  const {
    _arrowContainer: _arrowContainerForStandsElementVisibility,
    handleElementVisibility: handleStandardsElementVisibility,
  } = useArrowContainer();
  const index = accordionId.split("-").at(-1);
  const subjectSlug = subject.toLowerCase().replace(/\s/g, "");
  const subjectDimensions = sets[0].dimensions;
  let subjectSlugIds;

  if (subjectDimensions.length > 1) {
    subjectSlugIds = new Array(subjectDimensions.length)
      .fill(subjectSlug)
      .map((subjectSlug, index) => `${subjectSlug}-${index}`);
  }

  return (
    <Accordion
      id={accordionId}
      initiallyExpanded={initiallyExpanded}
      buttonClassName={`w-100 border-0 text-start bg-${subjectSlug} text-white`}
      button={(
        <h5
          onClick={handleSubjectAccordionBtnClick}
          className="mb-0 p-2 d-flex justify-content-between align-items-center"
        >
          <span className="subject-header-testing">
            {subject} - {sets[0].name}
          </span>
          <div className="position-relative">
            {index == 0 && !areThereTargetStandards && (
              <ClickMeArrow
                handleElementVisibility={handleSubjectElementVisibility}
                willShowArrow={arrowContainer.isInView}
                containerStyle={{
                  zIndex: 1000,
                  bottom: "70px",
                  right: "35px",
                  display: arrowContainer.canTakeOffDom ? "none" : "block",
                }}
                arrowTxt="Click to view Details"
              />
            )}
            <i className="fs-5 bi-chevron-down"></i>
            <i className="fs-5 bi-chevron-up"></i>
          </div>
        </h5>
      )}
    >
      <>
        {subjectDimensions.map((subjectDimension, subjectDimIndex) => {
          const { name, standardsGroup, slug } = subjectDimension;
          let subjectSlugIdName = subjectSlug;

          if (subjectDimensions.length > 1) {
            subjectSlugIdName = subjectSlugIds[subjectDimIndex];
          }

          return (
            <div
              className={`bg-${subjectSlug}-light p-2  mx-1`}
              key={subjectDimIndex}
            >
              <p id={slug} className="mb-1 p-1">
                <strong>Dimension:</strong>
                <span className="subject-name ms-1">
                  {name ?? ""}
                </span>
              </p>
              {standardsGroup.map((group, groupIndex) => {
                const id = `${subjectSlugIdName}-${groupIndex}`;

                return (
                  <StandardsGroup
                    id={id}
                    GradesOrYears={GradesOrYears}
                    _arrowContainer={_arrowContainerForStandsElementVisibility}
                    handleElementVisibility={handleStandardsElementVisibility}
                    willShowArrow={subjectDimIndex == 0 && index == 0}
                    key={groupIndex}
                    {...group}
                  />
                );
              })}
            </div>
          );
        })}
      </>
    </Accordion>
  );
};

Subject.propTypes = {
  accordionId: PropTypes.string.isRequired,
  sets: PropTypes.array,
  subject: PropTypes.string,
  initiallyExpanded: PropTypes.bool,
};

export default Subject;
