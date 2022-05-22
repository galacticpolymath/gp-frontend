import React, { useState } from 'react';
import PropTypes from 'prop-types';

import RichText from '../../../components/RichText';

// import Chunk from './Chunk';

const LessonPart = ({ partNum, partTitle, partPreface, chunks = [] }) => {
  const classes = useStyles();
  const [expanded, expand] = useState(false);

  const durList = chunks.map(({ chunkDur }) => chunkDur);

  return (null
  // <ExpansionPanel
  //   className={"ExpansionPanel LessonPart"}
  //   expanded={expanded}
  //   onChange={() => expand(!expanded)}
  // >
  //   <div
  //     id={partTitle.replace(/\s+/g, "_").toLowerCase()}
  //     className={"PartPreface " + classes.container}
  //   >
  //     <ExpansionPanelSummary
  //       className="ExpansionPanelSummary"
  //       expandIcon={<ExpandMoreIcon />}
  //     >
  //       <div>
  //         <h3>
  //           Part {partNum}: {partTitle}
  //         </h3>
  //         <RichText content={partPreface} />
  //       </div>
  //     </ExpansionPanelSummary>
  //   </div>
  //   <ExpansionPanelDetails className="ExpansionPanelDetails PartBody">
  //     <div>
  //       {chunks.map((chunk, i) => (
  //         <Chunk key={i} chunkNum={i} durList={durList} {...chunk} />
  //       ))}
  //     </div>
  //   </ExpansionPanelDetails>
  // </ExpansionPanel>
  );
};

LessonPart.propTypes = {
  partNum: PropTypes.number,
  partTitle: PropTypes.string,
  partDur: PropTypes.number,
  partPreface: PropTypes.string,
  chunks: PropTypes.array,
};

export default LessonPart;
