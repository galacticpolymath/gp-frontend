import Accordion from '../../Accordion';
import RichText from '../../RichText';

const Standards = ({
  // Data,
  LearningObj,
}) => {
  return (
    <div className='container mb-4'>
      <Accordion
        id="learningObj"
        initiallyExpanded
        buttonClassName='w-100 text-start mb-2'
        button={(
          <div className='d-flex justify-content-between align-items-center'>
            <div className='fs-5'>Learning Objectives</div>
            <i className="fs-4 bi-chevron-down"></i>
            <i className="fs-4 bi-chevron-up"></i>
          </div>
        )}
      >
        <RichText content={LearningObj} />
      </Accordion>

      <Accordion
        id="standards"
        initiallyExpanded
        buttonClassName='w-100 text-start mb-2'
        button={(
          <div className='d-flex justify-content-between align-items-center'>
            <div className='fs-5'>Alignment Details</div>
            <i className="fs-4 bi-chevron-down"></i>
            <i className="fs-4 bi-chevron-up"></i>
          </div>
        )}
      >
        <>
          <div className='bg-info p-3 mt-1 mb-3 mx-5 text-center'>
            <i className="bi-cursor" /> Click on any standard for details on how the lesson aligns to it.
          </div>

          <div className='fs-5 fw-bold mt-2'>Target Standard(s)</div>
          <div className="StandardsExpl">
            Skills and concepts directly taught or reinforced by this lesson
          </div>
          {/* TODO */}
          {/* {Data.filter(({ target }) => target).map((subject, i) => (
          <Subject
            initiallyExpanded
            key={`target-${i}`}
            {...subject}
          />
        ))} */}
          <div className='fs-5 fw-bold mt-2'>Connected Standard(s)</div>
          <div className="StandardsExpl">
            Skills and concepts reviewed or hinted at in this lesson (for building upon)
          </div>
          {/* TODO */}
          {/* {Data.filter(({ target }) => !target).map((subject, i) => (
          <Subject key={`connected-${i}`} {...subject} />
        ))} */}
        </>
      </Accordion>
    </div>
  );
};

export default Standards;