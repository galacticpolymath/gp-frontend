import Link from 'next/link';
import PropTypes from 'prop-types';
import Image from 'next/image';
import CollapsibleLessonSection from '../CollapsibleLessonSection';
import RichText from '../RichText';
import { useRef } from 'react';
import useLessonElementInView from '../../customHooks/useLessonElementInView';
import Title from './Title';

const Overview = ({
  index,
  LearningSummary,
  Description,
  EstLessonTime,
  ForGrades,
  TargetSubject,
  SteamEpaulette,
  SteamEpaulette_vert,
  Text,
  Tags,
  _sectionDots,
  SectionTitle,
  __component,
  ...titleProps
}) => {
  console.log(__component);
  const ref = useRef();
  
  useLessonElementInView(_sectionDots, SectionTitle, ref);
  
  return (
    <CollapsibleLessonSection
      className="Overview"
      index={index}
      SectionTitle={SectionTitle}
      initiallyExpanded
      _sectionDots={_sectionDots}
    >
      <div ref={ref} className='container mb-4 px-0'>
        <Title {...titleProps} />
        <div className="bg-light-gray px-4 py-2 rounded-3 text-center">
          {LearningSummary && (
            // put the GistCard here
            <div className="g-col-12 bg-white p-3 rounded-3 mt-2 text-start  align-items-center">
              <Image
                src="/imgs/gp_logo_gradient_transBG.png"
                alt="Galactic_PolyMath_First_Sec_Mobile_Info"
                style={{ objectFit: 'contain' }}
                className="d-inline-flex me-2 mb-2"
                height={30}
                width={30}
              />
              <h5 className="d-inline-flex">The Gist:</h5>
              <div>
                <RichText content={LearningSummary} />
              </div>
            </div>
          )}
          <div className="grid gap-3 py-3 justify-content-center">
            <div className='g-col-12 g-col-md-4 bg-white p-3 rounded-3'>
              <span >
                <i className="fs-3 mb-2 bi-book-half me-2"></i>
                <h5 className='d-inline-block' id='selectedLessonTitle'>Target Subject: </h5>
              </span>
              <div>{TargetSubject}</div>
            </div>
            <div className='g-col-12 g-col-md-4 bg-white p-3 rounded-3 '>
              <span>
                <i className="fs-3 mb-2 me-2 bi-person-circle"></i>
                <h5 className='d-inline-block'>Grades: </h5>
              </span>
              <div>{ForGrades}</div>
            </div>
            <div className='g-col-12 g-col-md-4 bg-white p-3 rounded-3'>
              <span>
                <i className="fs-3 mb-2 me-2 bi-alarm"></i>
                <h5 className='d-inline-block'>Estimated Time: </h5>
                <div>{EstLessonTime}</div>
              </span>
            </div>
            </div>

          {(SteamEpaulette && SteamEpaulette_vert) && (
            <Link passHref href="#learning_standards">
              <div className='position-relative'>
                <div className="d-none d-sm-grid">
                  Subject breakdown by standard alignments:
                  <Image
                    src={SteamEpaulette}
                    alt="Subject breakdown by standard alignments"
                    priority
                    height={160}
                    width={2200}
                    style={{
                      objectFit: 'contain',
                      height: 'auto',
                      width: '100%',
                    }}
                  />
                </div>
                <div className="d-sm-flex d-sm-none  row justify-content-start pb-2">
                  <Image
                    src={SteamEpaulette_vert}
                    alt="Subject breakdown by standard alignments"
                    priority
                    height={1320}
                    width={320}
                    style={{
                      objectFit: 'contain',
                      height: '80vw',
                      width: 'auto',
                    }}
                    className='col p-0 d-flex align-self-end'
                  />
                  <div className="col text-start align-content-left mt-3 mx-auto ps-0">
                    <i className="bi bi-arrow-90deg-left fs-2 mb-0 d-flex "></i>
                    <div
                      className="rounded p-1 mt-0 d-flex"
                      style={{ border: '2px solid ' }}
                    >
                      <h5>Subject breakdown by standard alignments</h5>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

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
  SteamEpaulette: PropTypes.string,
  Text: PropTypes.string,
  Tags: PropTypes.array,
};

export default Overview;
