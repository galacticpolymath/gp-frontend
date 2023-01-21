import React from 'react';
import Accordion from '../../Accordion';
import RichText from '../../RichText';

const formatGrades = (grades) => {
  if (!grades) {
    return '';
  }

  const parsedGrades = grades.split(',').map((x) => x.replace(/^0/, ''));
  if (parsedGrades.length === 1) {
    return `Grade: ${parsedGrades[0]}`;
  }
  return (
    `Grades: ${parsedGrades[0]}-${parsedGrades[parsedGrades.length - 1]}`
  );
};
export const formatAlignmentNotes = (text) => {
  return text.replace(/•/g, '-').replace(/\^2/g, '²');
};

const StandardsGroup = ({ codes, grades, alignmentNotes, statements }) => {
  return (
    <Accordion
      button={(
        <div>
          <p>{formatGrades(grades)}</p>
          {[].concat(codes).map((code, i) => (
            <p key={i}>
              <strong>{code}:</strong> {[].concat(statements)[i]}
            </p>
          ))}
        </div>
      )}
    >
      <>
        <h6>How does the lesson align to this standard?</h6>
        <RichText content={formatAlignmentNotes(alignmentNotes)} />
      </>
    </Accordion>
  );
};

export default StandardsGroup;