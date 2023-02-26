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
  initiallyExpanded = false,
  accordionId,
}) => {
  return (
    <Accordion
      initiallyExpanded={initiallyExpanded}
      id={(accordionId || SectionTitle).replace(/[\s!]/gi, '_').toLowerCase()}
      className={className}
      buttonClassName="btn btn-primary-light w-100 text-left"
      button={(
        <div className='container mx-auto text-black d-flex justify-content-between align-items-center py-1'>
          <h2 className='m-0'>{index && `${index}. `}{SectionTitle}</h2>
          <i className="fs-3 bi-chevron-down"></i>
          <i className="fs-3 bi-chevron-up"></i>
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
  initiallyExpanded: PropTypes.bool,
  accordionId: PropTypes.string,
};

export default CollapsibleLessonSection;
