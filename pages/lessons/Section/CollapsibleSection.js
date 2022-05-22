import React, { useState } from 'react';
import PropTypes from 'prop-types';

const CollapsibleSection = ({
  index,
  SectionTitle = '',
  className = '',
  children,
  initiallyExpanded = false,
}) => {
  const [expanded, expand] = useState(initiallyExpanded);

  return null;// (
  // <ExpansionPanel
  //   className={"ExpansionPanel CollapsibleSection " + className}
  //   expanded={expanded}
  //   onChange={() => expand(!expanded)}
  // >
  //   <div
  //     className="SectionHeading"
  //     id={SectionTitle.replace(/\s+/g, "_").toLowerCase()}
  //   >
  //     <div className={classes.container}>
  //       <ExpansionPanelSummary
  //         className="ExpansionPanelSummary"
  //         expandIcon={<ExpandMoreIcon />}
  //       >
  //         <h2>
  //           {index}. {SectionTitle}
  //         </h2>
  //       </ExpansionPanelSummary>
  //     </div>
  //   </div>
  //   <ExpansionPanelDetails className={"ExpansionPanelDetails "}>
  //     {children}
  //   </ExpansionPanelDetails>
  // </ExpansionPanel>
  // );
};

CollapsibleSection.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.object,
  initiallyExpanded: PropTypes.bool,
};

export default CollapsibleSection;
