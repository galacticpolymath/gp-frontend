import Accordion from '../Accordion';
import RichText from '../RichText';

const LearningChart = ({
  Title,
  Description,
  Footnote,
  Badge,  
}) => {
  return (
    <div className='container pt-4'>
      {/* TODO: alt text */}
      <img alt="Learning Standards Chart" src={Badge.url} />

      <Accordion
        id="learningChart"
        buttonClassName='w-100 text-start my-3'
        button={(
          <div className='d-flex justify-content-between align-items-center'>
            <div className='fs-5'>{Title}</div>
            <i className="fs-4 bi-chevron-down"></i>
            <i className="fs-4 bi-chevron-up"></i>
          </div>
        )}
      >
        <RichText content={Description} />

        {Footnote && <RichText content={Footnote} />}
      </Accordion>
    </div>
  );
};

export default LearningChart;