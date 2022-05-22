import React from 'react';
import PropTypes from 'prop-types';

import RichText from '../../../components/RichText';


import CollapsibleSection from '../CollapsibleSection';
import Carousel from './Carousel';


const Preview = ({
  index,
  SectionTitle,
  InitiallyExpanded,
  Multimedia,
  QuickPrep,
}) => {
  return (
    <CollapsibleSection
      className="Preview CollapsibleTextSection"
      index={index}
      SectionTitle={SectionTitle}
      initiallyExpanded={InitiallyExpanded !== false}
    >
      <div className="container">
        <Carousel items={Multimedia} />
        <div className="quickPrep">
          <h5>&quot;Teach it in 15&quot; Quick Prep</h5>
          <RichText content={QuickPrep} />
        </div>
      </div>
    </CollapsibleSection>
  );
};

Preview.propTypes = {
  Content: PropTypes.string,
};

export default Preview;
