/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

import RichText from '../../../components/RichText';
import useLessonElementInView from '../../../customHooks/useLessonElementInView';

import CollapsibleLessonSection from '../../CollapsibleLessonSection';
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
      <div ref={ref} className='row mx-auto pb-4 justify-content-center'>
        <div className='infobox rounded-3 p-2 p-sm-4 fs-5 my-2 p-3 fw-light w-auto'>
          <h2 className='fw-light text-center'>&#8220;Teach it in 15&#8221;&nbsp; Quick Prep</h2>
          <RichText content={QuickPrep} className='d-flex justify-content-center quickPrep' />
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
