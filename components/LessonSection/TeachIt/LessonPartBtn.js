import Image from 'next/image';
import RichText from '../../RichText';

const LESSON_PART_BTN_COLOR = '#2C83C3';

const LessonPartBtn = ({
  parentDivProps,
  lsnNum,
  lsnTitle,
  isExpanded,
  highlightedBorderColor,
  lessonTileUrl,
  lsnPreface,
  previewTags,
  isOnAssessments,
  isLessonPreview,
  tileImgAndLessonInfoContainerClassName,
  lessonPartTxtContainerClassName,
  prefaceClassName,
  imgContainerDimensionObj = { width: 150, height: 150 },
  h3 = <h3
    style={{ color: LESSON_PART_BTN_COLOR }}
    className='fs-5 fw-bold px-sm-0'
  >
    {isOnAssessments ? 'Assessments' : `Lesson ${lsnNum}: ${lsnTitle}`}
  </h3>
}) => {
  let lessonPartLink = ''

  if (isLessonPreview && (typeof window !== 'undefined')) {
    lessonPartLink = window.location.href.split("/").filter((_, index, self) => (self.length - 1) !== index).join("/")
    console.log("lessonPartLink: ", lessonPartLink)
    // const urlSplitted = 
  }

  return (
    <div {...parentDivProps}>
      <div className='d-flex me-2'>
        <div className={tileImgAndLessonInfoContainerClassName}>
          <div
            className={lessonPartTxtContainerClassName}
          >
            <div
              className='lessonPartHeaderContainer d-flex position-relative justify-content-between'
            >

              {h3}
              {!isLessonPreview && (
                <div
                  className="rounded d-flex d-lg-none positive-absolute justify-content-center align-items-center"
                  style={{ width: 30, height: 30, border: `solid 2.3px ${isExpanded ? highlightedBorderColor : '#DEE2E6'}` }}
                >
                  <i
                    style={{ color: '#DEE2E6' }}
                    className="fs-4 bi-chevron-down"
                  />
                  <i
                    style={{ color: highlightedBorderColor }}
                    className="fs-4 bi-chevron-up"
                  />
                </div>
              )}
            </div>
            <div className='d-flex '>
              <RichText
                className={prefaceClassName}
                content={lsnPreface}
              />
            </div>
            {!!previewTags?.length && (
              <div
                className='d-flex tagPillContainer flex-wrap mt-2 w-100'
              >
                {previewTags.map((tag, index) => (
                  <div
                    key={index}
                    style={{ border: `solid .5px ${LESSON_PART_BTN_COLOR}` }}
                    className='rounded-pill badge bg-white p-2'
                  >
                    <span style={{ color: LESSON_PART_BTN_COLOR, fontWeight: 450 }}>
                      {tag}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* 'd-none arrow-down-lesson-part-container d-lg-flex' */}
          <div className='arrow-down-lesson-part-container d-flex'>
            {lessonTileUrl && (
              <div style={imgContainerDimensionObj} className="d-block position-relative me-3 me-lg-4">
                <Image
                  src={lessonTileUrl}
                  alt="lesson_tile"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="130px"
                  className="rounded img-optimize"
                />
              </div>
            )}
            {!isLessonPreview && (
              <div className="h-100 d-none d-sm-block">
                <div
                  className="rounded d-flex justify-content-center align-items-center"
                  style={{ width: 35, height: 35, border: `solid 2.3px ${isExpanded ? highlightedBorderColor : '#DEE2E6'}` }}
                >
                  <i
                    style={{ color: '#DEE2E6' }}
                    className="fs-4 bi-chevron-down"
                  />
                  <i
                    style={{ color: highlightedBorderColor }}
                    className="fs-4 bi-chevron-up"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default LessonPartBtn;
