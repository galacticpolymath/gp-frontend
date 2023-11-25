/* eslint-disable no-console */
import PropTypes from 'prop-types';
import { useRef } from 'react';
import useLessonElementInView from '../../../customHooks/useLessonElementInView';
import Accordion from '../../Accordion';
import Subject from './Subject';

const Standards = ({
  Data,
}) => {
  const ref = useRef();

  return (
    <div ref={ref} className='container mb-4 px-0'>
      <Accordion
        id="standards"
        initiallyExpanded
        buttonClassName='w-100 text-start mb-2'
        button={(
          <div className='d-flex justify-content-between align-items-center'>
            <h3 className='fs-5 mb-0'>Alignment Details</h3>
            <i className="fs-4 bi-chevron-down"></i>
            <i className="fs-4 bi-chevron-up"></i>
          </div>
        )}
      >
        <div>
          <div className='bg-primary-light p-3 mt-1 mb-3 mx-5 text-center'>
            <i className="bi-cursor" /> Click on any standard for details on how the lesson aligns to it.
          </div>
          <h4 className='fs-5 fw-bold mt-4'>Target Standard(s)</h4>
          <div className="mb-3">
            Skills and concepts directly taught or reinforced by this lesson
          </div>
          {Data.filter(({ target }) => target).map((subject, i) => (
            <Subject
              initiallyExpanded
              key={`target-${i}`}
              accordionId={`target-${i}`}
              {...subject}
            />
          ))}

          <h4 className='fs-5 fw-bold mt-4'>Connected Standard(s)</h4>
          <div className="my-3">
            Skills and concepts reviewed or hinted at in this lesson (for building upon)
          </div>
          {Data.filter(({ target }) => !target).map((subject, i) => (
            <Subject
              key={`connected-${i}`}
              accordionId={`connected-${i}`}
              {...subject}
            />
          ))}
        </div>
      </Accordion>
    </div>
  );
};

Standards.propTypes = {
  Data: PropTypes.array,
  LearningObj: PropTypes.string,
};

export default Standards;