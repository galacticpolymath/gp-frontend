/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import { useRef } from 'react';
import useLessonElementInView from '../../../customHooks/useLessonElementInView';
import CollapsibleLessonSection from '../../CollapsibleLessonSection';
import LessonsCarousel from './LessonsCarousel';

const Preview = ({
  index,
  SectionTitle,
  InitiallyExpanded,
  Multimedia,
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
      <div ref={ref} className='row mx-auto pb-4 justify-content-center pt-4'>
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
