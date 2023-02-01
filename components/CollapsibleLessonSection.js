import PropTypes from 'prop-types';

import Accordion from './Accordion';

/**
 * A styled collapsible section of the Lesson Plan.
 */
const CollapsibleLessonSection = ({
  index,
  SectionTitle = '',
  className = '',
  children,
  highlighted = false,
  initiallyExpanded = false,
  accordionId,
}) => {
  return (
    <Accordion
      initiallyExpanded={initiallyExpanded}
      id={(accordionId || SectionTitle).replace(/[\s!]/gi, '_').toLowerCase()}
      className={className}
      highlighted={highlighted}
      buttonClassName="btn btn-light w-100 text-left"
      button={(
<<<<<<< HEAD
        <div className='container mx-auto text-black'>
          <h3 className='m-0'>{index && `${index}. `}{SectionTitle}</h3>
          TODO: arrow
=======
        <div className='container mx-auto text-black d-flex justify-content-between align-items-center py-1'>
          <h2 className='m-0'>{index && `${index}. `}{SectionTitle}</h2>
          <i className="fs-3 bi-chevron-down"></i>
          <i className="fs-3 bi-chevron-up"></i>
>>>>>>> bf807621cd1a77d5445a0afec08cb852c8064a70
        </div>
      )}
    >
      {children}
    </Accordion>
  );
};

CollapsibleLessonSection.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.object,
  highlighted: PropTypes.bool,
  initiallyExpanded: PropTypes.bool,
  accordionId: PropTypes.string,
};

export default CollapsibleLessonSection;
