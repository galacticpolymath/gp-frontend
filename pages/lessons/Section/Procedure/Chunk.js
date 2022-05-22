import { Box } from "@material-ui/core";
import React from "react";

import Step from "./Step";
import Graph from "../../../../components/ChunkGraph/Graph";

const LessonChunk = ({ chunkTitle, steps = [], chunkNum, durList }) => {
  return (
    <div className="LessonChunk">
      <Box boxShadow={3} className="duration">
        <h5 className={"chunkTitle"}>{chunkTitle}</h5>
        <Graph durList={durList} chunkNum={chunkNum} />
      </Box>
      {steps.map((step, i) => (
        <Step key={i} {...step} />
      ))}
    </div>
  );
};

export default LessonChunk;
