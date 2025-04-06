import ChunkGraph from './ChunkGraph';
import LessonStep from './LessonStep';
import RichText from '../../RichText';

const Chunk = ({
  chunkTitle,
  steps,
  chunkNum,
  chunkDur,
  durList,
  lessonNum
}) => {
  return (
    <div className='mb-3'>
      <h6 className='fw-bold mb-0 text-primary ms-1'>
        <span>
          <i className='bi bi-hourglass-split pe-1'></i>
          <RichText className='d-inline-block' content={`${chunkDur} min: ${chunkTitle}`} />
        </span>
      </h6>
      <div className='d-col col-12 col-lg-7'>
        <ChunkGraph
          className={`mt-0 chunk-graph-${lessonNum}-${chunkNum} chunk-graph-testing`}
          durList={durList}
          chunkNum={chunkNum}
        />
      </div>
      <div className='border-l'>
        {(steps ?? []).map((step, index) => {
          const stepId = `${step.StepTitle.split(" ").join("-")}-${index}`.replace("'", "");

          return <LessonStep key={step.Step} className={`mt-3 ms-sm-1 d-grid align-items-center`} id={stepId} {...step} />
        })}
      </div>
    </div>
  );
};

export default Chunk;