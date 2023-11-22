/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import Accordion from '../Accordion';
import RichText from '../RichText';
import Image from 'next/image';
import useLessonElementInView from '../../customHooks/useLessonElementInView';
import { useRef } from 'react';

const LearningChart = ({
  Title,
  Description,
  Footnote,
  Badge,
  _sectionDots,
  SectionTitle,
}) => {
  console.log("Title: ", Title);
  console.log("SectionTitle yo there: ", SectionTitle)
  const ref = useRef();

  useLessonElementInView(_sectionDots, SectionTitle, ref);

  return (
    <div
      ref={ref}
      className="container pt-4"
      id="learning_standards"
    >
      <div className="chartContainer position-relative w-100">
        <Image
          src={Badge}
          width={1400}
          height={900}
          style={{
            objectFit: 'contain',
            width: '100%',
            height: 'auto',
          }}
          alt="Learning Standards Chart"
        />
      </div>
      <Accordion
        id="learningChart"
        buttonClassName="w-100 text-start my-3"
        button={(
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="fs-5 mb-0">{Title}</h3>
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
