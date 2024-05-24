/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import { useRef } from 'react';
import useLessonElementInView from '../../customHooks/useLessonElementInView';
import CollapsibleLessonSection from '../CollapsibleLessonSection';
import RichText from '../RichText';

const CollapsibleRichTextSection = ({
  Content,
  InitiallyExpanded,
  ...props
}) => {
  const { _sectionDots, SectionTitle } = props;
  const ref = useRef();

  useLessonElementInView(_sectionDots, SectionTitle, ref);

  return (
    <CollapsibleLessonSection initiallyExpanded={InitiallyExpanded} {...props}>
      <div
        ref={ref}
        className='container mx-auto mb-4'
      >
        <RichText className='mt-4' content={Content} />
      </div>
    </CollapsibleLessonSection>
  );
};

CollapsibleRichTextSection.propTypes = {
  Content: PropTypes.string,
};

export default CollapsibleRichTextSection;