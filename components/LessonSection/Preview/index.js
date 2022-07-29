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
      index={index}
      SectionTitle={SectionTitle}
      initiallyExpanded={InitiallyExpanded !== false}
    >
      <div className='container row mx-auto pb-4'>
        <div className="col col-md-8 offset-md-2">
          <div className='bg-info p-4 pb-2 fs-5 my-4 fw-light'>
            <h4>&quot;Teach it in 15&quot; Quick Prep</h4>
            <RichText content={QuickPrep} />
          </div>
        </div>
        <Carousel items={Multimedia} />
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
