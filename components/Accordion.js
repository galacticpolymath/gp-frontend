/* eslint-disable quotes */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
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
  btnStyle = {},
  willUseGetId = true,
  accordionChildrenClasses = '',
  highlighted,
  setContentId,
  dataBsToggle = { 'data-bs-toggle': 'collapse' },
  handleOnClick,
  isExpandability = true,
  ariaExpanded = 'true',
}) => {
  const contentId = useRef();

  if (isExpandability) {
    dataBsToggle = {
      'data-bs-toggle': 'collapse',
      'data-bs-target': `#content_${willUseGetId ? contentId?.current : id}`,
    };
  } else {
    dataBsToggle = {};
  }

  useEffect(() => {
    if (!contentId.current && willUseGetId) {
      contentId.current = getId();
      if (setContentId) {
        setContentId(contentId.current);
      }
    }
  }, []);

  return (
    <div className={className}>
      <div
        style={style}
        className={`accordion-header lessonsPgSec ${highlighted ? 'highlighted' : ''}`}
        id={`heading_${id}`}
      >
        <div>
          <div>
            <button
              className={`${initiallyExpanded ? '' : 'collapsed'} ${buttonClassName}`}
              type="button"
              style={btnStyle}
              {...dataBsToggle}
              aria-expanded={ariaExpanded}
              aria-controls="collapseOne"
              onClick={handleOnClick}
            >
              {button}
            </button>
          </div>
        </div>
      </div>
      <div
        id={`content_${willUseGetId ? contentId?.current : id}`}
        className={`collapse ${accordionChildrenClasses || ''} ${initiallyExpanded ? 'show' : ''}`}
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
