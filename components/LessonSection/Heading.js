/* eslint-disable quotes */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import useLessonElementInView from '../../customHooks/useLessonElementInView';
// accordion-header lessonsPgSec
// bg-primary-light w-100 text-left

const Heading = ({ index, SectionTitle, _sectionDots }) => {
  const { ref, h2Id } = useLessonElementInView(_sectionDots, SectionTitle);

  return (
    <div
      // ref={ref}
      className='lessonsStandardsSec text-left bg-primary-light mb-4'
    >
      <div>
        <div>
          <h2
            className="SectionHeading mb-0"
            // id={h2Id}
          >
            <div className='container mx-auto text-black d-flex justify-content-between align-items-center py-3'>
              {index && `${index}. `}{SectionTitle}
            </div>
          </h2>
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