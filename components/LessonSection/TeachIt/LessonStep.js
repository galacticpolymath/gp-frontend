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
    <div className='mt-4 ms-sm-3 d-flex justify-content-center align-items-center flex-column'>
      <div className='d-none d-sm-flex align-items-center gap-2 fs-5 mb-3'>
        <div className="badge bg-primary">{Step}</div>
        <h6 className='m-0 fs-5'>{StepTitle}</h6>
      </div>
      <div className='d-flex d-sm-none gap-2 fs-5 mb-3 w-100'>
        <div style={{ width: "31px", height: '29px' }} className="badge bg-primary d-flex justify-content-center align-items-center">{Step}</div>
        <h6 className='m-0 fs-5'>{StepTitle}</h6>
      </div>
      <div className='ms-sm-5'>
        <RichText content={StepQuickDescription} />
        <RichText content={StepDetails} />
        {Vocab && (
          <div className="bg-white vocab p-3 pb-1 mb-4 border border-white shadow">
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
          <div className='d-flex align-items-start my-3 gap-2'>
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