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
}) => {
  const accordionId = SectionTitle.replace(/[\s!]/gi, '_').toLowerCase();
  return (
    <Accordion
      initiallyExpanded={initiallyExpanded}
      id={accordionId}
      className={className}
      highlighted={highlighted}
      buttonClassName="btn btn-light w-100 text-left"
      button={(
        <div className='container mx-auto text-black'>
          <h3 className='m-0'>{index && `${index}. `}{SectionTitle}</h3>
          TODO: arrow
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
};

export default CollapsibleLessonSection;
