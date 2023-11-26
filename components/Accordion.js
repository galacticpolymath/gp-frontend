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
  _accordionContentId,
  dataBsToggle = { 'data-bs-toggle': 'collapse' },
  handleOnClick = () => { },
}) => {
  const contentId = useRef();
  const accordionContentId = (_accordionContentId === undefined) ? (willUseGetId ? contentId?.current : id) : _accordionContentId;

  useEffect(() => {
    if (!contentId.current && willUseGetId) {
      contentId.current = getId();
      if (setContentId) {
        setContentId(contentId.current);
      }
    }
  }, []);

  return (
    <div style={style} className={className}>
      <div className={`accordion-header lessonsPgSec ${highlighted ? 'highlighted' : ''}`} id={`heading_${id}`}>
        <div>
          <div>
            <button
              className={` ${initiallyExpanded ? '' : 'collapsed'} ${buttonClassName}`}
              type="button"
              style={btnStyle}
              {...dataBsToggle}
              data-bs-target={`#content_${willUseGetId ? contentId?.current : id}`}
              aria-expanded="true"
              aria-controls="collapseOne"
              onClick={handleOnClick}
            >
              {button}
            </button>
          </div>
        </div>
      </div>
      <div
        id={`content_${accordionContentId}`}
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
