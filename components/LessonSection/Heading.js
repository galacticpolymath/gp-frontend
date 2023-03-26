/* eslint-disable quotes */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
// accordion-header lessonsPgSec
// bg-primary-light w-100 text-left

const Heading = ({ index, SectionTitle, _sectionDots }) => {
  const { ref, inView } = useInView({ threshold: .2 });
  const [, setSectionDots] = _sectionDots;
  const h2Id = SectionTitle.replace(/\s+/g, '_').toLowerCase();

  useEffect(() => {
    if (inView) {
      setSectionDots(sectionDots => sectionDots.map(sectionDot => {
        if ((sectionDot.sectionId === h2Id) && inView) {
          return {
            ...sectionDot,
            isInView: true,
          };
        }

        return {
          ...sectionDot,
          isInView: false,
        };
      }));
    }
  }, [inView]);

  return (
    <div ref={ref} className='lessonsStandardsSec text-left bg-primary-light mb-4'>
      <div>
        <div>
          <h2
            className="SectionHeading mb-0"
            id={h2Id}
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