import React, { useState } from 'react';
import PropTypes from 'prop-types';

// import Image from "../../../components/StrapiImage";
import RichText from '../../components/RichText';
import Image from 'next/image';

const LearningChart = ({ Title, Description, Footnote, Badge }) => {
  const [expanded, expand] = useState(false);

  return (
    <div className="container LearningChart">
      <Image
        height={16}
        width={21}
        layout="responsive"
        src={Badge.url}
      />

      {/* <ExpansionPanel
        className="ExpansionPanel"
        expanded={expanded}
        onChange={() => expand(!expanded)}
      >
        <ExpansionPanelSummary
          className="ExpansionPanelSummary"
          expandIcon={<ExpandMoreIcon />}
        >
          <h3>{Title}</h3>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className="ExpansionPanelDetails">
          <RichText content={Description} />
          <RichText className="footnote" content={Footnote} />
        </ExpansionPanelDetails>
      </ExpansionPanel> */}
    </div>
  );
};

LearningChart.propTypes = {
  Title: PropTypes.string,
  Description: PropTypes.string,
  Footnote: PropTypes.string,
  Badge: PropTypes.object,
};

export default LearningChart;
