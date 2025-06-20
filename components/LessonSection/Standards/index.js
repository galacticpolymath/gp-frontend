/* eslint-disable no-console */
/* eslint-disable quotes */

import PropTypes from 'prop-types';
import Subject from './Subject';
import { useArrowContainer } from '../../../customHooks/useArrowContainer';

const Standards = ({
  Data,
  GradesOrYears,
}) => {
  const areThereTargetStandards = Data?.some(({ target }) => target);
  const { _arrowContainer, handleElementVisibility } = useArrowContainer();
  const [arrowContainer, setArrowContainer] = _arrowContainer;

  const handleSubjectAccordionBtnClick = () => {
    setArrowContainer({ isInView: false, canTakeOffDom: true });
  };

  return (
    <div className='container mb-4 px-0'>
      {/* if there are no target standards, then show the arrow for the first section for the connected standars */}
      <h4 className='fs-5 fw-bold mt-2 mb-1'><i className="bi bi-bullseye me-2" />Target Standard(s)</h4>
      <div className="mb-3">
        Skills and concepts directly taught or reinforced by this lesson
      </div>
      {Data.filter(({ target }) => target).map((subject, i) => (
        <Subject
          initiallyExpanded
          GradesOrYears={GradesOrYears}
          key={`target-${i}`}
          areThereTargetStandards={areThereTargetStandards}
          handleSubjectAccordionBtnClick={arrowContainer.canTakeOffDom ? null : handleSubjectAccordionBtnClick}
          handleSubjectElementVisibility={handleElementVisibility}
          arrowContainer={arrowContainer}
          accordionId={`target-${i}`}
          {...subject}
        />
      ))}

      <h4 className='fs-5 fw-bold mt-4 mb-1'><i className="bi bi-diagram-3-fill me-2"></i>Connected Standard(s)</h4>
      <div className="mb-3">
        Skills and concepts reviewed or hinted at in this lesson (for building upon)
      </div>
      {Data.filter(({ target }) => !target).map((subject, i) => (
        <Subject
          key={`connected-${i}`}
          accordionId={`connected-${i}`}
          handleSubjectAccordionBtnClick={arrowContainer.canTakeOffDom ? null : handleSubjectAccordionBtnClick}
          areThereTargetStandards={areThereTargetStandards}
          handleSubjectElementVisibility={handleElementVisibility}
          arrowContainer={arrowContainer}
          {...subject}
        />
      ))}
    </div>
  );
};

Standards.propTypes = {
  Data: PropTypes.array,
  LearningObj: PropTypes.string,
};

export default Standards;