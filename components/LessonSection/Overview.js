import Link from 'next/link';
import PropTypes from 'prop-types';
import Image from 'next/image';
import RichText from '../RichText';
import { useRef } from 'react';
import useLessonElementInView from '../../customHooks/useLessonElementInView';
import Title from './Title';
import CarouselContainer from '../CarouselContainer';
import CarouselItem from '../CarouselItem';

const SPONSORS_TESTING_DATA = [
  // {
  //   name: {
  //     first: 'Tom',
  //     middle: '',
  //     last: 'Folland',
  //     prefix: 'Dr.',
  //   },
  //   location: {
  //     instition: 'University of Iowa',
  //     department: 'Department of Industrial Light and Magic',
  //     city: 'Iowa City',
  //     state: 'IA',
  //     country: 'USA',
  //   },
  // },
  {
    name: {
      first: 'Tom',
      middle: '',
      last: 'Folland',
      prefix: 'Dr.',
    },
    location: {
      instition: 'University of Iowa',
      department: 'Department of Industrial Light and Magic',
      city: 'Iowa City',
      state: 'IA',
      country: 'USA',
    },
  },
];

const Overview = ({
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
  ...titleProps
}) => {
  const ref = useRef();
  const { h2Id } = useLessonElementInView(_sectionDots, SectionTitle, ref);
  const _h2Id = SectionTitle.toLowerCase().replace(/[0-9.]/g, '').trim().replace(/ /g, '-');

  return (
    <div ref={ref} className='SectionHeading container mb-4 px-0 position-relative'>
      <div
        id={h2Id}
        style={{ height: 30, width: 30, transform: 'translateY(-45px)' }}
        className='position-absolute'
      />
      <div
        id={_h2Id}
        style={{ height: 30, width: 30, transform: 'translateY(-45px)' }}
        className='position-absolute'
      />
      <Title {...titleProps} />
      <div className="d-flex flex-column flex-xxl-row mt-sm-4 mt-md-0 mt-xxl-4 container px-0 mx-0">
        <div className="col-xxl-9 bg-light-gray px-4 py-2 rounded-3 text-center">
          {LearningSummary && (
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
          <div className="grid mx-auto gap-3 py-3 justify-content-center justify-content-sm-start">
            <div className='d-none d-sm-grid g-col g-col-6 g-col-sm-4 bg-white p-3 rounded-3'>
              <span>
                <i className="fs-3 mb-2 bi-book-half me-2"></i>
                <h5 className='d-inline-block' id='selectedLessonTitle'>Target Subject: </h5>
              </span>
              <div>{TargetSubject}</div>
            </div>
            <div className='d-none d-sm-grid g-col g-col-6 g-col-sm-4 bg-white p-3 rounded-3 '>
              <span>
                <i className="fs-3 mb-2 me-2 bi-person-circle"></i>
                <h5 className='d-inline-block'>Grades: </h5>
              </span>
              <div>{ForGrades}</div>
            </div>
            <div className='d-none d-sm-grid g-col g-col-sm-4 bg-white pt-sm-3 pe-sm-4 pb-sm-3 ps-sm-2 p-md-3 rounded-3'>
              <span>
                <i className="fs-3 mb-2 me-2 bi-alarm"></i>
                <h5 className='d-inline-block'>Estimated Time: </h5>
                <div>{EstLessonTime}</div>
              </span>
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
                  <div className="col text-start align-content-center mt-3">
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
        <div
          className="d-block d-xxl-block col-xxl-4 px-xxl-3 mt-3 mt-xxl-0"
        >
          <div style={{ backgroundColor: '#F9FBFF', borderRadius: '2em' }} className="border py-2">
            <CarouselContainer
              intervalTimeMs={5000}
              willShowBtns
              rightBtnContainerClassName='w-auto h-100 d-flex d-xxl-none justify-content-center align-items-center position-absolute end-0'
              leftBtnContainerClassName='w-auto h-100 d-flex d-xxl-none justify-content-center align-items-center position-absolute start-0'
              autoCarouselSecClassName="col-12 mt-0 px-0 px-md-4"
              parentStylesClassName="p-0 d-flex flex-column papersCarouselContainer position-relative"
              dotSecClassName='d-flex justify-content-center align-items-center pb-3 pt-sm-2 pt-xxl-0'
              dotStyle={{ transform: 'translateY(10px)' }}
            >
              {SPONSORS_TESTING_DATA.map((sponsor, index) => {
                const { name, location } = sponsor;
                const sponsorName = `${name.prefix} ${name.first} ${name.middle} ${name.last}`;
                const sponsorLocation = `${location.city}, ${location.state}, ${location.country}`;

                return (
                  <CarouselItem
                    key={index}
                    parentStyles='d-flex justify-content-center align-items-center'
                    secondChildDivClassName='px-1 pb-0 rounded w-100'
                    thirdChildDivClassName='px-md-1 border-0 sponsor-card'
                  >
                    <div className='d-flex flex-column flex-lg-row flex-xxl-column d-xxl-block'>
                      <section className="d-flex justify-content-center align-items-center col-12 col-lg-5 col-xxl-12">
                        <div className='position-relative sponsor-img-container rounded-circle border p-2'>
                          <img
                            src='/imgs/tom_folland.png'
                            alt='sponsor_testing_img'
                            style={{ objectFit: 'contain' }}
                            className='w-100 h-100 rounded-circle border'
                          />
                        </div>
                      </section>
                      <section className="col-12 d-flex justify-content-center align-items-center d-xxl-block col-lg-7 col-xxl-12">
                        <section className="d-none d-xxl-block">
                          <span className='fw-bold'>
                            feat.
                          </span>
                          <h2 className='fw-bold text-xxl-center d-flex justify-content-center align-items-center'>
                            {sponsorName}
                          </h2>
                        </section>
                        <ul className="px-2 d-none d-xxl-flex flex-column list-unstyled justify-content-xxl-center align-items-xxl-center">
                          <li className='mb-1 text-wrap w-100 text-xxl-center d-xxl-inline-flex justify-content-center align-items-center' style={{ fontSize: '22px', fontWeight: 500 }}>{location.instition}</li>
                          <li className='mb-1 text-wrap w-100 text-xxl-center d-xxl-inline-flex justify-content-center align-items-center' style={{ fontSize: '22px', fontWeight: 500, lineHeight: '27px' }}>{location.department}</li>
                          <li className='mb-1 text-wrap w-100 text-xxl-center d-xxl-inline-flex justify-content-center align-items-center' style={{ fontSize: '22px', fontWeight: 500 }}>{sponsorLocation}</li>
                        </ul>
                        <section className='d-xxl-none h-100 d-flex flex-column justify-content-center'>
                          <span className='fw-bold'>
                            feat.
                          </span>
                          <section className="d-flex flex-column">
                            <span className='text-wrap'>
                              <b>{sponsorName}</b> {location.instition}
                            </span>
                            <span className='text-wrap'>
                              {location.department}
                            </span>
                            <span className='text-wrap'>
                              {sponsorLocation}
                            </span>
                          </section>
                        </section>
                      </section>
                    </div>
                  </CarouselItem>
                );
              })
              }
            </CarouselContainer>
          </div>
        </div>
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
