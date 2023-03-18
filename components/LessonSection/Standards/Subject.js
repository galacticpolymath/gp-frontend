/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
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
    subjectSlugIds = new Array(subjectDimensions.length).fill(subject).map((subject, index) => `${subjectSlug}-${index}`);
  }

  // WHAT IS HAPPENING: 
  // when sets[0].dimensions has a length greater than 1, then if the first section is opened, every first section is opened as well because they all have the same id
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
        {subjectDimensions.map(({ name, standardsGroup }, i) => (
          <div className={`bg-${subjectSlug}-light p-2`} key={i}>
            <p className='mb-1 p-1'><strong>Dimension:</strong> {name}</p>
            {standardsGroup.map((group, i) => (
              <StandardsGroup
                id={`${subjectSlug}-${i}`}
                key={i}
                {...group}
              />
            ))}
          </div>
        ))}
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
