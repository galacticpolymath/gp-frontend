/* eslint-disable no-debugger */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable curly */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-console */
import { format } from 'date-fns';
import Image from 'next/image';
import RichText from '../../../../../components/RichText';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Lessons from '../../../../../backend/models/lesson';
import { connectToMongodb } from '../../../../../backend/utils/connection';
import { getLinkPreview } from "link-preview-js";
import GistCard from '../../../../../components/LessonSection/GistCard';
import LessonPartBtn from '../../../../../components/LessonSection/TeachIt/LessonPartBtn';
import { FiExternalLink } from 'react-icons/fi';
import QRCode from "react-qr-code";
import { getLatestSubRelease } from '../../../../../helperFns/getLatestSubRelease';
import Logo from '../../../../../assets/img/galactic_polymath_white.png';
import { useState, useEffect } from 'react';
import CustomLink from '../../../../../components/CustomLink';

const LessonPreview = ({ lesson }) => {
  const latestSubRelease = lesson?.Section ? getLatestSubRelease(lesson?.Section) : {};
  const router = useRouter();
  const [linkUrlDomain, setLinkUrlDomain] = useState('')
  const isLesson4 = router.query.id === '4';
  let sectionComps = null;

  useEffect(() => {
    setLinkUrlDomain(window.location.origin)
  }, []);

  if (lesson) {
    sectionComps = Object.values(lesson.Section).filter(({ SectionTitle }) => SectionTitle !== 'Procedure');
    sectionComps[0] = { ...sectionComps[0], SectionTitle: 'Overview' };
    sectionComps = sectionComps.filter(({ SectionTitle }) => !!SectionTitle)
  }

  if (!lesson && (typeof window === "undefined")) {
    return null;
  }

  if (!lesson) {
    router.replace('/error');
    return null;
  }

  const { CoverImage, LessonBanner } = lesson;
  const lessonBannerUrl = CoverImage?.url ?? LessonBanner;
  const sponsorLogoImgUrl = lesson?.SponsorImage?.url?.length ? lesson?.SponsorImage?.url : lesson.SponsorLogo
  let lessonParts = lesson?.Section?.['teaching-materials']?.Data?.classroom?.resources?.[0]?.lessons;

  if ((typeof window === 'undefined') && (!lesson || !lessonParts)) {
    return null;
  }

  if (!lesson || !lessonParts) {
    router.replace('/error');
    return null;
  }

  if ((typeof lessonParts === 'object') && (lessonParts !== null) && !Array.isArray(lessonParts)) {
    const _lessonParts = Object.entries(lessonParts).filter(([key]) => !Number.isNaN(parseInt(key)));
    lessonParts = _lessonParts.map(([, lessonPart]) => lessonPart);
  }

  if (lessonParts?.length) {
    lessonParts = lessonParts.filter(({ lsn }) => lsn !== 'last');
  }

  return (
    <div>
      <div style={{ backgroundColor: '#252525' }} className='w-100 d-flex justify-content-center align-items-center py-2'>
        <Image
          className='object-fit-contain'
          alt="Galactic Polymath"
          src={Logo}
          height={68}
          width={841}
          style={{
            maxHeight: '30px',
            width: 'auto',
            height: 'auto',
          }}

        />
      </div>
      <div style={{ maxWidth: 'none' }} className="container w-100 d-flex py-0 m-0 px-0">
        <div className="d-flex col-8 ps-2 mt-1">
          <div>
            <p style={{ fontWeight: 'lighter' }} className='mb-2'>
              Version {latestSubRelease.version}{' '}
              (Updated {format(new Date(latestSubRelease.date), 'MMM d, yyyy')})
            </p>
            <h1 id="lessonTitleId" className="mt-0 mb-1">{lesson.Title}</h1>
            <h4 className='fw-light'>{lesson.Subtitle}</h4>
            {lessonBannerUrl && (
              <div className='w-100 position-relative mt-2 mb-2'>
                <Image
                  src={lessonBannerUrl}
                  alt={lesson.Subtitle}
                  width={1500}
                  height={450}
                  priority
                  style={{ width: "100%", height: "auto", objectFit: 'contain' }}
                />
              </div>
            )}
            <GistCard
              isOnPreview
              EstLessonTime={lesson?.Section?.overview?.EstLessonTime}
              ForGrades={lesson.ForGrades}
              LearningSummary={lesson?.Section?.overview?.LearningSummary}
              TargetSubject={lesson.TargetSubject}
              SteamEpaulette={lesson?.Section?.overview?.SteamEpaulette}
              SteamEpaulette_vert={lesson?.Section?.overview?.SteamEpaulette_vert}
            />
          </div>
        </div>
        <div className='col-4 d-flex flex-column justify-content-center align-items-center position-relative'>
          <div
            style={{ top: 0, right: 0, borderBottomLeftRadius: "30px", backgroundColor: '#E1E2E3', width: "80%" }}
            className="position-absolute qrCodeImgAndTxtContainer"
          >
            <section className='ps-1 d-flex mt-4'>
              <section className='w-50 me-3 me-lg-0 d-flex justify-content-center align-items-center flex-column'>
                <Link
                  href={lesson.URL}
                  target='_blank'
                  style={{ lineHeight: "20px", fontSize: "18px", fontWeight: 400 }}
                  className='mt-1 text-black mt-lg-2 text-center px-2 px-lg-4'
                >
                  <div
                    className='mb-2  w-100 d-flex justify-content-center align-items-center'
                  >

                    <FiExternalLink
                      size={25}
                      style={{
                        transform: 'scale(1.5)',
                      }}
                      color='black'
                      className='ms-2'
                    />
                  </div>
                  Click or Scan for Access.
                </Link>

              </section>
              <section className='w-50 d-flex p-2'>
                <div className='position-relative d-flex w-100 flex-column d-flex justify-content-center align-items-center'>
                  <QRCode
                    style={{
                      height: "120%",
                      minHeight: "130px",
                      maxHeight: "150px",
                      width: "120%",
                      maxWidth: "150px",
                      minWidth: "70px",
                      right: ".5px",
                    }}
                    value={lesson.URL}
                  />

                </div>
              </section>
            </section>
            {lesson.ShortURL && (
              <section className='d-flex justify-content-center align-items-center'>
                <CustomLink
                  hrefStr={lesson.ShortURL}
                  className='serif-text no-link-decoration my-2'
                  fontSize="1.5em"
                >
                  {lesson.ShortURL}
                </CustomLink>
              </section>
            )}
          </div>
          {/* Spacer */}
          <div style={{ height: "180px" }} className="w-75" />
          <div className="w-90 d-flex flex-column px-1 ">

            <div className="d-flex w-100 flex-column">
              <div className='w-100'>
                <h5 className="text-center">
                  Sponsored by:
                </h5>
              </div>
              {sponsorLogoImgUrl && (
                <div className='w-100 d-flex justify-content-center align-items-center'>
                  <div
                    style={{ height: 130, width: 130 }}
                    className='position-relative'
                  >
                    <Image
                      src={Array.isArray(sponsorLogoImgUrl) ? sponsorLogoImgUrl[0] : sponsorLogoImgUrl}
                      alt={lesson.Subtitle}
                      className='position-absolute'
                      sizes="225px"
                      fill
                      style={{
                        objectFit: 'contain',
                        width: '100%',
                        height: "100%",
                      }}
                    />
                  </div>
                </div>
              )}
              <div
                className="w-100 mt-3"
              >
                <div
                  className="d-flex justify-content-center align-items-center "
                >
                  <RichText content={lesson.SponsoredBy} className={`${isLesson4 ? 'text-center' : ''}`} />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
      <div
        className='mt-4 pb-0 px-1'
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gap: "10px",
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(3, auto)',
        }}
      >
        {
          lessonParts.map((lessonPart, index) => {
            let {
              lsn,
              title,
              preface,
              tile,
              tags,
            } = lessonPart;
            tags = (tags?.length && Array.isArray(tags[0])) ? tags[0] : tags;
            tags = tags?.length ? tags.filter(tag => tag) : [];
            const previewTagsProp = tags.length ? { previewTags: tags } : {};

            return (
              <LessonPartBtn
                {...previewTagsProp}
                h3={<h3
                  style={{ color: '#2C83C3' }}
                  className='fs-5 fw-bold px-sm-0'
                >
                  <Link
                    href={`${linkUrlDomain}/lessons/${router.query.loc}/${router.query.id}#lesson_part_${lsn}`}
                    target='_blank'
                    style={{ fontWeight: 700 }}
                  >
                    {`Lesson ${lsn}: ${title}`}
                  </Link>
                </h3>}
                key={index}
                isLessonPreview
                prefaceClassName='text-start prefaceTxtLessonPreview'
                lsnNum={lsn}
                lsnTitle={title}
                lsnPreface={preface}
                lessonTileUrl={tile}
                lessonPartTxtContainerClassName='d-flex position-relative flex-column justify-content-between w-100 align-items-stretch mt-0'
                imgContainerDimensionObj={{ width: 100, height: 100 }}
                parentDivProps={{ className: 'pt-3 pb-2 w-100 bg-white d-flex flex-row' }}
                tileImgAndLessonInfoContainerClassName='d-flex h-100 justify-content-between w-100 position-relative flex-row-reverse'
              />
            )
          })
        }
      </div>
    </div>
  );
};

