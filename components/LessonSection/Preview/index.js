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
      <div className='container row mx-auto'>
        <Carousel items={Multimedia} />
        <div className="col col-md-8 offset-md-2">
          <div className='bg-info p-4 pb-2 fs-5 fw-light'>
            <h4>&quot;Teach it in 15&quot; Quick Prep</h4>
            <RichText content={QuickPrep} />
          </div>
        </div>
      </div>
    </CollapsibleLessonSection>
  );
};

Preview.propTypes = {
  Content: PropTypes.string,
};

export default Preview;
