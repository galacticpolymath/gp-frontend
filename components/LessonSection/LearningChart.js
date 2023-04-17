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
}) => {

  return (
    <div className='container pt-4'>
      <div className="chartContainer position-relative w-100" style={{ height: '500px', maxHeight: '80vw' }}>
        <Image
          src={Badge.url}
          fill
          sizes="(max-width: 575px) 521px, (max-width: 767px) 486px, (max-width: 991px) 550.5px, (max-width: 1199px) 594.992px, 835px"
          style={{ objectFit: 'contain' }}
          alt="Learning Standards Chart"
          priority
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