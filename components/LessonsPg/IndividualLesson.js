import Image from 'next/image';
import LessonCardWrapper from './LessonCardWrapper';
import RichText from '../RichText';
import { useScrollCardIntoView } from '../../customHooks/useScrollCardIntoView';

const IndividualLesson = ({ lesson, Pill }) => {
  const { lessonPartTitle, tags, _id, lessonPartPath } = lesson;
  const lessonCardRef = useScrollCardIntoView(lesson.willScrollIntoView);

  return (
    <LessonCardWrapper
      _id={_id}
      href={lessonPartPath}
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        minWidth: '240px',
      }}
      linkClassName='individualLessonsWrapper pointer py-2 py-sm-0 disable-underline-a-tags g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-sm-grid p-2 p-lg-2 rounded-3 lessonsPgShadow cardsOnLessonPg bg-white'
    >
      <section
        ref={lessonCardRef}
        className='individualLessonImgSec d-flex flex-grow-1 justify-content-between w-100'
      >
        <section
          style={{ width: '70%' }}
          className='d-flex justify-content-end flex-column pe-1'
        >
          <h6
            style={{
              textDecoration: 'none',
              height: 'fit-content',
              fontWeight: 700,
              fontSize: 21,
            }}
            className='mt-2 mt-sm-0 w-100 w-light text-black mb-0 no-underline-on-hover'
          >
            {lessonPartTitle}
          </h6>
        </section>
        <section className='d-flex justify-content-end flex-column'>
          <div style={{ height: 90, width: 90 }} className='position-relative'>
            {lesson.tile && (
              <Image
                src={lesson.tile}
                alt='lesson_tile'
                fill
                style={{ borderRadius: '.2em' }}
                sizes='130px'
                className='img-optimize h-100 w-100'
              />
            )}
            {Pill}
          </div>
        </section>
      </section>
      <section className='d-flex flex-grow-1 mt-2 mb-3'>
        <RichText
          style={{
            fontWeight: 400,
            textDecoration: 'none',
            lineHeight: '22px',
            whiteSpace: 'normal',
          }}
          className='mb-0 text-black no-underline-on-hover'
          content={lesson.preface}
        />
      </section>
      <section className='mt-auto flex-grow-1'>
        <section className='d-flex flex-wrap gap-1 align-self-end'>
          <span
            className={`badge me-1 lessonSubject no-underline-on-hover bg-${lesson.subject
              .toLowerCase()
              .replace(/\s/g, ' ')}`}
          >
            {lesson.subject}
          </span>
          <span
            style={{ whiteSpace: 'normal' }}
            className='no-underline-on-hover badge rounded-pill bg-gray'
          >
            {`${lesson.gradesOrYears}: ${lesson.grades}`}
          </span>
          {lesson.dur && (
            <span className='d-inline-flex no-underline-on-hover badge rounded-pill bg-gray'>
              <div className='h-100 w-50'>
                <i
                  style={{ fontSize: '16px' }}
                  className='mb-2 me-2 bi-alarm'
                />
              </div>
              <div className='h-100 d-flex justify-content-center align-items-center'>
                {lesson.dur} min
              </div>
            </span>
          )}
        </section>
        {!!tags?.length && (
          <section className='mt-1 d-flex tagPillContainer w-auto flex-wrap mt-2'>
            {tags.map((tag, index) => (
              <div
                key={index}
                style={{ border: 'solid .5px #2C83C3' }}
                className='rounded-pill badge bg-white p-2'
              >
                <span style={{ color: '#2C83C3', fontWeight: 450 }}>{tag}</span>
              </div>
            ))}
          </section>
        )}
        <p
          className='mt-sm-1'
          style={{
            transform: 'translateY(35%)',
            color: '#C1C1C1',
            fontSize: '18px',
            fontWeight: 400,
          }}
        >
          Part of: <i>{lesson.unitTitle}</i>
        </p>
      </section>
    </LessonCardWrapper>
  );
};

export default IndividualLesson;
