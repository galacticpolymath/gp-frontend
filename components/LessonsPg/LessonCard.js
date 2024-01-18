import Image from 'next/image';
import Link from 'next/link';

// MAKE COMPONENT EXTENABLE FOR THE IMAGE
const LessonCard = ({ lesson, BetaPillComp }) => {
  const {
    _id,
    locale,
    numID,
    CoverImage,
    Subtitle,
    Title,
    Section,
    LessonBanner,
    individualLessonsNum,
  } = lesson;

  return (
    <Link
      key={_id}
      href={`/lessons/${locale}/${numID}`}
      className='w-100 pointer 
      disable-underline-a-tags g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-grid p-3 bg-white rounded-3 lessonsPgShadow cardsOnLessonPg'
    >
      <div className="position-relative">
        {(CoverImage && CoverImage.url) && (
          <Image
            src={CoverImage.url}
            alt={Subtitle}
            width={15}
            height={4.5}
            sizes='100vw'
            className='p-0'
            style={{
              width: '100%',
              height: 'auto',
            }}
            priority
          />
        )}
        {LessonBanner && !(CoverImage && CoverImage.url) && (
          <Image
            src={LessonBanner}
            alt={Subtitle}
            width={15}
            height={4.5}
            sizes='100vw'
            className='p-0'
            style={{
              width: '100%',
              height: 'auto',
            }}
            priority
          />
        )}
        {BetaPillComp}
      </div>
      <div className='pt-2 ps-sm-3 d-grid'>
        <h3 style={{ textDecoration: 'none' }} className='w-light text-black mb-0 no-underline-on-hover'>{Title}</h3>
        <p style={{ fontWeight: 400, textDecoration: 'none' }} className='text-black no-underline-on-hover'>{Subtitle}</p>
        <section className="d-flex flex-wrap gap-1 align-self-end">
          <span className={`badge me-1 lessonSubject no-underline-on-hover bg-${Section.overview.TargetSubject.toLowerCase().replace(/\s/g, ' ')}`}>
            {Section.overview.TargetSubject}
          </span>
          <span style={{ whiteSpace: 'normal' }} className="no-underline-on-hover badge rounded-pill bg-gray ml-3">
            {`${Section.overview.GradesOrYears}: ${Section.overview.ForGrades}`}
          </span>
          <span style={{ whiteSpace: 'normal' }} className="no-underline-on-hover badge rounded-pill bg-gray ml-3">
            {`${individualLessonsNum} Lessons`}
          </span>
        </section>
      </div>
    </Link>
  );
};

export default LessonCard;
