import React, { useState } from 'react';
import PropTypes from 'prop-types';

// import Subject from './Subject';

const Standards = ({ Data }) => {
  const [expanded, expand] = useState(false);

  return (
    <div className="Standards container">
      {/* <ExpansionPanel
        className="ExpansionPanel"
        expanded={!expanded}
        onChange={() => expand(!expanded)}
      >
        <ExpansionPanelSummary
          className="ExpansionPanelSummary"
          expandIcon={<ExpandMoreIcon />}
        >
          <h3>Learning Standards</h3>
        </ExpansionPanelSummary>
        <div className={"clickInvitation"}>
          Note:&nbsp;
            <span className={"clickOn"}>
             Click on any standard
            <i className="fas fa-mouse-pointer" />
          </span>
        for details on how the lesson aligns to it.
    </div>
  <ExpansionPanelDetails className="ExpansionPanelDetails">
    <h3>Target Standard(s)</h3>
    {Data.filter(({ target }) => target).map((subject, i) => (
      <Subject initiallyExpanded key={"target-" + i} {...subject} />
    ))}
    <h3>Connected Standard(s)</h3>
    {Data.filter(({ target }) => !target).map((subject, i) => (
      <Subject key={"connected-" + i} {...subject} />
    ))}
  </ExpansionPanelDetails>
</ExpansionPanel> */}
    </div>
  );
};

Standards.propTypes = {
  Data: PropTypes.array,
};

export default Standards;
