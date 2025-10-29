/* eslint-disable quotes */
 
import UnitIconSvg from "../../../assets/img/gp-unit-icon.svg";
import { UNVIEWABLE_LESSON_STR } from "../../../globalVars";
import Pill from "../../Pill";
import LessonCard from "../LessonCard";
import Image from "next/image";

const getLessonImgSrc = (lesson) => {
  const { CoverImage, LessonBanner } = lesson;

  if (lesson.PublicationStatus === UNVIEWABLE_LESSON_STR) {
    return "https://storage.googleapis.com/gp-cloud/icons/coming-soon_Banner.png";
  }

  if (LessonBanner && !(CoverImage && CoverImage?.url)) {
    return LessonBanner;
  }

  return CoverImage?.url ?? LessonBanner;
};

const UnshowableLesson = () => (
  <div className="w-100 pointer d-flex justify-content-center align-items-center disable-underline-a-tags g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-grid p-3 bg-white rounded-3 cardsOnLessonPg">
    <p style={{ fontWeight: 700 }} className="text-center">
      Not shown on Lessons page.
    </p>
  </div>
);

const GpUnits = ({ units, didErrorOccur }) => {
  return (
    <section className="lessonsSection pt-1">
      <div className="ms-sm-4 galactic-black mb-2 mb-sm-4 text-left mt-4 mt-sm-0 mx-4">
        <div className="d-flex flex-column flex-sm-row">
          <Image
            src={UnitIconSvg}
            style={{ height: "fit-content" }}
            alt="GP Unit Icon"
          />
          <h4
            id="gp-units"
            style={{ scrollMarginTop: "100px" }}
            className="d-flex justify-content-center align-items-center"
          >
            Galactic Polymath Mini-Unit Releases
          </h4>
        </div>
        <p className="mt-2 mb-0">
          {" "}
          Each unit has 2-6 lessons created through 100s of collaborative hours
          by scientists, teachers, artists, and filmmakers.{" "}
        </p>
        <p>
          <em>And they&apos;re all free!</em>
        </p>
      </div>
      {!!units?.length && (
        <div className="mx-auto grid pb-1 p-4 gap-3 pt-3 pb-5">
          {units.map((unit, index) => {
            let PillComp = null;

            if (unit.isNew) {
              PillComp = <Pill txt="NEW" color="#0085C9" />;
            } else if (
              unit.PublicationStatus === "Beta" ||
              unit.PublicationStatus === "Draft"
            ) {
              PillComp = <Pill />;
            }

            return unit.PublicationStatus === "Proto" ? (
              <UnshowableLesson key={index} />
            ) : (
              <LessonCard
                key={unit._id}
                lesson={unit}
                lessonImgSrc={getLessonImgSrc(unit)}
                PillComp={PillComp}
              />
            );
          })}
        </div>
      )}
      {(didErrorOccur || !units?.length) && (
        <div className="px-4 pb-4 error-message-container">
          <p className="text-center text-sm-start">
            An error has occurred. Couldn&apos;t retrieve units. Please try
            again by refreshing the page.
          </p>
        </div>
      )}
    </section>
  );
};

export default GpUnits;
