/* eslint-disable quotes */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
// accordion-header lessonsPgSec
// bg-primary-light w-100 text-left

const Heading = ({ index, SectionTitle, setSectionDots }) => {
  const { ref, inView } = useInView({ threshold: .2 });
  // WHAT THIS COMP WILL HAVE:
  // a setter that will control if the comp is view or not 

  // GOAL: when the comp is view, then insert a true boolean into the setter that controls whether or not its corresponding dot is blue. The comps corresponding blue dot will be blue
  // the comp's corresponding blue dot will be blue 
  // a true boolean is passed into the setter that controls whether or not its corresponding dot is blue
  // the comp is in view 

  // GOAL: when the comp is not in view, then its corresponding dot will not be blue 

  useEffect(() =>{
    console.log("setSectionDots: ", setSectionDots);
  }, [inView]);

  return (
    <div ref={ref} className='lessonsStandardsSec text-left bg-primary-light mb-4'>
      <div>
        <div>
          <h2
            className="SectionHeading mb-0"
            id={SectionTitle.replace(/\s+/g, '_').toLowerCase()}
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