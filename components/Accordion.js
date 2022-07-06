import PropTypes from 'prop-types';

const Accordion = ({
  id,
  className = '',
  buttonClassName = '',
  children,
  initiallyExpanded = false,
  button,
}) => {
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
