import PropTypes from 'prop-types';
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

const StandardsGroup = ({ 
  id,
  codes,
  grades,
  alignmentNotes,
  statements,
}) => {
  return (
    <div className='border-bottom border-gray'>
      <Accordion
        id={id}
        buttonClassName='w-100 text-start bg-white border-0 p-3 pb-1'
        button={(
          <div>
            <h6 className='text-muted mb-2 w-100 d-flex justify-content-between'>
              {formatGrades(grades)}
              <i className="fs-5 bi-chevron-down"></i>
              <i className="fs-5 bi-chevron-up"></i>
            </h6>
            {[].concat(codes).map((code, i) => (
              <p className='mb-0' key={i}>
                <strong>{code}:</strong> {[].concat(statements)[i]}&nbsp;&nbsp;
                <i className="bi bi-three-dots text-muted text-center"></i>
              </p>
            ))}
          </div>
        )}
      >
        <div className='p-3 ps-4 pb-1 bg-light-gray'>
          <h6>How does the lesson align to this standard?</h6>
          <RichText content={formatAlignmentNotes(alignmentNotes)} />
        </div>
      </Accordion>
    </div>
  );
};

StandardsGroup.propTypes = {
  id: PropTypes.string.isRequired,
  grades: PropTypes.string,
  codes: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  statements: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  alignmentNotes: PropTypes.string,
};

export default StandardsGroup;