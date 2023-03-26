/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import Accordion from '../Accordion';
import RichText from '../RichText';
import Image from 'next/image';
import useLessonElementInView from '../../customHooks/useLessonElementInView';

const LearningChart = ({
  Title,
  Description,
  Footnote,
  Badge,
  _sectionDots,
}) => {

  return (
    <div className='container pt-4'>
      {/* TODO: alt text */}
      {/* <img
        alt="Learning Standards Chart"
        src={Badge.url}
        className="border"
      /> */}
      <div className="chartContainer position-relative w-100" style={{ height: '500px', maxHeight: '80vw' }}>
        <Image
          src={Badge.url}
          layout='fill'
          style={{ objectFit: 'contain' }}
          alt="Learning Standards Chart"
        />
      </div>
      <Accordion
        id="learningChart"
        buttonClassName='w-100 text-start my-3'
        button={(
          <div className='d-flex justify-content-between align-items-center'>
            <h3 className='fs-5 mb-0'>{Title}</h3>
            <i className="fs-4 bi-chevron-down"></i>
            <i className="fs-4 bi-chevron-up"></i>
          </div>
        )}
      >
        <>
          <RichText content={Description} />
          {Footnote && <RichText content={Footnote} />}
        </>
      </Accordion>
    </div>
  );
};

export default LearningChart;