export const getStaticPaths = async () => {
  try {
    await connectToMongodb();

    const lessons = await Lessons.find({}, { numID: 1, locale: 1, _id: 0 }).lean()

    return {
      paths: lessons.map(({ numID, locale }) => ({
        params: { id: `${numID}`, loc: `${locale}` },
      })),
      fallback: false,
    };
  } catch (error) {
    console.error('An error has occurred in getting the available paths for the selected lesson page. Error message: ', error)
  }
};

async function getLinkPreviewObj(url) {
  try {
    const linkPreviewObj = await getLinkPreview(url);

    return linkPreviewObj;
  } catch (error) {
    const errMsg = `An error has occurred in getting the link preview for given url. Error message: ${error}.`;
    console.error(errMsg);

    return { errMsg }
  }
}

export const getStaticProps = async ({ params: { id, loc } }) => {
  try {
    await connectToMongodb();

    // add projections, get the target fields for the UI. 
    const targetLessons = await Lessons.find({ numID: id }, { __v: 0 }).lean();
    const targetLessonLocales = targetLessons.map(({ locale }) => locale)
    let lessonToDisplayOntoUi = targetLessons.find(({ numID, locale }) => ((numID === parseInt(id)) && (locale === loc)))

    if (!lessonToDisplayOntoUi || (typeof lessonToDisplayOntoUi !== 'object') || Array.isArray(lessonToDisplayOntoUi)) {
      return {
        props: {
          lesson: null,
          availLocs: null,
        },
      }
    }

    const multiMediaArr = lessonToDisplayOntoUi?.Section?.preview?.Multimedia;

    if (multiMediaArr?.length && multiMediaArr.some(({ type }) => type === 'web-app')) {
      let multiMediaArrUpdated = []

      for (let numIteration = 0; numIteration < multiMediaArr.length; numIteration++) {
        let multiMediaItem = multiMediaArr[numIteration]

        if (multiMediaItem.type === 'web-app') {
          const { errMsg, images, title } = await getLinkPreviewObj(multiMediaItem.mainLink)

          if (errMsg && !images?.length) {
            console.error('Failed to get the image preview of web app. Error message: ', errMsg)
          }

          multiMediaItem = {
            ...multiMediaItem,
            webAppPreviewImg: (errMsg || !images?.length) ? null : images[0],
            webAppImgAlt: (errMsg || !images?.length) ? null : `${title}'s preview image`,
          }
        }

        multiMediaArrUpdated.push(multiMediaItem)
      }

      lessonToDisplayOntoUi = {
        ...lessonToDisplayOntoUi,
        Section: {
          ...lessonToDisplayOntoUi?.Section,
          preview: {
            ...lessonToDisplayOntoUi?.Section?.preview,
            Multimedia: multiMediaArrUpdated,
          },
        },
      }
    }

    return {
      props: {
        lesson: JSON.parse(JSON.stringify(lessonToDisplayOntoUi)),
        availLocs: targetLessonLocales,
      },
    };
  } catch (error) {
    console.error('Faild to get lesson. Error message: ', error)

    return {
      props: {
        lesson: null,
        availLocs: null,
      },
    }
  }
};

export default LessonPreview;