/* eslint-disable no-console */
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import RichText from '../../RichText';
import { useState } from 'react';
import CopyableTxt from '../../CopyableTxt';
import CopyableTxtSpan from '../../CopyableTxtSpan';

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
        buttonClassName='w-100 text-start bg-white border-0 p-2 pb-1 default-cursor'
        button={(
          <div
            role='button'
            onClick={handleOnClick}
            data-bs-toggle='collapse'
            data-bs-target={`#content_${contentId}`}
          >
            <h6 className='text-muted w-100 d-flex justify-content-between'>
              {formatGrades(_grades)}
              <div
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
            {[].concat(codes).map((code, i) => {
              const statement = [].concat(statements)[i];

              return (
                <div className='mb-0 inline-block' key={i}>
                  <CopyableTxtSpan
                    implementLogicOnClick={event => {
                      handleClickToCopyTxt(event, `${codes}: ${alignmentNotes}`);
                    }}
                    copyTxtIndicator='Copy Standards Text'
                    copyTxtModalDefaultStyleObj={{
                      width: 'auto',
                      backgroundColor: '#212529',
                      textAlign: 'center',
                    }}
                    modalClassNameStr='position-fixed rounded px-2 m-0'
                  >
                    <strong>{code}:</strong>{' '}
                    {statement}
                  </CopyableTxtSpan>
                  <span
                    role='button'
                    onClick={handleOnClick}
                    data-bs-toggle='collapse'
                    data-bs-target={`#content_${contentId}`}
                    className='ms-2'
                  >
                    <p style={{ width: 80 }} className='d-inline-block'>
                      {isAccordionContentDisplayed ?
                        <i style={{ fontSize: '18px', width: 100 }} className="opacity-100 bi bi-x increase-icon-size " />
                        : (
                          <span className='selected-standard-highlight'>
                            ...?
                          </span>
                        )}
                    </p>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      >
        <div className='p-3 selected-standard mx-2'>
          <h6 className='my-1 bold pb-1 mb-1'>How does the lesson address this standard?</h6>
          <CopyableTxt
            implementLogicOnClick={event => {
              console.log("alignmentNotes, yo there! ", alignmentNotes)
              handleClickToCopyTxt(event, `${codes}: ${alignmentNotes}`);
            }}
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