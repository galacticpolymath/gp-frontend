import PropTypes from 'prop-types';
import CollapsibleLessonSection from '../CollapsibleLessonSection';
import RichText from '../RichText';

const CollapsibleRichTextSection = ({
  Content,
  InitiallyExpanded,
  ...props
}) => (
  <CollapsibleLessonSection initiallyExpanded={InitiallyExpanded} {...props}>
    <div className='container mx-auto mb-4'>
      <RichText className='mt-4' content={Content} />
      <h1>yolo</h1>
    </div>
  </CollapsibleLessonSection>
);

CollapsibleRichTextSection.propTypes = {
  Content: PropTypes.string,
};

export default CollapsibleRichTextSection;