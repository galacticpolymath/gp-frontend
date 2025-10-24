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
  const { _sectionDots, SectionTitle, sectionClassNameForTesting } = props;
  const ref = useRef();
  const sectionTitle = SectionTitle.split(' ').slice(1).join('_');

  useLessonElementInView(_sectionDots, SectionTitle, ref);
  // section-testing

  return (
    <CollapsibleLessonSection initiallyExpanded={!!Content ? InitiallyExpanded : false} {...props}>
      <div
        ref={ref}
        className={`${sectionTitle}_collapsible_text_sec container mx-auto mb-4 ${sectionClassNameForTesting}`}
      >
        {typeof Content === "string" ? (
          <RichText
            className='mt-4'
            content={Content}
            sectionName={sectionTitle}
          />
        )
          :
          <p className='mt-1'>
            The content for '{sectionTitle}' cannot be displayed.
          </p>
        }
      </div>
    </CollapsibleLessonSection>
  );
};

CollapsibleRichTextSection.propTypes = {
  Content: PropTypes.string,
};

export default CollapsibleRichTextSection;