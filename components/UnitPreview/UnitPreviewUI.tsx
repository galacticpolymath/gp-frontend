import { format } from 'date-fns';
import Link from 'next/link';
import LessonPartBtn from '../LessonSection/TeachIt/LessonPartBtn';
import RichText from '../RichText';
import Image from 'next/image';
import CustomLink from '../CustomLink';
import QRCode from 'react-qr-code';
import { FiExternalLink } from 'react-icons/fi';
import Logo from '../../assets/img/galactic_polymath_white.png';
import GistCard from '../LessonSection/GistCard';
import { ISubRelease } from '../../backend/models/Unit/Overview';
import { useRouter } from 'next/router';
import { INewUnitLesson } from '../../backend/models/Unit/types/teachingMaterials';
import { UNITS_URL_PATH } from '../../shared/constants';
import { ITargetStandardsCode } from '../../backend/models/Unit/types/standards';

interface ILessonPreviewUIProps {
  areTargetStandardsValid: boolean;
  TargetStandardsCodes: ITargetStandardsCode[];
  standards: Record<string, Omit<ITargetStandardsCode, 'set'>[]>;
  latestSubRelease: ISubRelease | null;
  Title: string | null;
  Subtitle: string | null;
  URL: string | null;
  lessonBannerUrl: string | null;
  EstLessonTime: string | null;
  ForGrades: string | null;
  LearningSummary: string | null;
  TargetSubject: string | null;
  SteamEpaulette: string | null;
  SteamEpaulette_vert: string | null;
  lessonUrl: string | null;
  shortUrl: string | null;
  isLesson4: boolean | null;
  SponsoredBy: string | null;
  sponsorLogoImgUrl?: string | string[] | null;
  lessonParts: (INewUnitLesson | null)[] | null;
}

