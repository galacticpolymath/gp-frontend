/* eslint-disable quotes */

import Image from "next/image";
import Link from "next/link";
import { BsGlobe } from "react-icons/bs";
import { useScrollCardIntoView } from "../../customHooks/useScrollCardIntoView";

const Tag = ({
  children,
  className = "",
  color = "gray",
  style = { whiteSpace: "normal" },
}) => {
  return (
    <span
      style={style}
      className={`no-underline-on-hover badge rounded-pill bg-${color} ml-3 ${className}`}
    >
      {children}
    </span>
  );
};

const LessonCard = ({ lesson, PillComp = null, lessonImgSrc }) => {
  const {
    _id,
    locale,
    numID,
    Subtitle,
    Title,
    Section,
    individualLessonsNum,
    willScrollIntoView,
    locals,
  } = lesson;
  const ref = useScrollCardIntoView(willScrollIntoView);

  return (
    <Link
      key={_id}
      href={`/lessons/${locale}/${numID}`}
      className="w-100 pointer 
      disable-underline-a-tags g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-grid p-3 bg-white rounded-3 lessonsPgShadow cardsOnLessonPg"
      ref={ref}
    >
      <div className="position-relative">
        <Image
          src={lessonImgSrc ?? "/imgs/gp-logos/GP_Stacked_logo+wordmark_gradient_whiteBG.jpg"}
          alt={Subtitle}
          width={15}
          height={4.5}
          sizes="100vw"
          className="p-0"
          style={{
            width: "100%",
            height: "auto",
          }}
          priority
        />
        {PillComp}
      </div>
      <div className="pt-2 ps-sm-3 d-grid">
        <h3
          style={{ textDecoration: "none" }}
          className="w-light text-black mb-0 no-underline-on-hover unit-txt-test"
        >
          {Title}
        </h3>
        <p
          style={{ fontWeight: 400, textDecoration: "none" }}
          className="text-black no-underline-on-hover unit-txt-test"
        >
          {Subtitle}
        </p>
        <section className="d-flex flex-wrap gap-1 align-self-end">
          <span
            className={`badge me-1 lessonSubject no-underline-on-hover unit-txt-test bg-${Section.overview.TargetSubject.toLowerCase().replace(
              /\s/g,
              " "
            )}`}
          >
            {Section.overview.TargetSubject}
          </span>
          <span
            style={{ whiteSpace: "normal" }}
            className="no-underline-on-hover badge rounded-pill bg-gray ml-3"
          >
            {`${Section.overview.GradesOrYears}: ${Section.overview.ForGrades}`}
          </span>
          <span
            style={{ whiteSpace: "normal" }}
            className="no-underline-on-hover badge rounded-pill bg-gray ml-3"
          >
            {`${individualLessonsNum} Lessons`}
          </span>
          {locals?.length ? (
            <Tag className="h-100">
              <span>
                <BsGlobe
                  style={{ transform: "scale(1.2) translateY(-.7px)" }}
                  className="me-1"
                />
              </span>
              {locals.map((local, index) => (
                <span
                  key={index}
                  style={{ fontWeight: 300 }}
                  className="list-item unit-txt-test"
                >
                  {local}
                </span>
              ))}
            </Tag>
          ) : null}
        </section>
      </div>
    </Link>
  );
};

export default LessonCard;
