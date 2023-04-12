/* eslint-disable quotes */
/* eslint-disable no-console */
import RichText from '../../RichText';
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
}) => {

  return (
    // Mobile
    <div className='mt-4 ms-sm-1 d-grid  align-items-center'>
      <div className='d-none d-sm-flex align-items-center gap-2 fs-5 mb-3'>
        <div className="badge bg-primary">{Step}</div>
        <h6 className='m-1 fs-5'>{StepTitle}</h6>
      </div>
      {/* All else */}
      <div className='d-flex d-sm-none gap-2 fs-5 mb-3 ml-2 w-100'>
        <div
          style={{ width: "31px", height: '29px' }} 
          className="badge bg-primary d-flex justify-content-left align-items-center"
        >{Step}
        </div>
        <h6 className='m-0 fs-5'>{StepTitle}</h6>
      </div>
      <div className='ms-xs-0 ms-sm-4 ps-xs-0 ps-sm-3 pe-1'>
        <RichText content={StepQuickDescription} />
        <RichText content={StepDetails} />
        {Vocab && (
          <div className="bg-white vocab p-3 pb-1 mb-4 ms-xs-sm-0 ms-sm-4 border border-gray shadow-sm rounded">
            <h6>Vocab</h6>
            <RichText content={Vocab} className="vocabTxt" />
          </div>
        )}
        {VariantNotes && (
          <div className='d-flex align-items-start my-3 gap-2'>
            <div>
              <TbArrowsSplit2 style={{ transform: "rotate(270deg)", fontSize: 22 }} />
            </div>
            <div>
              <RichText content={VariantNotes} />
            </div>
          </div>
        )}
        {TeachingTips && (
          <div className='d-flex align-items-start my-3 gap-2 '>
            <div>
              <HiLightBulb style={{ fontSize: 22 }} />
            </div>
            <div>
              <RichText content={TeachingTips} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonStep;