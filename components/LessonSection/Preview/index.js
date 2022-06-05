import PropTypes from 'prop-types';

import RichText from '../../../components/RichText';

import CollapsibleLessonSection from '../../CollapsibleLessonSection';
import Carousel from './Carousel';

const Preview = ({
  index,
  SectionTitle,
  InitiallyExpanded,
  Multimedia,
  QuickPrep,
}) => {
  return (
    <CollapsibleLessonSection
      className="Preview CollapsibleTextSection"
      index={index}
      SectionTitle={SectionTitle}
      initiallyExpanded={InitiallyExpanded !== false}
    >
      <div className='container'>
        <Carousel items={Multimedia} />
        <div>
          <h5>&quot;Teach it in 15&quot; Quick Prep</h5>
          <RichText content={QuickPrep} />
        </div>
      </div>
    </CollapsibleLessonSection>
  );
};

Preview.propTypes = {
  Content: PropTypes.string,
};

export default Preview;
