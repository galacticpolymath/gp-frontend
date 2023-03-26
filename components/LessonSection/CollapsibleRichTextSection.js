/* eslint-disable no-console */
import PropTypes from 'prop-types';
import CollapsibleLessonSection from '../CollapsibleLessonSection';
import RichText from '../RichText';

const CollapsibleRichTextSection = ({
  Content,
  InitiallyExpanded,
  ...props
}) => {
  console.log('props: ', props);
  return (
    <CollapsibleLessonSection initiallyExpanded={InitiallyExpanded} {...props}>
      <div className='container mx-auto mb-4'>
        <RichText className='mt-4' content={Content} />
      </div>
    </CollapsibleLessonSection>
  );
};

CollapsibleRichTextSection.propTypes = {
  Content: PropTypes.string,
};

export default CollapsibleRichTextSection;