const UnitPreviewUI = ({
  latestSubRelease,
  Title,
  Subtitle,
  lessonBannerUrl,
  EstLessonTime,
  ForGrades,
  LearningSummary,
  TargetSubject,
  SteamEpaulette,
  standards,
  areTargetStandardsValid,
  TargetStandardsCodes,
  lessonUrl,
  SteamEpaulette_vert,
  shortUrl,
  sponsorLogoImgUrl,
  isLesson4,
  SponsoredBy,
  lessonParts,
}: Partial<ILessonPreviewUIProps>) => {
  const linkUrlDomain =
    typeof window === 'undefined' ? '' : window.location.origin;
  const router = useRouter();

  return (
    <div>
      <div
        style={{ backgroundColor: '#252525' }}
        className='w-100 d-flex justify-content-center align-items-center py-2'
      >
        <Image
          className='object-fit-contain'
          alt='Galactic Polymath'
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
      <div
        style={{ maxWidth: 'none' }}
        className='container w-100 d-flex py-0 m-0 px-0'
      >
        <div className='d-flex col-8 ps-2 mt-1'>
          <div>
            {latestSubRelease && (
              <p style={{ fontWeight: 'lighter' }} className='mb-2'>
                Version {latestSubRelease.version} (Updated{' '}
                {format(new Date(latestSubRelease.date), 'MMM d, yyyy')})
              </p>
            )}
            <h1 id='lessonTitleId' className='mt-0 mb-1'>
              {Title}
            </h1>
            <h4 className='fw-light'>{Subtitle}</h4>
            {lessonBannerUrl && (
              <div className='w-100 position-relative mt-2 mb-2'>
                <Image
                  src={lessonBannerUrl}
                  alt='lesson banner'
                  width={1500}
                  height={450}
                  priority
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                />
              </div>
            )}
            <GistCard
              isOnPreview
              EstLessonTime={EstLessonTime}
              ForGrades={ForGrades}
              LearningSummary={LearningSummary}
              TargetSubject={TargetSubject}
              SteamEpaulette={SteamEpaulette}
              SteamEpaulette_vert={SteamEpaulette_vert}
              areTargetStandardsValid={!!areTargetStandardsValid}
              TargetStandardsCodes={TargetStandardsCodes}
              standards={
                standards as Record<string, Omit<ITargetStandardsCode, 'set'>[]>
              }
            />
          </div>
        </div>
        <div className='col-4 d-flex flex-column justify-content-center align-items-center position-relative'>
          <div
            style={{
              top: 0,
              right: 0,
              borderBottomLeftRadius: '30px',
              backgroundColor: '#E1E2E3',
              width: '90%',
            }}
            className='position-absolute qrCodeImgAndTxtContainer'
          >
            <section className='ps-1 d-flex mt-0'>
              <section className='w-50 me-3 me-lg-0 d-flex justify-content-center align-items-center flex-column'>
                {lessonUrl && (
                  <Link
                    href={lessonUrl}
                    target='_blank'
                    style={{
                      lineHeight: '20px',
                      fontSize: '18px',
                      fontWeight: 400,
                    }}
                    className='mt-1 text-black mt-lg-2 text-center px-2 px-lg-4'
                  >
                    <div className='mb-2  w-100 d-flex justify-content-center align-items-center'>
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
                )}
              </section>
              <section className='w-50 d-flex p-2'>
                <div className='position-relative d-flex w-100 flex-column d-flex justify-content-center align-items-center qr-code-lesson-preview'>
                  {lessonUrl && (
                    <QRCode
                      style={{
                        height: '10vh',
                        minHeight: '70px',
                        maxHeight: '200px',
                        width: '10vh',
                        maxWidth: '200px',
                        minWidth: '70px',
                        right: '.5px',
                      }}
                      value={lessonUrl}
                    />
                  )}
                </div>
              </section>
            </section>
            {shortUrl && typeof shortUrl === 'string' && (
              <section className='d-flex justify-content-center align-items-center'>
                <CustomLink
                  hrefStr={shortUrl}
                  className='serif-text no-link-decoration mb-2 mt-0 bitly-txt-link underline-on-hover'
                >
                  {shortUrl.replace('https://', '')}
                </CustomLink>
              </section>
            )}
          </div>
          {/* Spacer */}
          <div style={{ height: '180px' }} className='w-75' />
          <div className='w-90 d-flex flex-column px-1 '>
            <div className='d-flex w-100 flex-column'>
              <div className='w-100'>
                <h5 className='text-center'>Sponsored by:</h5>
              </div>
              {sponsorLogoImgUrl && (
                <div className='w-100 d-flex justify-content-center align-items-center'>
                  <div
                    style={{ height: 130, width: 130 }}
                    className='position-relative'
                  >
                    <Image
                      src={
                        Array.isArray(sponsorLogoImgUrl)
                          ? sponsorLogoImgUrl[0]
                          : sponsorLogoImgUrl
                      }
                      alt='sponsor-logo'
                      className='position-absolute'
                      sizes='225px'
                      fill
                      style={{
                        objectFit: 'contain',
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </div>
                </div>
              )}
              <div className='w-100 mt-3'>
                <div className='d-flex justify-content-center align-items-center '>
                  <RichText
                    content={SponsoredBy}
                    className={`${isLesson4 ? 'text-center' : ''}`}
                  />
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
          gap: '10px',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(3, auto)',
        }}
      >
        {!!lessonParts?.length &&
          lessonParts.map((lessonPart, index: number) => {
            let { lsn, title, preface, tile, tags } = lessonPart ?? {};
            tags = tags?.length && Array.isArray(tags[0]) ? tags[0] : tags;
            tags = tags?.length ? tags.filter((tag: string | null) => tag) : [];

            const previewTagsProp = tags.length ? { previewTags: tags } : {};

            return (
              <LessonPartBtn
                {...previewTagsProp}
                h3={(
                  <h3
                    style={{ color: '#2C83C3' }}
                    className='fs-5 fw-bold px-sm-0'
                  >
                    <Link
                      href={`${linkUrlDomain}/${UNITS_URL_PATH}/${router.query.loc}/${router.query.id}#lesson_part_${lsn}`}
                      target='_blank'
                      style={{ fontWeight: 700 }}
                    >
                      {`Lesson ${lsn}: ${title}`}
                    </Link>
                  </h3>
                )}
                key={index}
                isLessonPreview
                prefaceClassName='text-start prefaceTxtLessonPreview'
                lsnNum={typeof lsn === 'string' ? parseInt(lsn) : lsn}
                lsnTitle={title}
                lsnPreface={preface}
                lessonTileUrl={tile}
                lessonPartTxtContainerClassName='d-flex position-relative flex-column justify-content-between w-100 align-items-stretch mt-0'
                imgContainerDimensionObj={{ width: 100, height: 100 }}
                parentDivProps={{
                  className: 'pt-3 pb-2 w-100 bg-white d-flex flex-row',
                }}
                tileImgAndLessonInfoContainerClassName='d-flex h-100 justify-content-between w-100 position-relative flex-row-reverse'
              />
            );
          })}
      </div>
    </div>
  );
};

export default UnitPreviewUI;