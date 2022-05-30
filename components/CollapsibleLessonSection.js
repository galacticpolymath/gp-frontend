import PropTypes from 'prop-types';

import styles from './CollapsibleLessonSection.module.scss';

const CollapsibleSection = ({
  index,
  SectionTitle = '',
  className = '',
  children,
  initiallyExpanded = false,
}) => {
  const accordionId = SectionTitle.replace(/\s/gi, '_').toLowerCase();
  return (
    <div className={`accordion ${className} ${styles.CollapsibleLessonSection}`}>
      <div className="accordion-item">
        <h2 className="accordion-header" id={`heading_${accordionId}`}>
          <button
            className={`accordion-button ${initiallyExpanded ? '' : 'collapsed'}`}
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#content_${accordionId}`}
            aria-expanded="true"
            aria-controls="collapseOne"
          >
            <div className='container mx-auto text-black'>
              <h3 className='m-0'>{index && `${index}. `}{SectionTitle}</h3>
              {/* TODO: arrow */}
            </div>
          </button>
        </h2>
        <div
          id={`content_${accordionId}`}
          className={`accordion-collapse collapse ${initiallyExpanded ? 'show' : ''}`}
          aria-labelledby={`${accordionId}_content`}
          data-bs-parent="#accordionExample"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

CollapsibleSection.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.object,
  initiallyExpanded: PropTypes.bool,
};

export default CollapsibleSection;
