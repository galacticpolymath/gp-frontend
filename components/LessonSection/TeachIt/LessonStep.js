/* eslint-disable quotes */
/* eslint-disable no-console */
import RichText from "../../RichText";
import { TbArrowsSplit2 } from "react-icons/tb";
import { HiLightBulb } from "react-icons/hi2";

const LessonStep = ({
  Step,
  Vocab,
  StepTitle,
  StepDetails,
  TeachingTips,
  VariantNotes,
  StepQuickDescription,
  className,
  id,
}) => {
  return (
    // Desktop Step Header
    <div id={id} className={`${className}`}>
      <div className="d-none d-sm-flex align-items-center gap-2 fs-5 mb-1">
        <h6 className="m-0 d-flex fw-semibold align-items-start">
          <span className="d-inline me-1 step-num-testing">{`${Step}.`}</span>
          <RichText
            className='d-inline-block lesson-step-title'
            content={StepTitle}
          />
        </h6>
      </div>
      {/* Mobile Step Header*/}
      <div className="d-flex d-sm-none gap-2 fs-5 mb-1 ml-2 w-100">
        <h6 className="m-0 d-inline-block fw-bold">
          <span className="d-inline me-1 step-num-testing">{`${Step}.`}</span>
          <RichText
            className="d-inline-block lesson-step-title"
            content={StepTitle}
          />
        </h6>
      </div>
      <div className="d-col col-12 col-lg-8">
        {/* Same Step Detail formatting */}
        <div className="ms-xs-0 ps-xs-0 ps-sm-3">
          <div className="mb-2 ps-0">
            <RichText
              className='fs-6 lesson-step-description'
              content={StepQuickDescription}
            />
          </div>
          {/* Partial border */}
          {StepDetails && (
            <div className="ps-1 border-left">
              <div className="d-flex align-items-start my-3 gap-2">
                <i className="bi bi-tools"></i>
                <RichText
                  className='lesson-step-details'
                  content={StepDetails}
                />
              </div>
            </div>
          )}
          {Vocab && (
            <div className="bg-white vocab px-2 py-2 mb-2 border border-gray shadow-sm rounded">
              <RichText
                className='m-0 p-0 vocabTxt lesson-step-vocab'
                content={Vocab}
              />
            </div>
          )}
          {VariantNotes && (
            <div className="d-flex align-items-start my-3 gap-2">
              <div>
                <TbArrowsSplit2
                  style={{ transform: "rotate(270deg)", fontSize: 22 }}
                />
              </div>
              <div>
                <RichText
                  content={VariantNotes}
                  className='lesson-step-variant-notes'
                />
              </div>
            </div>
          )}
          {TeachingTips && (
            <div className="d-flex align-items-start my-3 gap-2 ">
              <div>
                <HiLightBulb style={{ fontSize: 22 }} />
              </div>
              <div>
                <RichText
                  content={TeachingTips}
                  className="lesson-step-teaching-tips-testing"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonStep;
