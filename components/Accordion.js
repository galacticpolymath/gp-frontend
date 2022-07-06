import PropTypes from 'prop-types';

import styles from './Accordion.module.scss';

const Accordion = ({
  id,
  title = '',
  className = '',
  children,
  highlighted = false,
  initiallyExpanded = false,
}) => {
  return (
    <div className={`accordion ${className} ${styles.Accordion}`}>
      <div className="accordion-item">
        <h2 className="accordion-header" id={`heading_${id}`}>
          <button
            className={`accordion-button ${initiallyExpanded ? '' : 'collapsed'} ${highlighted ? styles.highlighted : ''}`}
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#content_${id}`}
            aria-expanded="true"
            aria-controls="collapseOne"
          >
            <div className='container mx-auto text-black'>
              <h3 className='m-0'>{title}</h3>
              TODO: arrow
            </div>
          </button>
        </h2>
        <div
          id={`content_${id}`}
          className={`accordion-collapse collapse ${initiallyExpanded ? 'show' : ''}`}
          aria-labelledby={`${id}_content`}
          data-bs-parent="#accordionExample"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

Accordion.propTypes = {
  id: PropTypes.string.isRequired,
  SectionTitle: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.object,
  highlighted: PropTypes.bool,
  initiallyExpanded: PropTypes.bool,
};

export default Accordion;
