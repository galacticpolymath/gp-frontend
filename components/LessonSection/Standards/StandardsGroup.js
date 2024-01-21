/* eslint-disable no-console */
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import RichText from '../../RichText';
import { useState } from 'react';
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
  };

  const [contentId, setContentId] = useState('');
  const [isAccordionContentDisplayed, setIsAccordionContentDisplayed] = useState(false);

  const handleOnClick = () => {
    setIsAccordionContentDisplayed(prevState => !prevState);
  };

  console.log('what is up there meng, codes: ', codes);
  console.log('statements stuff []: ', [].concat(statements));
  console.log('[].concat(codes: ', [].concat(codes));

  return (
    <div className='border-bottom border-gray'>
      <Accordion
        id={id}
        dataBsToggle={{}}
        setContentId={setContentId}
        buttonClassName='w-100 text-start bg-white border-0 p-2 pb-1 default-cursor'
        button={(
          <div>
            <h6 className='text-muted w-100 d-flex justify-content-between'>
              {formatGrades(_grades)}
              <div
                role='button'
                onClick={handleOnClick}
                data-bs-toggle='collapse'
                data-bs-target={`#content_${contentId}`}
                style={{ width: 50, height: 20 }}
                className="d-flex justify-content-center"
              >
                <i
                  color="#7A8489"
                  style={{ display: isAccordionContentDisplayed ? 'none' : 'block' }}
                  className="fs-5 bi-chevron-down"
                />
                <i
                  color="#7A8489"
                  style={{ display: isAccordionContentDisplayed ? 'block' : 'none' }}
                  className="fs-5 bi-chevron-up"
                />
              </div>
            </h6>
            {[].concat(codes).map((code, i) => (
              <div className='mb-0 inline-block' key={i}>
                <CopyableTxt
                  implementLogicOnClick={handleClickToCopyTxt}
                >
                  <div>
                    <strong>{code}:</strong>
                    <span className="ms-1">
                      {[].concat(statements)[i]}
                    </span>
                    <span 
                      role='button'
                      onClick={handleOnClick}
                      className='ms-1'
                    >
                      ...?
                    </span>
                  </div>
                </CopyableTxt>
              </div>
            ))}
          </div>
        )}
      >
        <div className='p-3 selected-standard mx-2'>
          <h6 className='my-1 bold pb-1 mb-1'>How does the lesson address this standard?</h6>
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