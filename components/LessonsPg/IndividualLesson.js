import Image from "next/image";
import LessonCardWrapper from "./LessonCardWrapper";

const IndividualLesson = ({ lesson }) => {
  const { lessonPartTitle, preface } = lesson;
  // Component logic goes here
  console.log("Individual lesson: ", lesson)

  return (
    <LessonCardWrapper
      style={{ minHeight: 200 }}
      linkClassName='w-100 pointer disable-underline-a-tags g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-5 mx-auto d-grid p-2 rounded-3 lessonsPgShadow cardsOnLessonPg bg-white'
    >
      {/* START of section 1 */}
      {/* sub section 1 */}
      {/* put the title and the tile here */}
      {/* END OF sub section 1 */}
      {/* section for the lesson preface */}
      {/* put the preface of the lesson here */}
      {/* END of section of the lesson preface */}
      {/* END of section 1 */}
      <section style={{ height: "111px" }} className='d-flex justify-content-between w-100'>
        <section style={{ width: "70%" }} className='d-flex justify-content-end h-100 flex-column'>
          <h6 style={{ textDecoration: 'none', height: 'fit-content' }} className='w-100 w-light text-black mb-0 no-underline-on-hover'>{lessonPartTitle}</h6>
        </section>
        <section className='d-flex justify-content-end h-100 flex-column'>
          <div style={{ width: 90, height: 90 }} className="d-none d-lg-block position-relative">
            <Image
              src={lesson.tile}
              alt="lesson_tile"
              fill
              style={{ borderRadius: ".2em" }}
              sizes="130px"
              className="img-optimize h-100 w-100"
            />
          </div>
        </section>
      </section>
      <section style={{ height: "111px" }} className='d-flex mt-2'>
        <p style={{ fontWeight: 400, textDecoration: 'none', lineHeight: "22px" }} className='mb-0 text-black no-underline-on-hover'>{lesson.preface}</p>
      </section>
      <section className="d-flex flex-wrap gap-1 align-self-end">
        <span className={`badge me-1 lessonSubject no-underline-on-hover bg-${lesson.subject.toLowerCase().replace(/\s/g, ' ')}`}>
          {lesson.subject}
        </span>
        <span style={{ whiteSpace: 'normal' }} className="no-underline-on-hover badge rounded-pill bg-gray ml-3">
          {`${lesson.gradesOrYears}: ${lesson.grades}`}
        </span>
      </section>

      {/* START of section 2 */}
      {/* put the lesson info (duration, etc.)  */}
      {/* put the lesson tags */}
      {/* put the name of the unit of the lesson here */}
      {/* END of section 2 */}
      <section>

      </section>
    </LessonCardWrapper>
  );
};

export default IndividualLesson;
