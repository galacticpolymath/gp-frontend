/* eslint-disable no-console */
import Link from 'next/link';
import PropTypes from 'prop-types';
import Image from 'next/image';
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
  _sectionDots,
}) => {

  return (
    <CollapsibleLessonSection
      className="Overview"
      index={index}
      SectionTitle="Overview"
      initiallyExpanded
      _sectionDots={_sectionDots}
    >
      <div className='container mb-4'>
        <div className="bg-light-gray px-4 py-2 mt-4 rounded-3 text-center">
          <div className="grid mx-auto gap-3 py-3 justify-content-center justify-content-sm-start">
            <div className='d-none d-sm-grid g-col g-col-6 g-col-sm-4 bg-white p-3 rounded-3'>
              <i className="fs-3 mb-2 d-block bi-book-half"></i>
              <h5 id='selectedLessonTitle'>Target Subject: </h5>
              <span>{TargetSubject}</span>
            </div>
            <div className='d-none d-sm-grid g-col g-col-6 g-col-sm-4 bg-white p-3 rounded-3'>
              <i className="fs-3 mb-2 d-block bi-person-circle"></i>
              <h5>Grades: </h5>
              <span>{ForGrades}</span>
            </div>
            <div className='d-none d-sm-grid g-col g-col-sm-4 bg-white pt-sm-3 pe-sm-4 pb-sm-3 ps-sm-2 p-md-3 rounded-3'>
              <i className="fs-3 mb-2 d-block bi-alarm"></i>
              <h5>Estimated Time: </h5>
              <span>{EstLessonTime}</span>
            </div>
            <div className='d-grid d-sm-none g-col g-col-12 align-items-center justify-content-center'>
              <div className='d-grid bg-white rounded-3 col-12 py-3' style={{ width: '40vw', minWidth: '150px' }}>
                <i className="fs-3 mb-2 d-block bi-book-half"></i>
                <h5>Target Subject: </h5>
                <span>{TargetSubject}</span>
              </div>
            </div>
            <div className='d-grid d-sm-none g-col g-col-12 align-items-center justify-content-center'>
              <div className='d-grid bg-white rounded-3 col-12 py-3' style={{ width: '40vw', minWidth: '150px' }}>
                <i className="fs-3 mb-2 d-block bi-person-circle"></i>
                <h5>Grades: </h5>
                <span>{ForGrades}</span>
              </div>
            </div>
            <div className='d-grid d-sm-none g-col-12 align-items-center justify-content-center'>
              <div className='d-grid bg-white rounded-3 col-12 py-3' style={{ width: '40vw', minWidth: '150px' }}>
                <i className="fs-3 mb-2 d-block bi-alarm"></i>
                <h5>Estimated Time: </h5>
                <span>{EstLessonTime}</span>
              </div>
            </div>
          </div>
          <Link passHref href="#learning_standards">
            <h5>Subject breakdown by standard alignments: </h5>
            {SteamEpaulette && SteamEpaulette.url && (
              <div style={{ height: 'clamp(28px, 10vh, 138px)' }} className='position-relative'>
                <Image
                  src={SteamEpaulette.url}
                  alt="Subject breakdown by standard alignments"
                  fill
                  priority
                  sizes='100%'
                  style={{
                    objectFit: 'contain',
                  }}
                />
              </div>
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
