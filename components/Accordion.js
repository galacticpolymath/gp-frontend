/* eslint-disable quotes */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import { useRef } from 'react';

const getId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = (Math.random() * 16) | 0;
    const value = character === "x" ? random : (random & 0x3) | 0x8;

    return value.toString(16);
  });
};

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
  style = {},
}) => {

  const contentId = useRef(getId());  

  return (
    <div style={style} className={className}>
      <div className="accordion-header lessonsPgSec" id={`heading_${id}`}>
        <div>
          <div>
            <button
              className={`${initiallyExpanded ? '' : 'collapsed'} ${buttonClassName}`}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#content_${contentId?.current}`}
              aria-expanded="true"
              aria-controls="collapseOne"
            >
              {button}
            </button>
          </div>
        </div>
      </div>
      <div
        id={`content_${contentId?.current}`}
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
