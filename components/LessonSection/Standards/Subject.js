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
        {sets[0].dimensions.map(({ name, standardsGroup }, i) => (
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
