import PropTypes from 'prop-types';

import Accordion from './Accordion';

const CollapsibleLessonSection = ({
  index,
  SectionTitle = '',
  className = '',
  children,
  initiallyExpanded = false,
}) => {
  const accordionId = SectionTitle.replace(/[\s!]/gi, '_').toLowerCase();
  return (
    <Accordion
      initiallyExpanded={initiallyExpanded}
      id={accordionId}
      title={`${index && `${index}. `}${SectionTitle}`}
      className={className}
      buttonClassName='accordion-button'
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
};

export default CollapsibleLessonSection;
