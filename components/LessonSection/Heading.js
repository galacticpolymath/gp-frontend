/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable quotes */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import { useRef } from 'react';
import useLessonElementInView from '../../customHooks/useLessonElementInView';
// accordion-header lessonsPgSec
// bg-primary-light w-100 text-left

const Heading = ({ index, SectionTitle, _sectionDots, isAvailLocsMoreThan1 }) => {
  const ref = useRef();
  const { h2Id } = useLessonElementInView(_sectionDots, SectionTitle, ref, isAvailLocsMoreThan1);

  return (
    <div
      ref={ref}
      className='lessonsStandardsSec text-left bg-primary-light mb-4'
    >
      <div>
        <div className='position-relative'>
          <h2
            className="SectionHeading mb-0"
          >
            <div className='container mx-auto text-black d-flex justify-content-between align-items-center py-3'>
              {index && `${index}. `}{SectionTitle}
            </div>
          </h2>
          <div id={h2Id} style={{ height: 30, width: 30, transform: 'translateY(-180px)' }} className='position-absolute' />
        </div>
      </div>
    </div>
  );
};

Heading.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
};

export default Heading;