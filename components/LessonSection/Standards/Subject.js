/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import Accordion from '../../Accordion';
import StandardsGroup from './StandardsGroup';

const Subject = ({
  accordionId,
  sets,
  subject,
  initiallyExpanded,
}) => {
  const subjectSlug = subject.toLowerCase().replace(/\s/g, '');
  const subjectDimensions = sets[0].dimensions;
  let subjectSlugIds;

  if (subjectDimensions.length > 1) {
    subjectSlugIds = new Array(subjectDimensions.length).fill(subjectSlug).map((subjectSlugId, index) => `${subjectSlugId}-${index}`);
  }

  return (
    <Accordion
      id={accordionId}
      initiallyExpanded={initiallyExpanded}
      buttonClassName={`w-100 border-0 text-start bg-${subjectSlug} text-white`}
      button={(
        <h5 className='mb-0 p-2 d-flex justify-content-between align-items-center'>
          {subject} - {sets[0].name}
          <i className="fs-5 bi-chevron-down "></i>
          <i className="fs-5 bi-chevron-up"></i>
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
            <div className={`bg-${subjectSlug}-light p-2  mx-1 `} key={subjectDimIndex}>
              <p className='mb-1 p-1'><strong>Dimension:</strong> {name}</p>
              {standardsGroup.map((group, groupIndex) => (
                <StandardsGroup
                  id={`${subjectSlugIdName}-${groupIndex}`}
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
