/* eslint-disable no-console */
import Link from 'next/link';
import PropTypes from 'prop-types';
import Image from 'next/image';
import CollapsibleLessonSection from '../CollapsibleLessonSection';
import RichText from '../RichText';
import { useRef } from 'react';
import useLessonElementInView from '../../customHooks/useLessonElementInView';


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
}) => {
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
      <div ref={ref} className='container mb-4'>
        <div className="bg-light-gray px-4 py-2 mt-4 rounded-3 text-center">
          {LearningSummary && (

            <div className="g-col-12 bg-white p-3 rounded-3 mt-2 text-start  align-items-center">
              <Image
                src="/imgs/gp_logo_gradient_transBG.png"
                alt="Galactic_PolyMath_First_Sec_Mobile_Info"
                style={{ objectFit: "contain" }}
                className="d-inline-flex me-2 mb-2"
                height={30}
                width={30}
              />
              <h5 className="d-inline-flex">The Gist:</h5>
              <div>
                {LearningSummary}
              </div>
            </div>
          )}
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
            <div className='d-sm-none g-col-12 align-items-center justify-content-center'>
              <div className='d-grid bg-white rounded-3 col-12 p-3'>
                <i className="fs-3 mb-2 d-block bi-book-half"></i>
                <h5>Target Subject: </h5>
                <span>{TargetSubject}</span>
              </div>
            </div>
            <div className='d-sm-none g-col-12 align-items-center justify-content-center'>
              <div className='d-grid bg-white rounded-3 col-12 p-3'>
                <i className="fs-3 mb-2 d-block bi-person-circle"></i>
                <h5>Grades: </h5>
                <span>{ForGrades}</span>
              </div>
            </div>
            <div className='d-sm-none g-col-12 align-items-center justify-content-center'>
              <div className='d-grid bg-white rounded-3 col-12 p-3'>
                <i className="fs-3 mb-2 d-block bi-alarm"></i>
                <h5>Estimated Time: </h5>
                <span>{EstLessonTime}</span>
              </div>
            </div>
          </div>

          {SteamEpaulette && SteamEpaulette.url && (
            <Link passHref href="#learning_standards">
              <div className='position-relative'>
                <div className="d-none d-sm-grid">
                  Subject breakdown by standard alignments:
                  <Image
                    src={SteamEpaulette.url}
                    alt="Subject breakdown by standard alignments"
                    priority
                    height={160}
                    width={2200}
                    style={{
                      objectFit: 'contain',
                      height: "auto",
                      width: "100%"
                    }}

                  />
                </div>



                <div className="d-sm-flex d-sm-none  row justify-content-start pb-2">
                  <Image
                    src={SteamEpaulette_vert.url}
                    alt="Subject breakdown by standard alignments"
                    priority
                    height={1320}
                    width={320}
                    style={{
                      objectFit: 'contain',
                      height: "80vw",
                      width: "auto"
                    }}
                    className='col p-0 d-flex align-self-end'
                  />
                  <div className="col text-start align-content-center mt-3">
                    <i class="bi bi-arrow-90deg-left fs-2 mb-0 d-flex "></i>
                    <div className="rounded p-1 mt-0 d-flex"
                      style={{ border: '2px solid ' }}>
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
  SteamEpaulette: PropTypes.object,
  Text: PropTypes.string,
  Tags: PropTypes.array,
};

export default Overview;
