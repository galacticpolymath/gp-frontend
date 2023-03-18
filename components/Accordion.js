/* eslint-disable quotes */
/* eslint-disable no-console */
import PropTypes from 'prop-types';

/**
 * An unstyled collapsible panel with internal open/close state.
 */
const Accordion = ({
  id,
  className = '',
  buttonClassName = '',
  children,
  initiallyExpanded = false,
  button,
}) => {
  console.log('id hey there', id);
  return (
    <div className={className}>
      <div className="accordion-header" id={`heading_${id}`}>
        <button
          className={`${initiallyExpanded ? '' : 'collapsed'} ${buttonClassName}`}
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#content_${id}`}
          aria-expanded="true"
          aria-controls="collapseOne"
        >
          {button}
        </button>
      </div>
      <div
        id={`content_${id}`}
        className={`collapse ${initiallyExpanded ? 'show' : ''}`}
        aria-labelledby={`${id}_content`}
        data-bs-parent="#accordionExample"
      >
        {children}
        {/* <span className='bg-danger'>hi</span> */}
      </div>
    </div>
  );
};

Accordion.propTypes = {
  id: PropTypes.string.isRequired,
  button: PropTypes.element.isRequired,
  className: PropTypes.string,
  buttonClassName: PropTypes.string,
  children: PropTypes.object,
  initiallyExpanded: PropTypes.bool,
};

export default Accordion;
