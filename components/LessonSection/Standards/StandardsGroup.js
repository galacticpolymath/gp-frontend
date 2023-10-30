/* eslint-disable no-console */
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import RichText from '../../RichText';
import { useEffect, useState } from 'react';
import CopyableTxt from '../../CopyableTxt';

const formatGrades = (grades) => {
  if (!grades) {
    return '';
  }

  const parsedGrades = (Array.isArray(grades) ? grades : grades.split(',')).map((x) => x.replace(/^0/, ''));

  if (parsedGrades.length === 1) {
    return `Grade: ${parsedGrades[0]}`;
  }

  return `Grades: ${parsedGrades[0]}-${parsedGrades[parsedGrades.length - 1]}`;
};
export const formatAlignmentNotes = (text) => {
  return text.replace(/•/g, '-').replace(/\^2/g, '²');
};

const StandardsGroup = ({
  id,
  codes,
  grades,
  alignmentNotes,
  statements,
}) => {
  const _grades = Array.isArray(grades) ? grades.join(',') : grades;
  const handleClickToCopyTxt = event => {
    event.stopPropagation();
    navigator.clipboard.writeText(event.target.innerHTML);
  }

  return (
    <div className='border-bottom border-gray'>
      <Accordion
        id={id}
        buttonClassName='w-100 text-start bg-white border-0 p-3 pb-1'
        button={(
          <div>
            <h6 className='text-muted mb-2 w-100 d-flex justify-content-between'>
              {formatGrades(_grades)}
              <i className="fs-5 bi-chevron-down"></i>
              <i className="fs-5 bi-chevron-up"></i>
            </h6>
            {[].concat(codes).map((code, i) => (
              <div className='mb-0' key={i}>
                <CopyableTxt
                  implementLogicOnClick={handleClickToCopyTxt}
                >
                  <p>
                    <strong>{code}:</strong> {[].concat(statements)[i]}&nbsp;&nbsp;
                  </p>
                </CopyableTxt>
                <div className='text-muted text-center'>
                  <i className="bi bi-three-dots"></i>
                </div>
              </div>
            ))}
          </div>
        )}
      >
        <div className='p-3 ps-4 pb-1 bg-light-gray'>
          <h6>How does the lesson align to this standard?</h6>
          <CopyableTxt
            implementLogicOnClick={handleClickToCopyTxt}
          >
            <RichText content={formatAlignmentNotes(alignmentNotes)} />
          </CopyableTxt>
        </div>
      </Accordion>
    </div>
  );
};

StandardsGroup.propTypes = {
  id: PropTypes.string.isRequired,
  grades: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  codes: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  statements: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  alignmentNotes: PropTypes.string,
};

export default StandardsGroup;