/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import StandardsGroup from './StandardsGroup';
import ClickMeArrow from '../../ClickMeArrow';
import { useArrowContainer } from '../../../customHooks/useArrowContainer';

const Subject = ({
  accordionId,
  sets,
  subject,
  initiallyExpanded,
  areThereTargetStandards,
  handleSubjectAccordionBtnClick = () => {
    console.warn("Default function was executed for 'handleSubjectAccordionBtnClick.'");
  },
  handleSubjectElementVisibility = () => {

  },
  arrowContainer,
}) => {
  const { _arrowContainer: _arrowContainerForStandsElementVisibility, handleElementVisibility: handleStandardsElementVisibility } = useArrowContainer();
  const index = accordionId.split('-').at(-1);
  const subjectSlug = subject.toLowerCase().replace(/\s/g, '');
  const subjectDimensions = sets[0].dimensions;

  let subjectSlugIds;

  if (subjectDimensions.length > 1) {
    subjectSlugIds = new Array(subjectDimensions.length).fill(subjectSlug).map((subjectSlugId, index) => `${subjectSlugId}-${index}`);
  }

  console.log("yo there: ", subjectSlug);

  return (
    <Accordion
      id={accordionId}
      initiallyExpanded={initiallyExpanded}
      buttonClassName={`w-100 border-0 text-start bg-${subjectSlug} text-white`}
      button={(
        <h5 onClick={handleSubjectAccordionBtnClick} className='mb-0 p-2 d-flex justify-content-between align-items-center'>
          {subject} - {sets[0].name}
          <div className='position-relative'>
            {((index == 0) && !areThereTargetStandards) && (
              <ClickMeArrow
                handleElementVisibility={handleSubjectElementVisibility}
                willShowArrow={arrowContainer.isInView}
                containerStyle={{ zIndex: 1000, bottom: '70px', right: '35px', display: arrowContainer.canTakeOffDom ? 'none' : 'block' }}
                arrowTxt='Click to view Details'
              />
            )}
            <i className="fs-5 bi-chevron-down"></i>
            <i className="fs-5 bi-chevron-up"></i>
          </div>
        </h5>
      )}
    >
      <>
        {subjectDimensions.map(({ name, standardsGroup }, subjectDimIndex) => {
          let subjectSlugIdName = subjectSlug;

          if (subjectDimensions.length > 1) {
            subjectSlugIdName = subjectSlugIds[subjectDimIndex];
          }

          return (
            <div className={`bg-${subjectSlug}-light p-2  mx-1`} key={subjectDimIndex}>
              <p className='mb-1 p-1'><strong>Dimension:</strong> {name}</p>
              {standardsGroup.map((group, groupIndex) => (
                <StandardsGroup
                  id={`${subjectSlugIdName}-${groupIndex}`}
                  _arrowContainer={_arrowContainerForStandsElementVisibility}
                  handleElementVisibility={handleStandardsElementVisibility}
                  willShowArrow={subjectDimIndex == 0 && index == 0}
                  key={groupIndex}
                  {...group}
                />
              ))}
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
