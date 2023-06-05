import Image from 'next/image';
import Link from 'next/link';

const MILISECONDS_IN_A_MONTH = 2_592_000_000;

const LessonCard = ({ lesson }) => {
  const { locale, id, CoverImage, Subtitle, Title, Section, ReleaseDate } = lesson;
  const isNew = (new Date() - new Date(ReleaseDate)) < MILISECONDS_IN_A_MONTH;

  return (
    <Link
      key={locale + id}
      href={`/lessons/${locale}/${id}`}
      className='w-100 pointer disable-underline-a-tags g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-grid p-3 bg-white rounded-3 lessonsPgShadow cardsOnLessonPg'
    >
      <div className="position-relative">
        {(CoverImage && CoverImage.url) && (
          <Image
            src={CoverImage.url}
            alt={Subtitle}
            width={15}
            height={4.5}
            sizes='100vw'
            className='px-1 pt-1'
            style={{
              width: '100%',
              height: 'auto',
            }}
            priority
          />
        )}
        {isNew && (
          <div
            style={{
              width: '85px',
              border: 'solid 1px white',
              fontStyle: 'italic',
              height: '37.6px',
              fontSize: '25px',
              fontWeight: 500,
              transform: 'translate(10px, -15px)',
            }}
            className="position-absolute d-flex justify-content-center align-items-center shadow top-0 end-0 bg-primary text-white text-center p-1 rounded-3"
          >
            NEW
          </div>
        )}
      </div>
      <div className='pt-2 ps-sm-3 d-grid'>
        <h3 className='w-light text-black mb-0'>{Title}</h3>
        <p className='text-black no-link-decoration'>{Subtitle}</p>
        <section className="d-flex flex-wrap gap-1 align-self-end">
          <span className={`badge me-1 lessonSubject no-underline-on-hover bg-${Section.overview.TargetSubject.toLowerCase().replace(/\s/g, ' ')}`}>
            {Section.overview.TargetSubject}
          </span>
          <span style={{ whiteSpace: 'normal' }} className="no-underline-on-hover badge rounded-pill bg-gray ml-3">
            {`${Section.overview.GradesOrYears}: ${Section.overview.ForGrades}`}
          </span>
        </section>
      </div>
    </Link>
  );
};

export default LessonCard;
