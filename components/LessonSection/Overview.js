import Link from 'next/link';
import Image from 'next/image';
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
      <div className='container'>
        <div className="bg-light-gray px-4 py-2 mt-4 rounded-3 text-center">
          <div className="grid mx-auto gap-3 py-3">
            <div className='g-col g-col-md-4 bg-white p-3 rounded-3'>
              [img]
              <h5>Target Subject: </h5>
              <span>{TargetSubject}</span>
            </div>
            <div className='g-col g-col-md-4 bg-white p-3 rounded-3'>
              [img]
              <h5>Grades: </h5>
              <span>{ForGrades}</span>
            </div>
            <div className='g-col g-col-md-4 bg-white p-3 rounded-3'>
              [img]
              <h5>Estimated Time: </h5>
              <span>{EstLessonTime}</span>
            </div>
          </div>

          <Link passHref href="#learning_standards">
            <a>
              <h5>Subject breakdown by standard alignments: </h5>
              <Image
                layout="responsive"
                // TODO: actual alt text
                alt="Subject breakdown by standard alignments"
                width={2200}
                height={144}
                src={SteamEpaulette.url}
              />
            </a>
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
            <h3 className='mt-4'>Lesson Description</h3>
            <RichText content={Description} />
          </>
        )}
      </div>
    </CollapsibleLessonSection>
  );
};

Overview.propTypes = {
  index: PropTypes.number,
  EstLessonTime: PropTypes.string,
  ForGrades: PropTypes.string,
  TargetSubject: PropTypes.string,
  SteamEpaulette: PropTypes.object,
  Text: PropTypes.string,
  Tags: PropTypes.array,
};

export default Overview;
