import Link from 'next/link';
import PropTypes from 'prop-types';
import CollapsibleLessonSection from '../CollapsibleLessonSection';
import RichText from '../RichText';

const Overview = ({
  index,
  Description,
  EstLessonTime,
  ForGrades,
  TargetSubject,
  SteamEpaulette,
  Text,
  Tags,
}) => {
  return (
    <CollapsibleLessonSection
      className="Overview"
      index={index}
      SectionTitle="Overview"
      initiallyExpanded
    >
      <div className='container mb-4'>
        <div className="bg-light-gray px-4 py-2 mt-4 rounded-3 text-center">
          <div className="grid mx-auto gap-3 py-3">
            <div className='d-none d-sm-grid g-col g-col-md-4 bg-white p-3 rounded-3'>
              <i className="fs-3 mb-2 d-block bi-book-half"></i>
              <h5>Target Subject: </h5>
              <span>{TargetSubject}</span>
            </div>
            <div className='d-none d-sm-grid g-col g-col-md-4 bg-white p-3 rounded-3'>
              <i className="fs-3 mb-2 d-block bi-person-circle"></i>
              <h5>Grades: </h5>
              <span>{ForGrades}</span>
            </div>
            <div className='d-none d-sm-grid g-col g-col-md-4 bg-white p-3 rounded-3'>
              <i className="fs-3 mb-2 d-block bi-alarm"></i>
              <h5>Estimated Time: </h5>
              <span>{EstLessonTime}</span>
            </div>
          </div>
          <Link passHref href="#learning_standards">
            <h5>Subject breakdown by standard alignments: </h5>
            {SteamEpaulette && SteamEpaulette.url && (
              <img
                src={SteamEpaulette.url}
                alt="Subject breakdown by standard alignments"
              />
            )}

          </Link>
        </div>

        <RichText className='mt-4' content={Text} />

        <h5 className='mt-4'>Keywords:</h5>
        {Tags && Tags.map(tag => (
          <span 
            key={tag.Value}
            className='fs-6 fw-light badge rounded-pill bg-white text-secondary border border-2 border-secondary me-2 mb-2 px-2'
          >
            {tag.Value}
          </span>
        ))}

        {Description && (
          <>
            <h3 className='mt-3'>Lesson Description</h3>
            <RichText content={Description} />
          </>
        )}
      </div>
    </CollapsibleLessonSection>
  );
};

Overview.propTypes = {
  index: PropTypes.number,
  Description: PropTypes.string,
  EstLessonTime: PropTypes.string,
  ForGrades: PropTypes.string,
  TargetSubject: PropTypes.string,
  SteamEpaulette: PropTypes.object,
  Text: PropTypes.string,
  Tags: PropTypes.array,
};

export default Overview;
