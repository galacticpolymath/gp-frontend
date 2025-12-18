import { useRef } from 'react';
import useLessonElementInView from '../../customHooks/useLessonElementInView';
import CollapsibleLessonSection from '../CollapsibleLessonSection';
import RichText from '../RichText';
import JobVizConnections from './JobVizConnections';

const CollapsibleRichTextSection = ({
  Content,
  InitiallyExpanded,
  ...props
}) => {
  const { _sectionDots, SectionTitle, sectionClassNameForTesting, sectionTitleFromDb } = props;

  console.log('CollapsibleRichTextSection props: ', props);

  console.log('sectionTitleFromDb: ', sectionTitleFromDb);


  const ref = useRef();
  const sectionTitle = SectionTitle.split(' ').slice(1).join('_');

  useLessonElementInView(_sectionDots, SectionTitle, ref);

  if (sectionTitleFromDb === 'JobViz Career Connections') {
    console.log('jobvizConnections Content: ', Content);
    console.log('jobviz props: ', props);

    return (
      <CollapsibleLessonSection initiallyExpanded={Content ? InitiallyExpanded : false} {...props}>
        <div
          ref={ref}
          className={`${sectionTitle}_collapsible_text_sec container mx-auto mb-4 ${sectionClassNameForTesting}`}
        >
          {Array.isArray(Content) && Content.length > 0 ? (
            <JobVizConnections jobVizConnections={Content} unitName={props?.unitName} />
          ) : typeof Content === 'string' ? (
            <RichText
              className='mt-4'
              content={Content}
              sectionName={sectionTitle}
            />
          ) : (
            <p className='mt-1'>
              The content for '{sectionTitle}' cannot be displayed.
            </p>
          )}
        </div>
      </CollapsibleLessonSection>
    );
  }

  return (
    <CollapsibleLessonSection initiallyExpanded={Content ? InitiallyExpanded : false} {...props}>
      <div
        ref={ref}
        className={`${sectionTitle}_collapsible_text_sec container mx-auto mb-4 ${sectionClassNameForTesting}`}
      >
        {typeof Content === 'string' ? (
          <RichText
            className='mt-4'
            content={Content}
            sectionName={sectionTitle}
          />
        )
          : (
            <p className='mt-1'>
              The content for '{sectionTitle}' cannot be displayed.
            </p>
          )}
      </div>
    </CollapsibleLessonSection>
  );
};

export default CollapsibleRichTextSection;