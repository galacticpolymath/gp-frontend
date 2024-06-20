/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import RichText from '../../RichText';
import { useState } from 'react';
import CopyableTxt from '../../CopyableTxt';

const CopyIcon = ({ color = 'white' }) => (
  <svg
    style={{ color }}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-copy"
    viewBox="0 0 16 16"
  >
    <path
      fillRule="evenodd"
      d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
    />
  </svg>
);

const formatGrades = grades => {
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
  const [contentId, setContentId] = useState('');
  const [isAccordionContentDisplayed, setIsAccordionContentDisplayed] = useState(false);

  const handleClickToCopyTxt = (event, txt) => {
    event.stopPropagation();
    navigator.clipboard.writeText(txt);
  };

  const handleOnClick = () => {
    setIsAccordionContentDisplayed(prevState => !prevState);
  };

  return (
    <div className='border-bottom border-gray'>
      <Accordion
        id={id}
        dataBsToggle={{}}
        setContentId={setContentId}
        buttonClassName='w-100 text-start bg-white border-0 p-2 pb-1 default-cursor pb-3'
        button={(
          <div className='position-relative'>
            <div
              role='button'
              onClick={handleOnClick}
              data-bs-toggle='collapse'
              data-bs-target={`#content_${contentId}`}
            >
              <h6 className='text-muted w-100 d-flex justify-content-between'>
                {formatGrades(_grades)}
                <div
                  className="d-flex justify-content-center flex-column h-100"
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
              <div className='bg-primary w-100 position-relative0'>
                <CopyableTxt
                  copyTxtModalDefaultStyleObj={{
                    position: 'fixed',
                    width: '110px',
                    backgroundColor: '#212529',
                    textAlign: 'center',
                    zIndex: 150,
                  }}
                  implementLogicOnClick={event => handleClickToCopyTxt(event, `${codes}: ${statements}`)}
                >
                  <div
                    role='button'
                    style={{
                      background: '#7F7F7F',
                      border: 'none',
                      width: 32,
                      height: 32,
                      transform: 'translate(10%, 10%)',
                    }}
                    className='end-0 d-flex justify-content-center align-items-center rounded-circle position-absolute'
                  >
                    <CopyIcon />
                  </div>
                </CopyableTxt>
              </div>
              {[].concat(codes).map((code, i) => {
                const statement = [].concat(statements)[i];

                return (
                  <div style={{ maxWidth: '90%' }} className='mb-0 inline-block' key={i}>
                    <strong>{code}:</strong>{' '}
                    {statement}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      >
        <div className='p-3 selected-standard mx-2'>
          <h6 className='my-1 bold pb-1 mb-1'>How does the lesson address this standard?</h6>
          <RichText content={formatAlignmentNotes(alignmentNotes)} />
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