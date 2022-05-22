import React from 'react';
import PropTypes from 'prop-types';

import RichText from '../../components/RichText';

import CollapsibleSection from './CollapsibleSection';

const CollapsibleTextSection = ({
  index,
  SectionTitle,
  Content,
  InitiallyExpanded,
}) => {
  return null;//(
  //   <CollapsibleSection
  //     className="CollapsibleTextSection"
  //     index={index}
  //     SectionTitle={SectionTitle}
  //     initiallyExpanded={InitiallyExpanded !== false}
  //   >
  //     <div className={classes.container}>
  //       <RichText content={Content} />
  //     </div>
  //   </CollapsibleSection>
  // );
};

CollapsibleTextSection.propTypes = {
  Content: PropTypes.string,
};

export default CollapsibleTextSection;
