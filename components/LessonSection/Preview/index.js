/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

import RichText from '../../../components/RichText';
import useLessonElementInView from '../../../customHooks/useLessonElementInView';

import CollapsibleLessonSection from '../../CollapsibleLessonSection';
import Carousel from './Carousel';
import LessonsCarousel from './LessonsCarousel';

const Preview = ({
  index,
  SectionTitle,
  InitiallyExpanded,
  Multimedia,
  QuickPrep,
  _sectionDots,
}) => {
  const ref = useRef();
  
  useLessonElementInView(_sectionDots, SectionTitle, ref);

  return (
    <CollapsibleLessonSection
      index={index}
      SectionTitle={SectionTitle}
      initiallyExpanded={InitiallyExpanded !== false}
      _sectionDots={_sectionDots}
    >
      <div ref={ref} className='container row mx-auto pb-4 justify-content-center justify-content-sm-start'>
        <div className="col-12 col-md-8 offset-md-2">
          <div className='bg-primary-light p-2 p-sm-4 pb-sm-2 fs-5 my-4 fw-light'>
            <h4 className='text-center text-sm-start'>&quot;Teach it in 15&quot; Quick Prep</h4>
            <RichText content={QuickPrep} />
          </div>
        </div>
        {Multimedia?.[0] && <LessonsCarousel mediaItems={Multimedia} />}
      </div>
    </CollapsibleLessonSection>
  );
};

Preview.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
  InitiallyExpanded: PropTypes.bool,
  Multimedia: PropTypes.arrayOf(PropTypes.object),
  QuickPrep: PropTypes.string,
};

export default Preview;
