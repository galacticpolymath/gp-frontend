import React from 'react';
import Accordion from '../../Accordion';

const LessonPart = ({
  partNum,
  partTitle,
  partDur,
  partPreface,
  chunks = [],
}) => {
  return (
    <Accordion
      buttonClassName='w-100 text-start'
      key={partNum}
      id={`part_${partNum}`}
      button={(
        <div>
          <h6>Part {partNum}: {partTitle}</h6>
          <div>{partPreface}</div>
        </div>
      )}
    >
      
    </Accordion>
  );
};

export default LessonPart;