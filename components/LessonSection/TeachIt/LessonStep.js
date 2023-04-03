/* eslint-disable quotes */
/* eslint-disable no-console */
import RichText from '../../RichText';
import { faSplit } from '@fortawesome/free-solid-svg-icons';

const LessonStep = ({
  Step,
  Vocab,
  StepTitle,
  StepDetails,
  TeachingTips,
  VariantNotes,
  StepQuickDescription,
}) => {

  console.log("faSplit: ", faSplit);
  return (
    <div className='mt-4 ms-3'>
      <div className='d-flex align-items-center gap-2 fs-5 mb-3'>
        <div className="badge bg-primary">{Step}</div>
        <h6 className='m-0 fs-5'>{StepTitle}</h6>
      </div>
      <div className='ms-5'>
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
            [TODO: img]
            <RichText content={VariantNotes} />
          </div>
        )}
        {TeachingTips && (
          <div className='d-flex align-items-start my-3 gap-2'>
            [TODO: img]
            <RichText content={TeachingTips} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonStep;