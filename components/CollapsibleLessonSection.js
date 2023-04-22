/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable react/jsx-max-props-per-line */
import PropTypes from 'prop-types';
import { useRef } from 'react';
import useLessonElementInView from '../customHooks/useLessonElementInView';
import Accordion from './Accordion';

/**
 * A styled collapsible section of the Lesson Plan.
 */
const CollapsibleLessonSection = ({
  SectionTitle = '',
  className = '',
  children,
  initiallyExpanded = false,
  accordionId,
  _sectionDots,
  isAvailLocsMoreThan1,
}) => {
  const ref = useRef();
  const { h2Id } = useLessonElementInView(_sectionDots, SectionTitle, ref, isAvailLocsMoreThan1);
  const _h2Id = SectionTitle.toLowerCase().replace(/[0-9.]/g, "").trim().replace(/ /g, "-");
  
  
  return (
    <Accordion
      initiallyExpanded={initiallyExpanded}
      id={(accordionId || SectionTitle).replace(/[\s!]/gi, '_').toLowerCase()}
      className={`${className} collapsibleLessonSection`}
      buttonClassName="btn btn-primary-light w-100 text-left"
      button={(
        <div className='container position-relative mx-auto text-black d-flex justify-content-between align-items-center py-1'>
          <h2
            ref={ref}
            className='m-0'
            style={{ width: '100%', overflowWrap: 'break-word' }}
          >
            {SectionTitle}
          </h2>
          <i className="fs-3 bi-chevron-down"></i>
          <i className="fs-3 bi-chevron-up"></i>
          <div id={h2Id} style={{ height: 30, width: 30, transform: 'translateY(-150px)' }} className='position-absolute' />
          <div id={_h2Id} style={{ height: 30, width: 30, transform: 'translateY(-150px)' }} className='position-absolute' />
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
  initiallyExpanded: PropTypes.bool,
  accordionId: PropTypes.string,
};

export default CollapsibleLessonSection;
