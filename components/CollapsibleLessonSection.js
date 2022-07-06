import PropTypes from 'prop-types';

import Accordion from './Accordion';

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
      title={`${index && `${index}. `}${SectionTitle}`}
      className={className}
      highlighted={highlighted}
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
