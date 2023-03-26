/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import { useEffect } from 'react';

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
  
  return (
    <CollapsibleLessonSection
      index={index}
      SectionTitle={SectionTitle}
      initiallyExpanded={InitiallyExpanded !== false}
      _sectionDots={_sectionDots}
    >
      <div className='container row mx-auto pb-4 justify-content-center justify-content-sm-start'>
        <div className="col col-md-8 offset-md-2">
          <div className='bg-primary-light p-4 pb-2 fs-5 my-4 fw-light'>
            <h4>&quot;Teach it in 15&quot; Quick Prep</h4>
            <RichText content={QuickPrep} />
          </div>
        </div>
        {/* <Carousel items={Multimedia} /> */}
        <LessonsCarousel mediaItems={Multimedia} _sectionDots={_sectionDots} SectionTitle={SectionTitle} />
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
