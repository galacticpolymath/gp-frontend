/* eslint-disable no-console */
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import RichText from '../../RichText';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useEffect, useLayoutEffect, useState } from 'react';

const formatGrades = (grades) => {
  if (!grades) {
    return '';
  }

  const parsedGrades = (Array.isArray(grades) ? grades : grades.split(',')).map((x) => x.replace(/^0/, ''));

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

const CopyableTxt = ({ children }) => {
  const [isModalOn, setIsModalOn] = useState(false);
  const [modalTxt, setModalTxt] = useState("Copy text.")
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 })

  const handleOnClick = event => {
    if (event.target.innerHTML) {
      navigator.clipboard.writeText(event.target.innerHTML);
      setModalTxt("Text copied ✅!")
    };
  }

  const handleOnMouseEnter = _ => {
    setIsModalOn(true);
  }

  const handleOnMouseLeave = _ => {
    setIsModalOn(false);
    setModalTxt("Copy text.")
  }

  const handleOnMouseMove = event => {
    const { clientX, clientY } = event;
    setCoordinates({ x: clientX, y: clientY })
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleOnMouseMove);

    return () => {
      document.removeEventListener('click', handleOnMouseMove)
    }
  }, [])

  return (
    <div
      className='pointer'
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
      onClick={handleOnClick}
    >
      {isModalOn && (
        <div
          className='position-fixed rounded p-0 m-0'
          style={{
            position: 'fixed',
            width: "110px",
            left: `${coordinates.x + 10}px`,
            top: `${coordinates.y + (-20)}px`,
            backgroundColor: '#212529',
            textAlign: 'center'
          }}
        >
          <span
            className='text-white w-100 h-100 d-inline-flex justify-content-center align-items-center p-0 m-0'
            style={{
              fontSize: 12,
              transform: "translateY(-2px)"
            }}
          >
            {modalTxt}
          </span>
        </div>
      )}
      {children}
    </div>
  )
}

const StandardsGroup = ({
  id,
  codes,
  grades,
  alignmentNotes,
  statements,
}) => {
  const _grades = Array.isArray(grades) ? grades.join(',') : grades;

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
                <strong>{code}:</strong> {[].concat(statements)[i]}&nbsp;&nbsp;
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
          <CopyableTxt>
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